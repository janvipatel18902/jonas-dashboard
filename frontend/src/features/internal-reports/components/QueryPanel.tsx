import { useState, useMemo } from "react";
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

import UniversityDropdown from "./UniversityDropdown";
import type { University, UserReportRow } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL as string;

interface Props {
    universities: University[] | null;
}

export default function QueryPanel({ universities }: Props) {
    const [selectedUniversity, setSelectedUniversity] =
        useState<University | null>(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [data, setData] = useState<UserReportRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSearch() {
        setLoading(true);
        setError(null);

        try {
            const body: {
                university_name_filter?: string | null;
                completed_c4f_at_from_filter?: string | null;
                completed_c4f_at_to_filter?: string | null;
            } = {};

            if (selectedUniversity?.university_name) {
                body.university_name_filter = selectedUniversity.university_name;
            }

            if (fromDate) {
                body.completed_c4f_at_from_filter = new Date(
                    fromDate
                ).toISOString();
            }

            if (toDate) {
                body.completed_c4f_at_to_filter = new Date(toDate).toISOString();
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

            setData(result.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    const columns = useMemo<ColumnDef<UserReportRow>[]>(
        () => [
            { accessorKey: "full_name", header: "Full Name" },
            { accessorKey: "email", header: "Email" },
            { accessorKey: "registered_at", header: "Registered At" },
            { accessorKey: "university_name", header: "University" },
            { accessorKey: "student_id", header: "Student ID" },
            { accessorKey: "completed_c4f_at", header: "Completed C4F At" },
            { accessorKey: "has_c4f_record", header: "C4F Record" },
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
        ],
        []
    );

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        useState<ColumnFiltersState>([]);
    const [pagination, setPagination] =
        useState<PaginationState>({
            pageIndex: 0,
            pageSize: 100,
        });

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
    });

    return (
        <div className="space-y-6">
            <section className="border rounded-xl p-6 bg-white shadow-sm space-y-4">
                <h2 className="text-lg font-semibold">Search Database</h2>

                <UniversityDropdown
                    universities={universities}
                    onSelect={setSelectedUniversity}
                />

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="datetime-local"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                        type="datetime-local"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <button
                    onClick={handleSearch}
                    className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm"
                >
                    {loading ? "Searching..." : "Start Search"}
                </button>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </section>

            {data.length > 0 && (
                <section className="border rounded-xl p-6 bg-white shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            {table.getHeaderGroups().map((hg) => (
                                <tr key={hg.id}>
                                    {hg.headers.map((header) => (
                                        <th key={header.id} className="px-3 py-2 text-left">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-3 py-2">
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
                </section>
            )}
        </div>
    );
}
