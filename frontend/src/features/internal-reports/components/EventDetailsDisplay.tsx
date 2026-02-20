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
import type { WebinarWithParticipants, ParticipantDetail } from "../types";

interface EventDetailsDisplayProps {
    data: WebinarWithParticipants;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateString;
    }
}

function formatDateIST(dateString: string | null): string {
    if (!dateString) return "N/A";
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
    return value ? "Yes" : "No";
}

function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

function ParticipantsTable({ data, title }: { data: ParticipantDetail[]; title: string }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 100,
    });

    const columns = useMemo<ColumnDef<ParticipantDetail>[]>(
        () => [
            {
                accessorKey: "full_name",
                header: "Full Name",
                cell: (info) => {
                    const value = info.getValue() as string | null;
                    const displayValue = value || "-";
                    return (
                        <div
                            className="truncate"
                            style={{
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                            title={displayValue}
                        >
                            {displayValue}
                        </div>
                    );
                },
                filterFn: "includesString",
                size: 200,
            },
            {
                accessorKey: "email",
                header: "Email",
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
        ],
        []
    );

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

    if (data.length === 0) {
        return (
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">No participants</p>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {title} ({data.length})
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                                key={headerGroup.id}
                                className="border-b border-gray-200 bg-white"
                            >
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="py-3 px-3 font-semibold text-gray-900 text-left truncate"
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
                                        className="py-3 px-3 text-gray-900"
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
                            {[10, 100, 500, 1000].map((pageSize) => (
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

export function EventDetailsDisplay({ data }: EventDetailsDisplayProps) {
    const priceSection =
        data.price !== null && data.price !== undefined ? (
            <div>
                <span className="text-sm font-medium text-gray-600">Price</span>
                <p className="text-sm text-gray-900 mt-1">{JSON.stringify(data.price)}</p>
            </div>
        ) : null;

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm font-medium text-gray-600">Title</span>
                        <p className="text-sm text-gray-900 mt-1">{data.title}</p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">Event ID</span>
                        <p className="text-sm text-gray-900 mt-1 font-mono">{data.id}</p>
                    </div>

                    <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-600">Description</span>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                            {data.description || "N/A"}
                        </p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">Type</span>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{data.type}</p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">Language</span>
                        <p className="text-sm text-gray-900 mt-1">{data.language}</p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">Duration</span>
                        <p className="text-sm text-gray-900 mt-1">
                            {formatDuration(data.duration)}
                        </p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">
                            Participant Limit
                        </span>
                        <p className="text-sm text-gray-900 mt-1">{data.participant_limit}</p>
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dates</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm font-medium text-gray-600">Start Date</span>
                        <p className="text-sm text-gray-900 mt-1">
                            {formatDateIST(data.start_date)}
                        </p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">End Date</span>
                        <p className="text-sm text-gray-900 mt-1">
                            {formatDateIST(data.end_date)}
                        </p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">Created At</span>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(data.created_at)}</p>
                    </div>

                    {data.edited_at && (
                        <div>
                            <span className="text-sm font-medium text-gray-600">Edited At</span>
                            <p className="text-sm text-gray-900 mt-1">{formatDate(data.edited_at)}</p>
                        </div>
                    )}

                    {data.cancelled_at && (
                        <div>
                            <span className="text-sm font-medium text-red-600">Cancelled At</span>
                            <p className="text-sm text-red-600 mt-1">{formatDate(data.cancelled_at)}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Speaker Information */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Speaker Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm font-medium text-gray-600">Speaker Name</span>
                        <p className="text-sm text-gray-900 mt-1">{data.speaker_name}</p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">
                            Speaker Organisation
                        </span>
                        <p className="text-sm text-gray-900 mt-1">{data.speaker_organisation}</p>
                    </div>
                </div>
            </div>

            {/* Access & Pricing */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Access & Pricing</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm font-medium text-gray-600">Password Required</span>
                        <p className="text-sm text-gray-900 mt-1">
                            {formatBoolean(data.password_required)}
                        </p>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-600">Pricing Type</span>
                        <p className="text-sm text-gray-900 mt-1 capitalize">
                            {data.pricing_type.replace(/_/g, " ")}
                        </p>
                    </div>

                    {priceSection}

                    {data.join_url && (
                        <div className="md:col-span-2">
                            <span className="text-sm font-medium text-gray-600">Join URL</span>
                            <p className="text-sm text-gray-900 mt-1 break-all">
                                <a
                                    href={data.join_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-700 underline"
                                >
                                    {data.join_url}
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tags & Links */}
            {(data.tags.length > 0 || data.assignment || data.question_link) && (
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags & Links</h2>

                    <div className="space-y-4">
                        {data.tags.length > 0 && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Tags</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {data.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.assignment && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Assignment</span>
                                <p className="text-sm text-gray-900 mt-1 break-all">
                                    {data.assignment}
                                </p>
                            </div>
                        )}

                        {data.question_link && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Question Link</span>
                                <p className="text-sm text-gray-900 mt-1 break-all">
                                    <a
                                        href={data.question_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-700 underline"
                                    >
                                        {data.question_link}
                                    </a>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Participants */}
            <ParticipantsTable data={data.registered_participants} title="Registered Participants" />
            <ParticipantsTable data={data.attended_participants} title="Attended Participants" />
            <ParticipantsTable data={data.paid_participants} title="Paid Participants" />
        </div>
    );
}
