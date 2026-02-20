import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type PaginationState,
} from "@tanstack/react-table";

import { useMemo, useState } from "react";

interface GradebookSectionBreakdown {
    attempted: boolean;
    label: string;
    percent: number;
    score_earned: number;
    score_possible: number;
    subsection_name: string;
}

interface GradebookResult {
    user_id: number;
    username: string;
    email: string;
    percent: number;
    section_breakdown?: GradebookSectionBreakdown[];
}

interface Props {
    data: GradebookResult[];
}

export function CourseGradebookTable({ data }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    /* ================= DYNAMIC SECTION LABELS ================= */

    const sectionLabels = useMemo(() => {
        const labels = new Set<string>();

        data.forEach((row) => {
            row.section_breakdown?.forEach((section) => {
                labels.add(section.label);
            });
        });

        return Array.from(labels).sort();
    }, [data]);

    /* ================= COLUMNS ================= */

    const columns = useMemo<ColumnDef<GradebookResult>[]>(() => {
        const baseColumns: ColumnDef<GradebookResult>[] = [
            { accessorKey: "user_id", header: "User ID" },
            { accessorKey: "username", header: "Username" },
            { accessorKey: "email", header: "Email" },
            {
                accessorKey: "percent",
                header: "Overall %",
                cell: (info) =>
                    `${((info.getValue() as number) * 100).toFixed(1)}%`,
            },
        ];

        const dynamicColumns: ColumnDef<GradebookResult>[] =
            sectionLabels.map((label) => ({
                id: label,
                header: label,
                cell: (info) => {
                    const original = info.row.original;

                    const section = original.section_breakdown?.find(
                        (s) => s.label === label
                    );

                    if (!section) return "-";

                    return (
                        <div className="text-xs space-y-1">
                            <div className="font-medium">
                                {section.attempted ? "✓" : "○"}{" "}
                                {(section.percent * 100).toFixed(1)}%
                            </div>
                            <div className="text-gray-500">
                                {section.score_earned}/
                                {section.score_possible}
                            </div>
                            <div className="text-gray-400 truncate">
                                {section.subsection_name}
                            </div>
                        </div>
                    );
                },
            }));

        return [...baseColumns, ...dynamicColumns];
    }, [sectionLabels]);

    /* ================= TABLE ================= */

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters, pagination },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const filteredCount = table.getFilteredRowModel().rows.length;

    /* ================= EXPORT ================= */

    const exportCSV = () => {
        const headers = table
            .getAllLeafColumns()
            .map((col) => col.id)
            .join(",");

        const rows = table.getFilteredRowModel().rows.map((r) =>
            Object.values(r.original).join(",")
        );

        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "gradebook.csv";
        link.click();
    };

    const copyToClipboard = () => {
        const text = table
            .getFilteredRowModel()
            .rows.map((r) => Object.values(r.original).join("\t"))
            .join("\n");

        navigator.clipboard.writeText(text);
    };

    /* ================= UI ================= */

    return (
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                    Showing {filteredCount} of {data.length} filtered (Total{" "}
                    {data.length})
                </h2>

                <div className="flex gap-4 text-sm">
                    <button
                        onClick={copyToClipboard}
                        className="underline text-gray-600"
                    >
                        Copy to Clipboard
                    </button>

                    <button
                        onClick={exportCSV}
                        className="underline text-gray-600"
                    >
                        Download CSV
                    </button>

                    <button
                        onClick={() => table.resetColumnFilters()}
                        className="underline text-gray-600"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="px-3 py-2 text-left font-semibold cursor-pointer"
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {{
                                            asc: " ▲",
                                            desc: " ▼",
                                        }[
                                            header.column.getIsSorted() as string
                                        ] ?? ""}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-t hover:bg-gray-50"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="px-3 py-2"
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-sm">
                <div>
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}