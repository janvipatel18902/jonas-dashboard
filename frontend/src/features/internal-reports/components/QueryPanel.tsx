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

/* ===================================================== */

interface Props {
    universities: University[] | null;
}

interface QueryResult {
    data: UserReportRow[] | null;
    error: string | null;
}

/* ===================================================== */

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
    /* CSV */
    /* ===================================================== */

    const convertToCSV = (rows: UserReportRow[]) => {
        if (!rows.length) return "";

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

        const lines = rows.map((r) =>
            [
                r.full_name ?? "",
                r.email,
                formatDate(r.registered_at),
                r.university_name ?? "",
                r.student_id ?? "",
                formatDate(r.completed_c4f_at),
                formatBoolean(r.has_c4f_record),
                formatBoolean(r.has_development_objective_record),
                formatBoolean(r.has_downloaded_certificate_record),
                formatBoolean(r.has_professional_access),
            ]
                .map((f) => `"${String(f).replace(/"/g, '""')}"`)
                .join(",")
        );

        return [headers.join(","), ...lines].join("\n");
    };

    const handleCopyToClipboard = async () => {
        if (!queryResult?.data) return;

        const rows = table
            .getFilteredRowModel()
            .rows.map((r) => r.original);

        await navigator.clipboard.writeText(
            convertToCSV(rows)
        );
    };

    const handleDownloadCSV = () => {
        if (!queryResult?.data) return;

        const rows = table
            .getFilteredRowModel()
            .rows.map((r) => r.original);

        const blob = new Blob(
            [convertToCSV(rows)],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `user-report-${new Date().toISOString().split("T")[0]}.csv`;

        link.click();
    };

    /* ===================================================== */
    /* GRANT */
    /* ===================================================== */

    const handleGrant = useCallback(
        async (row: UserReportRow) => {
            const userId = row.id;

            setGrantStatusMap((p) => ({
                ...p,
                [userId]: "loading",
            }));

            try {
                const res = await fetch(
                    `${BASE_URL}/users/professional-access/grant`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            user_id: userId,
                            university_name: row.university_name,
                        }),
                    }
                );

                if (!res.ok) throw new Error();

                setGrantStatusMap((p) => ({
                    ...p,
                    [userId]: "success",
                }));
            } catch {
                setGrantStatusMap((p) => ({
                    ...p,
                    [userId]: "error",
                }));
            }
        },
        []
    );

    /* ===================================================== */
    /* COLUMN FILTER COMPONENT (500ms DEBOUNCE) */
    /* ===================================================== */

    const ColumnFilter = memo(
        ({ column }: { column: Column<UserReportRow, unknown> }) => {
            const columnFilterValue = column.getFilterValue();
            const isBoolean = column.id.includes("has_");
            const isDateColumn =
                column.id === "registered_at" ||
                column.id === "completed_c4f_at";

            const [localValue, setLocalValue] = useState<string>(
                (columnFilterValue ?? "") as string
            );

            const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                }, 500);
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
                        <option value="true">TRUE</option>
                        <option value="false">FALSE</option>
                    </select>
                );
            }

            if (isDateColumn) {
                return (
                    <input
                        type="date"
                        value={localValue}
                        onChange={(e) =>
                            handleInputChange(e.target.value)
                        }
                        className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                    />
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
        },
        {
            accessorKey: "has_development_objective_record",
            header: "Dev Objective",
        },
        {
            accessorKey: "has_downloaded_certificate_record",
            header: "Certificate",
        },
        {
            accessorKey: "has_professional_access",
            header: "Professional Access",
        },
        {
            id: "actions",
            header: "Actions",
            enableColumnFilter: false,
            cell: ({ row }) => {
                const status =
                    grantStatusMap[row.original.id] ?? "idle";

                const disabled =
                    row.original.has_professional_access ||
                    status === "loading" ||
                    status === "success";

                return (
                    <button
                        disabled={disabled}
                        onClick={() =>
                            handleGrant(row.original)
                        }
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
                );
            },
        },
    ], [grantStatusMap, handleGrant]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
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
    });

    /* ===================================================== */
    /* RENDER */
    /* ===================================================== */

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
                            onChange={(e) =>
                                setFromDate(e.target.value)
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Filter by C4F completion start date
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            To Date
                        </label>
                        <input
                            type="datetime-local"
                            value={toDate}
                            onChange={(e) =>
                                setToDate(e.target.value)
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Filter by C4F completion end date
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full rounded-lg px-4 py-3 text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                >
                    {loading
                        ? "Searching..."
                        : "Start Search"}
                </button>
            </section>

            {/* RESULTS */}
            {queryResult && (
                <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                            Query Results{" "}
                            {queryResult.data && (
                                <span className="ml-2 text-sm font-normal text-gray-600">
                                    Showing{" "}
                                    {
                                        table.getRowModel()
                                            .rows.length
                                    }{" "}
                                    of{" "}
                                    {
                                        table.getFilteredRowModel()
                                            .rows.length
                                    }{" "}
                                    filtered records (Total:{" "}
                                    {queryResult.data.length})
                                </span>
                            )}
                        </h2>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyToClipboard}
                                className="text-sm text-green-600 underline"
                            >
                                Copy to clipboard
                            </button>

                            <button
                                onClick={handleDownloadCSV}
                                className="text-sm text-green-600 underline"
                            >
                                Download CSV
                            </button>

                            {columnFilters.length > 0 && (
                                <button
                                    onClick={() =>
                                        setColumnFilters([])
                                    }
                                    className="text-sm text-green-600 underline"
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
                                                className="py-3 px-3 text-left font-semibold"
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
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
                                    className="border-b border-gray-100 hover:bg-green-50/30"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="py-3 px-3">
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

                    {/* PAGINATION */}
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
                                    Page{" "}
                                    {table.getState().pagination.pageIndex + 1}{" "}
                                    of {table.getPageCount()}
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
                                <span className="text-sm">
                                    Rows per page:
                                </span>
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