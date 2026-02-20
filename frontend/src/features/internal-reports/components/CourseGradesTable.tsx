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
    type Column,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

interface CourseGradeResult {
    username: string;
    email: string;
    course_id: string;
    passed: boolean;
    percent: number;
    letter_grade: string | null;
}

interface Props {
    data: CourseGradeResult[];
}

export function CourseGradesTable({ data }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const ColumnFilter = ({ column }: { column: Column<CourseGradeResult, unknown> }) => {
        const value = column.getFilterValue() as string;

        if (column.id === "passed") {
            return (
                <select
                    value={value ?? ""}
                    onChange={(e) =>
                        column.setFilterValue(
                            e.target.value === ""
                                ? undefined
                                : e.target.value === "true"
                        )
                    }
                    className="mt-1 w-full text-xs border border-gray-200 rounded px-2 py-1"
                >
                    <option value="">All</option>
                    <option value="true">TRUE</option>
                    <option value="false">FALSE</option>
                </select>
            );
        }

        return (
            <input
                value={value ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                placeholder="Filter..."
                className="mt-1 w-full text-xs border border-gray-200 rounded px-2 py-1"
            />
        );
    };

    const columns = useMemo<ColumnDef<CourseGradeResult>[]>(() => [
        { accessorKey: "username", header: "Username", filterFn: "includesString" },
        { accessorKey: "email", header: "Email", filterFn: "includesString" },
        {
            accessorKey: "percent",
            header: "Percent",
            cell: (info) =>
                `${((info.getValue() as number) * 100).toFixed(1)}%`,
        },
        { accessorKey: "letter_grade", header: "Letter Grade" },
        {
            accessorKey: "passed",
            header: "Passed",
            cell: (info) =>
                info.getValue<boolean>() ? "TRUE" : "FALSE",
        },
    ], []);

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

    const exportCSV = () => {
        const headers = ["Username", "Email", "Percent", "Letter Grade", "Passed"];
        const rows = table.getFilteredRowModel().rows.map(r =>
            Object.values(r.original).join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "grades.csv";
        link.click();
    };

    const copyToClipboard = () => {
        const text = table.getFilteredRowModel().rows
            .map(r => Object.values(r.original).join("\t"))
            .join("\n");

        navigator.clipboard.writeText(text);
    };

    return (
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">

            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                    Showing {filteredCount} of {data.length} filtered (Total {data.length})
                </h2>

                <div className="flex gap-4 text-sm">
                    <button onClick={copyToClipboard} className="underline text-gray-600">
                        Copy to Clipboard
                    </button>

                    <button onClick={exportCSV} className="underline text-gray-600">
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

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <>
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            className="px-3 py-2 text-left font-semibold cursor-pointer"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: " ▲",
                                                desc: " ▼",
                                            }[header.column.getIsSorted() as string] ?? ""}
                                        </th>
                                    ))}
                                </tr>

                                <tr>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {header.column.getCanFilter() && (
                                                <ColumnFilter column={header.column} />
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="border-t hover:bg-gray-50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-3 py-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-sm">
                <div>
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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