import { useMemo, useState, memo, useCallback, useEffect, useRef } from "react";
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
import { Link } from "react-router-dom";
import type { WebinarWithParticipants } from "../types";

interface EventsTableProps {
    data: WebinarWithParticipants[];
}

export function EventsTable({ data }: EventsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 100,
    });

    const handleCopyToClipboard = async () => {
        if (!data || data.length === 0) return;

        const filteredData = table.getFilteredRowModel().rows.map((row) => row.original);
        const csv = convertToCSV(filteredData);

        try {
            await navigator.clipboard.writeText(csv);
            alert("Table data copied to clipboard!");
        } catch (error) {
            console.error("Failed to copy to clipboard:", error);
            alert("Failed to copy to clipboard");
        }
    };

    const handleDownloadCSV = () => {
        if (!data || data.length === 0) return;

        const filteredData = table.getFilteredRowModel().rows.map((row) => row.original);
        const csv = convertToCSV(filteredData);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `events-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = useMemo<ColumnDef<WebinarWithParticipants>[]>(
        () => [
            {
                id: "actions",
                header: "Actions",
                cell: (info) => {
                    const row = info.row.original;
                    return (
                        <Link
                            to={`/events/${row.id}`}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors inline-block"
                        >
                            See details
                        </Link>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
                size: 120,
            },
            {
                accessorKey: "id",
                header: "ID",
                cell: (info) => {
                    const value = info.getValue() as number;
                    return (
                        <Link
                            to={`/events/${value}`}
                            className="text-green-600 hover:text-green-700 hover:underline"
                        >
                            {value}
                        </Link>
                    );
                },
                filterFn: "includesString",
                size: 80,
            },
            {
                accessorKey: "title",
                header: "Title",
                cell: (info) => {
                    const value = info.getValue() as string;
                    return (
                        <div
                            className="truncate"
                            style={{
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                            title={value}
                        >
                            {value}
                        </div>
                    );
                },
                filterFn: "includesString",
                size: 250,
            },
            {
                accessorKey: "start_date",
                header: "Start Date",
                cell: (info) => formatDateIST(info.getValue() as string | null),
                filterFn: "includesString",
                size: 180,
            },
            {
                accessorKey: "end_date",
                header: "End Date",
                cell: (info) => formatDateIST(info.getValue() as string | null),
                filterFn: "includesString",
                size: 180,
            },
            {
                accessorKey: "speaker_name",
                header: "Speaker",
                cell: (info) => {
                    const value = info.getValue() as string;
                    return (
                        <div
                            className="truncate"
                            style={{
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                            title={value}
                        >
                            {value}
                        </div>
                    );
                },
                filterFn: "includesString",
                size: 150,
            },
            {
                accessorKey: "language",
                header: "Language",
                cell: (info) => <div>{info.getValue() as string}</div>,
                filterFn: "includesString",
                size: 100,
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: (info) => <div>{info.getValue() as string}</div>,
                filterFn: "includesString",
                size: 100,
            },
            {
                id: "registered_count",
                header: "Registered",
                accessorFn: (row) => row.registered_participants.length,
                cell: (info) => <div className="text-center">{info.getValue() as number}</div>,
                filterFn: "includesString",
                size: 100,
            },
            {
                id: "attended_count",
                header: "Attended",
                accessorFn: (row) => row.attended_participants.length,
                cell: (info) => <div className="text-center">{info.getValue() as number}</div>,
                filterFn: "includesString",
                size: 100,
            },
            {
                id: "paid_count",
                header: "Paid",
                accessorFn: (row) => row.paid_participants.length,
                cell: (info) => <div className="text-center">{info.getValue() as number}</div>,
                filterFn: "includesString",
                size: 100,
            },
            {
                accessorKey: "cancelled_at",
                header: "Cancelled",
                accessorFn: (row) => !!row.cancelled_at,
                cell: (info) => {
                    const value = info.getValue() as boolean;
                    return (
                        <span className={value ? "text-red-600 font-semibold" : "text-gray-500"}>
                            {formatBoolean(value)}
                        </span>
                    );
                },
                filterFn: "equals",
                size: 100,
            },
        ],
        []
    );

    const ColumnFilter = memo(
        ({ column }: { column: Column<WebinarWithParticipants, unknown> }) => {
            const columnFilterValue = column.getFilterValue();
            const isBoolean = column.id === "cancelled_at";

            const [localValue, setLocalValue] = useState<string>(
                (columnFilterValue ?? "") as string
            );

            const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

            useEffect(() => {
                setLocalValue((columnFilterValue ?? "") as string);
            }, [columnFilterValue]);

            const handleSelectChange = useCallback(
                (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value;
                    column.setFilterValue(value === "" ? undefined : value === "true");
                },
                [column]
            );

            const handleInputChange = useCallback(
                (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    setLocalValue(value);

                    if (timeoutRef.current) clearTimeout(timeoutRef.current);

                    timeoutRef.current = setTimeout(() => {
                        column.setFilterValue(value);
                    }, 300);
                },
                [column]
            );

            useEffect(() => {
                return () => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                };
            }, []);

            if (isBoolean) {
                return (
                    <select
                        value={(columnFilterValue ?? "") as string}
                        onChange={handleSelectChange}
                        className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">All</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                );
            }

            return (
                <input
                    type="text"
                    value={localValue}
                    onChange={handleInputChange}
                    placeholder={`Filter ${String(column.columnDef.header ?? "")}`}
                    className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
            );
        }
    );

    ColumnFilter.displayName = "ColumnFilter";

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        state: { sorting, columnFilters, pagination },
        initialState: { pagination: { pageSize: 100 } },
    });

    return (
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Events
                    <span className="ml-2 text-sm font-normal text-gray-600">
                        Showing {table.getRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} filtered{" "}
                        {table.getFilteredRowModel().rows.length === 1 ? "record" : "records"}{" "}
                        (Total: {data.length})
                    </span>
                </h2>

                <div className="flex items-center gap-3">
                    {data && data.length > 0 && (
                        <>
                            <button
                                onClick={handleCopyToClipboard}
                                className="text-sm text-green-600 hover:text-green-700 underline"
                                title="Copy filtered table data to clipboard"
                            >
                                Copy to clipboard
                            </button>
                            <button
                                onClick={handleDownloadCSV}
                                className="text-sm text-green-600 hover:text-green-700 underline"
                                title="Download filtered table data as CSV"
                            >
                                Download CSV
                            </button>
                        </>
                    )}

                    {columnFilters.length > 0 && (
                        <button
                            onClick={() => setColumnFilters([])}
                            className="text-sm text-green-600 hover:text-green-700 underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <>
                                <tr
                                    key={headerGroup.id}
                                    className="border-b border-gray-200 bg-white"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`py-3 px-3 font-semibold text-gray-900 ${
                                                header.id.includes("count") || header.id === "cancelled_at"
                                                    ? "text-center"
                                                    : "text-left truncate"
                                            }`}
                                            style={{
                                                width: `${100 / table.getAllColumns().length}%`,
                                                maxWidth: "20%",
                                            }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? "cursor-pointer select-none flex items-center gap-2"
                                                            : ""
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: " ↑",
                                                        desc: " ↓",
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>

                                <tr
                                    key={`${headerGroup.id}-filters`}
                                    className="bg-white border-b border-gray-100"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <th key={`${header.id}-filter`} className="px-3 pb-2">
                                            {header.column.getCanFilter() ? (
                                                <ColumnFilter column={header.column} />
                                            ) : null}
                                        </th>
                                    ))}
                                </tr>
                            </>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-gray-100 last:border-b-0 hover:bg-green-50/30 transition-colors"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={`py-3 px-3 text-gray-900 ${
                                            cell.column.id.includes("count") || cell.column.id === "cancelled_at"
                                                ? "text-center"
                                                : ""
                                        }`}
                                        style={{
                                            width: `${100 / table.getAllColumns().length}%`,
                                            maxWidth: "20%",
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {table.getPageCount() > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-green-50/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {"<<"}
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-green-50/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {"<"}
                        </button>
                        <span className="px-3 py-1.5 text-sm text-gray-700">
                            Page{" "}
                            <strong>
                                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </strong>
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-green-50/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {">"}
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-green-50/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {">>"}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            className="px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {[10, 100, 500, 1000, 2000, 5000, 10000].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ================= Helpers ================= */

function formatDateIST(dateString: string | null): string {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        return (
            date.toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }) + " (IST)"
        );
    } catch {
        return dateString;
    }
}

function formatBoolean(value: boolean): string {
    return value ? "TRUE" : "FALSE";
}

function convertToCSV(data: WebinarWithParticipants[]): string {
    if (!data || data.length === 0) return "";

    const headers = [
        "ID",
        "Title",
        "Start Date",
        "End Date",
        "Speaker",
        "Language",
        "Type",
        "Registered Count",
        "Attended Count",
        "Paid Count",
        "Cancelled",
    ];

    const rows = data.map((row) => {
        return [
            row.id.toString(),
            row.title || "",
            formatDateIST(row.start_date),
            formatDateIST(row.end_date),
            row.speaker_name || "",
            row.language || "",
            row.type || "",
            row.registered_participants.length.toString(),
            row.attended_participants.length.toString(),
            row.paid_participants.length.toString(),
            formatBoolean(!!row.cancelled_at),
        ]
            .map((field) => {
                const stringField = String(field);
                if (
                    stringField.includes(",") ||
                    stringField.includes('"') ||
                    stringField.includes("\n")
                ) {
                    return `"${stringField.replace(/"/g, '""')}"`;
                }
                return stringField;
            })
            .join(",");
    });

    return [headers.join(","), ...rows].join("\n");
}
