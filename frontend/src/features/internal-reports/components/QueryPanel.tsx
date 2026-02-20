import {
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef,
    memo,
} from "react";

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

import UniversityDropdown from "./UniversityDropdown";
import type { University, UserReportRow } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL as string;

interface Props {
    universities: University[] | null;
}

interface QueryResult {
    data: UserReportRow[] | null;
    error: string | null;
}

export default function QueryPanel({ universities }: Props) {
    const [selectedUniversity, setSelectedUniversity] =
        useState<University | null>(null);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [queryResult, setQueryResult] =
        useState<QueryResult | null>(null);

    const [loading, setLoading] = useState(false);

    const [grantStatusMap, setGrantStatusMap] = useState<
        Record<string, "idle" | "loading" | "success" | "error">
    >({});

    const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
    const [copiedTable, setCopiedTable] = useState(false);

    /* ===================================================== */
    /* SEARCH */
    /* ===================================================== */

    async function handleSearch() {
        setLoading(true);
        setQueryResult(null);

        try {
            const body: {
                university_name_filter?: string;
                completed_c4f_at_from_filter?: string;
                completed_c4f_at_to_filter?: string;
            } = {};

            if (selectedUniversity?.university_name) {
                body.university_name_filter =
                    selectedUniversity.university_name;
            }

            if (fromDate) {
                body.completed_c4f_at_from_filter =
                    new Date(fromDate).toISOString();
            }

            if (toDate) {
                body.completed_c4f_at_to_filter =
                    new Date(toDate).toISOString();
            }

            const res = await fetch(`${BASE_URL}/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const result = await res.json();

            if (!res.ok || result.error) {
                throw new Error(result.error || "Query failed");
            }

            setQueryResult({
                data: result.data ?? [],
                error: null,
            });

            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        } catch (err) {
            setQueryResult({
                data: null,
                error:
                    err instanceof Error
                        ? err.message
                        : "Unknown error",
            });
        } finally {
            setLoading(false);
        }
    }

    /* ===================================================== */
    /* CLEAR EVERYTHING */
    /* ===================================================== */

    function handleClearServerFilters() {
        setSelectedUniversity(null);
        setFromDate("");
        setToDate("");
        setQueryResult(null);
        setColumnFilters([]);
        setSorting([]);
        setPagination({ pageIndex: 0, pageSize: 100 });
        setGrantStatusMap({});
        setCopiedRowId(null);
        setCopiedTable(false);
    }

    /* ===================================================== */
    /* UTILITIES */
    /* ===================================================== */

    const formatDate = (value: string | null) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatBoolean = (v: boolean) =>
        v ? "TRUE" : "FALSE";

    /* ===================================================== */
    /* CSV + CLIPBOARD */
    /* ===================================================== */

    const convertToCSV = (data: UserReportRow[]): string => {
        if (!data || data.length === 0) return "";

        const headers = [
            "Full Name",
            "Email",
            "Registered At",
            "University",
            "Student ID",
            "Completed C4F At",
            "C4F Record",
            "Dev Objective",
            "Certificate",
            "Professional Access",
        ];

        const rows = data.map((row) =>
            [
                row.full_name || "",
                row.email || "",
                row.registered_at ? formatDate(row.registered_at) : "",
                row.university_name || "",
                row.student_id || "",
                row.completed_c4f_at ? formatDate(row.completed_c4f_at) : "",
                formatBoolean(row.has_c4f_record),
                formatBoolean(row.has_development_objective_record),
                formatBoolean(row.has_downloaded_certificate_record),
                formatBoolean(row.has_professional_access),
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
                .join(",")
        );

        return [headers.join(","), ...rows].join("\n");
    };

    const handleCopyToClipboard = async () => {
        if (!queryResult?.data) return;

        const filteredData = table
            .getFilteredRowModel()
            .rows.map((row) => row.original);

        const csv = convertToCSV(filteredData);

        await navigator.clipboard.writeText(csv);
        setCopiedTable(true);
        setTimeout(() => setCopiedTable(false), 1200);
    };

    const handleDownloadCSV = () => {
        if (!queryResult?.data) return;

        const filteredData = table
            .getFilteredRowModel()
            .rows.map((row) => row.original);

        const csv = convertToCSV(filteredData);

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `user-report-${new Date().toISOString().split("T")[0]}.csv`
        );

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* ===================================================== */
    /* COLUMN FILTER */
    /* ===================================================== */

    const ColumnFilter = memo(
        ({ column }: { column: Column<UserReportRow, unknown> }) => {
            const columnFilterValue = column.getFilterValue();
            const isBoolean = column.id.includes("has_");

            const [localValue, setLocalValue] = useState<string>(
                (columnFilterValue ?? "") as string
            );

            const timeoutRef =
                useRef<ReturnType<typeof setTimeout> | null>(null);

            useEffect(() => {
                setLocalValue((columnFilterValue ?? "") as string);
            }, [columnFilterValue]);

            const handleInputChange = (value: string) => {
                setLocalValue(value);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    column.setFilterValue(value || undefined);
                }, 400);
            };

            if (isBoolean) {
                return (
                    <select
                        value={(columnFilterValue ?? "") as string}
                        onChange={(e) =>
                            column.setFilterValue(
                                e.target.value === ""
                                    ? undefined
                                    : e.target.value === "true"
                            )
                        }
                        className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                    >
                        <option value="">All</option>
                        <option value="true">YES</option>
                        <option value="false">NO</option>
                    </select>
                );
            }

            return (
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) =>
                        handleInputChange(e.target.value)
                    }
                    placeholder={`Filter ${column.columnDef.header}`}
                    className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                />
            );
        }
    );

    ColumnFilter.displayName = "ColumnFilter";

    /* ===================================================== */
    /* TABLE */
    /* ===================================================== */

    const columns = useMemo<ColumnDef<UserReportRow>[]>(() => [
        { accessorKey: "full_name", header: "Full Name" },
        { accessorKey: "email", header: "Email" },
        {
            accessorKey: "registered_at",
            header: "Registered At",
            cell: (i) => formatDate(i.getValue() as string | null),
        },
        { accessorKey: "university_name", header: "University" },
        { accessorKey: "student_id", header: "Student ID" },
        {
            accessorKey: "completed_c4f_at",
            header: "Completed C4F At",
            cell: (i) => formatDate(i.getValue() as string | null),
        },
        {
            accessorKey: "has_c4f_record",
            header: "C4F Record",
            cell: (info) => {
                const value = info.getValue() as boolean;
                return (
                    <span
                        className={
                            value
                                ? "text-green-600 font-semibold"
                                : "text-gray-500"
                        }
                    >
                        {formatBoolean(value)}
                    </span>
                );
            },
        },
        {
            accessorKey: "has_development_objective_record",
            header: "Dev Objective",
            cell: (info) => {
                const value = info.getValue() as boolean;
                return (
                    <span
                        className={
                            value
                                ? "text-green-600 font-semibold"
                                : "text-gray-500"
                        }
                    >
                        {formatBoolean(value)}
                    </span>
                );
            },
        },
        {
            accessorKey: "has_downloaded_certificate_record",
            header: "Certificate",
            cell: (info) => {
                const value = info.getValue() as boolean;
                return (
                    <span
                        className={
                            value
                                ? "text-green-600 font-semibold"
                                : "text-gray-500"
                        }
                    >
                        {formatBoolean(value)}
                    </span>
                );
            },
        },
        {
            accessorKey: "has_professional_access",
            header: "Professional Access",
            cell: (info) => {
                const value = info.getValue() as boolean;
                return (
                    <span
                        className={
                            value
                                ? "text-green-600 font-semibold"
                                : "text-gray-500"
                        }
                    >
                        {formatBoolean(value)}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            enableColumnFilter: false,
            enableSorting: false,
            cell: ({ row }) => {
                const status = grantStatusMap[row.original.id] ?? "idle";
                const disabled =
                    row.original.has_professional_access ||
                    status === "loading" ||
                    status === "success";

                return (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(row.original.id);
                                setCopiedRowId(row.original.id);
                                setTimeout(() => setCopiedRowId(null), 1200);
                            }}
                            className="p-1.5 border rounded-md text-xs hover:bg-gray-100"
                        >
                            {copiedRowId === row.original.id ? "✓" : "📋"}
                        </button>

                        <button
                            disabled={disabled}
                            onClick={() => { }}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-green-600 text-white disabled:bg-gray-200 disabled:text-gray-500"
                        >
                            {status === "loading"
                                ? "Granting..."
                                : status === "success"
                                    ? "OK"
                                    : status === "error"
                                        ? "Retry"
                                        : "GRANT"}
                        </button>
                    </div>
                );
            },
        },
    ], [grantStatusMap, copiedRowId]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        useState<ColumnFiltersState>([]);
    const [pagination, setPagination] =
        useState<PaginationState>({
            pageIndex: 0,
            pageSize: 100,
        });

    const table = useReactTable({
        data: queryResult?.data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            pagination,
        },
        autoResetAll: false,
    });

    return (
        <div className="space-y-6">

            {/* SEARCH PANEL */}
            <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
                <h2 className="text-lg font-semibold">
                    Search Database
                </h2>

                <UniversityDropdown
                    universities={universities}
                    onSelect={setSelectedUniversity}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">
                            From Date
                        </label>
                        <input
                            type="datetime-local"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            To Date
                        </label>
                        <input
                            type="datetime-local"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex-1 rounded-lg px-4 py-3 text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                    >
                        {loading ? "Searching..." : "Start Search"}
                    </button>

                    <button
                        onClick={handleClearServerFilters}
                        className="px-4 py-3 text-sm border rounded-lg"
                    >
                        Clear
                    </button>
                </div>
            </section>

            {/* RESULTS */}
            {queryResult && (
                <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm overflow-x-auto">

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                            Query Results{" "}
                            <span className="ml-2 text-sm text-gray-600">
                                Showing {table.getRowModel().rows.length} of{" "}
                                {table.getFilteredRowModel().rows.length} filtered
                                (Total: {queryResult.data?.length})
                            </span>
                        </h2>

                        <div className="flex items-center gap-3">
                            {queryResult.data && queryResult.data.length > 0 && (
                                <>
                                    <button
                                        onClick={handleCopyToClipboard}
                                        className="text-sm text-green-600 hover:text-green-700 underline"
                                    >
                                        {copiedTable ? "Copied ✓" : "Copy to clipboard"}
                                    </button>

                                    <button
                                        onClick={handleDownloadCSV}
                                        className="text-sm text-green-600 hover:text-green-700 underline"
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

                    <table className="w-full text-sm">
                        <thead>
                            {table.getHeaderGroups().map((hg) => (
                                <>
                                    <tr key={hg.id}>
                                        {hg.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="py-3 px-3 font-semibold text-gray-900"
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={
                                                            header.column.getCanSort()
                                                                ? "cursor-pointer select-none flex items-center gap-1"
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

                                    <tr>
                                        {hg.headers.map((header) => (
                                            <th key={header.id} className="px-3 pb-2">
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
                                    className="border-b border-gray-100 hover:bg-green-50/30 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={`py-3 px-3 ${cell.column.id.includes("has_") ||
                                                cell.column.id === "actions"
                                                ? "text-center"
                                                : ""
                                                }`}
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

                    {table.getPageCount() > 1 && (
                        <div className="mt-4 flex justify-between items-center border-t pt-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="px-3 py-1 border rounded"
                                >
                                    {"<<"}
                                </button>

                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="px-3 py-1 border rounded"
                                >
                                    {"<"}
                                </button>

                                <span className="px-3 py-1 text-sm">
                                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                                    {table.getPageCount()}
                                </span>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="px-3 py-1 border rounded"
                                >
                                    {">"}
                                </button>

                                <button
                                    onClick={() =>
                                        table.setPageIndex(table.getPageCount() - 1)
                                    }
                                    disabled={!table.getCanNextPage()}
                                    className="px-3 py-1 border rounded"
                                >
                                    {">>"}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm">Rows per page:</span>
                                <select
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) =>
                                        table.setPageSize(Number(e.target.value))
                                    }
                                    className="border rounded px-2 py-1 text-sm"
                                >
                                    {[10, 100, 500, 1000, 2000].map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}