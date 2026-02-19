// import { useMemo, useState, memo, useCallback, useEffect, useRef } from "react";
// import {
//     useReactTable,
//     getCoreRowModel,
//     getSortedRowModel,
//     getFilteredRowModel,
//     getPaginationRowModel,
//     flexRender,
//     type ColumnDef,
//     type SortingState,
//     type ColumnFiltersState,
//     type PaginationState,
//     type Column,
// } from "@tanstack/react-table";
// import { Link } from "react-router-dom";
// import type { WebinarWithParticipants } from "../types";

// interface EventsTableProps {
//     data: WebinarWithParticipants[];
// }

// export function EventsTable({ data }: EventsTableProps) {
//     const [sorting, setSorting] = useState<SortingState>([]);
//     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//     const [pagination, setPagination] = useState<PaginationState>({
//         pageIndex: 0,
//         pageSize: 100,
//     });

//     /* ===================== CSV ===================== */

//     const convertToCSV = (rows: WebinarWithParticipants[]) => {
//         if (!rows.length) return "";

//         const headers = [
//             "ID",
//             "Title",
//             "Start Date",
//             "End Date",
//             "Speaker",
//             "Language",
//             "Type",
//             "Registered",
//             "Attended",
//             "Paid",
//             "Cancelled",
//         ];

//         const formattedRows = rows.map((row) =>
//             [
//                 row.id,
//                 row.title,
//                 row.start_date ?? "",
//                 row.end_date ?? "",
//                 row.speaker_name,
//                 row.language,
//                 row.type,
//                 row.registered_participants.length,
//                 row.attended_participants.length,
//                 row.paid_participants.length,
//                 row.cancelled_at ? "TRUE" : "FALSE",
//             ]
//                 .map((f) => `"${String(f).replace(/"/g, '""')}"`)
//                 .join(",")
//         );

//         return [headers.join(","), ...formattedRows].join("\n");
//     };

//     const handleCopyToClipboard = async () => {
//         const filtered = table
//             .getFilteredRowModel()
//             .rows.map((r) => r.original);

//         await navigator.clipboard.writeText(convertToCSV(filtered));
//         alert("Table data copied to clipboard!");
//     };

//     const handleDownloadCSV = () => {
//         const filtered = table
//             .getFilteredRowModel()
//             .rows.map((r) => r.original);

//         const blob = new Blob([convertToCSV(filtered)], {
//             type: "text/csv;charset=utf-8;",
//         });

//         const url = URL.createObjectURL(blob);
//         const link = document.createElement("a");

//         link.href = url;
//         link.download = `events-${new Date()
//             .toISOString()
//             .split("T")[0]}.csv`;

//         link.click();
//     };

//     /* ===================== COLUMNS ===================== */

//     const columns = useMemo<ColumnDef<WebinarWithParticipants>[]>(
//         () => [
//             {
//                 id: "actions",
//                 header: "Actions",
//                 enableSorting: false,
//                 enableColumnFilter: false,
//                 cell: ({ row }) => (
//                     <Link
//                         to={`/events/${row.original.id}`}
//                         className="px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors inline-block"
//                     >
//                         See details
//                     </Link>
//                 ),
//             },
//             {
//                 accessorKey: "id",
//                 header: "ID",
//                 cell: (info) => {
//                     const value = info.getValue<number>();
//                     return (
//                         <Link
//                             to={`/events/${value}`}
//                             className="text-green-600 hover:text-green-700 hover:underline"
//                         >
//                             {value}
//                         </Link>
//                     );
//                 },
//             },
//             { accessorKey: "title", header: "Title" },
//             { accessorKey: "start_date", header: "Start Date" },
//             { accessorKey: "end_date", header: "End Date" },
//             { accessorKey: "speaker_name", header: "Speaker" },
//             { accessorKey: "language", header: "Language" },
//             { accessorKey: "type", header: "Type" },
//             {
//                 id: "registered_count",
//                 header: "Registered",
//                 accessorFn: (row) => row.registered_participants.length,
//             },
//             {
//                 id: "attended_count",
//                 header: "Attended",
//                 accessorFn: (row) => row.attended_participants.length,
//             },
//             {
//                 id: "paid_count",
//                 header: "Paid",
//                 accessorFn: (row) => row.paid_participants.length,
//             },
//             {
//                 id: "cancelled",
//                 header: "Cancelled",
//                 accessorFn: (row) => !!row.cancelled_at,
//                 cell: (info) => (
//                     <span
//                         className={
//                             info.getValue<boolean>()
//                                 ? "text-red-600 font-semibold"
//                                 : "text-gray-500"
//                         }
//                     >
//                         {info.getValue<boolean>() ? "TRUE" : "FALSE"}
//                     </span>
//                 ),
//             },
//         ],
//         []
//     );

//     /* ===================== COLUMN FILTER ===================== */

//     const ColumnFilter = memo(
//         ({ column }: { column: Column<WebinarWithParticipants, unknown> }) => {
//             const columnFilterValue = column.getFilterValue();
//             const [localValue, setLocalValue] = useState<string>(
//                 (columnFilterValue ?? "") as string
//             );

//             const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//             useEffect(() => {
//                 setLocalValue((columnFilterValue ?? "") as string);
//             }, [columnFilterValue]);

//             const handleChange = (value: string) => {
//                 setLocalValue(value);

//                 if (timeoutRef.current) {
//                     clearTimeout(timeoutRef.current);
//                 }

//                 timeoutRef.current = setTimeout(() => {
//                     column.setFilterValue(value || undefined);
//                 }, 300);
//             };

//             return (
//                 <input
//                     type="text"
//                     value={localValue}
//                     onChange={(e) => handleChange(e.target.value)}
//                     placeholder={`Filter ${column.columnDef.header}`}
//                     className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
//                 />
//             );
//         }
//     );

//     ColumnFilter.displayName = "ColumnFilter";

//     /* ===================== TABLE ===================== */

//     const table = useReactTable({
//         data,
//         columns,
//         state: { sorting, columnFilters, pagination },
//         onSortingChange: setSorting,
//         onColumnFiltersChange: setColumnFilters,
//         onPaginationChange: setPagination,
//         getCoreRowModel: getCoreRowModel(),
//         getSortedRowModel: getSortedRowModel(),
//         getFilteredRowModel: getFilteredRowModel(),
//         getPaginationRowModel: getPaginationRowModel(),
//     });

//     /* ===================== RENDER ===================== */

//     return (
//         <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
//             <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                     Events
//                     <span className="ml-2 text-sm font-normal text-gray-600">
//                         Showing {table.getRowModel().rows.length} of{" "}
//                         {table.getFilteredRowModel().rows.length} filtered
//                         (Total: {data.length})
//                     </span>
//                 </h2>

//                 <div className="flex items-center gap-3">
//                     {data.length > 0 && (
//                         <>
//                             <button
//                                 onClick={handleCopyToClipboard}
//                                 className="text-sm text-green-600 underline"
//                             >
//                                 Copy to clipboard
//                             </button>
//                             <button
//                                 onClick={handleDownloadCSV}
//                                 className="text-sm text-green-600 underline"
//                             >
//                                 Download CSV
//                             </button>
//                         </>
//                     )}

//                     {columnFilters.length > 0 && (
//                         <button
//                             onClick={() => setColumnFilters([])}
//                             className="text-sm text-green-600 underline"
//                         >
//                             Clear filters
//                         </button>
//                     )}
//                 </div>
//             </div>

//             <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                     <thead>
//                         {table.getHeaderGroups().map((headerGroup) => (
//                             <>
//                                 <tr key={headerGroup.id}>
//                                     {headerGroup.headers.map((header) => (
//                                         <th
//                                             key={header.id}
//                                             className="py-3 px-3 text-left font-semibold"
//                                         >
//                                             {flexRender(
//                                                 header.column.columnDef.header,
//                                                 header.getContext()
//                                             )}
//                                         </th>
//                                     ))}
//                                 </tr>
//                                 <tr>
//                                     {headerGroup.headers.map((header) => (
//                                         <th key={header.id} className="px-3 pb-2">
//                                             {header.column.getCanFilter() && (
//                                                 <ColumnFilter column={header.column} />
//                                             )}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </>
//                         ))}
//                     </thead>

//                     <tbody>
//                         {table.getRowModel().rows.map((row) => (
//                             <tr
//                                 key={row.id}
//                                 className="border-b border-gray-100 hover:bg-green-50/30"
//                             >
//                                 {row.getVisibleCells().map((cell) => (
//                                     <td key={cell.id} className="py-3 px-3">
//                                         {flexRender(
//                                             cell.column.columnDef.cell,
//                                             cell.getContext()
//                                         )}
//                                     </td>
//                                 ))}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {table.getPageCount() > 1 && (
//                 <div className="mt-4 flex justify-between items-center border-t pt-4">
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => table.setPageIndex(0)}
//                             disabled={!table.getCanPreviousPage()}
//                             className="px-3 py-1 border rounded"
//                         >
//                             {"<<"}
//                         </button>
//                         <button
//                             onClick={() => table.previousPage()}
//                             disabled={!table.getCanPreviousPage()}
//                             className="px-3 py-1 border rounded"
//                         >
//                             {"<"}
//                         </button>
//                         <span className="px-3 py-1 text-sm">
//                             Page {table.getState().pagination.pageIndex + 1} of{" "}
//                             {table.getPageCount()}
//                         </span>
//                         <button
//                             onClick={() => table.nextPage()}
//                             disabled={!table.getCanNextPage()}
//                             className="px-3 py-1 border rounded"
//                         >
//                             {">"}
//                         </button>
//                         <button
//                             onClick={() =>
//                                 table.setPageIndex(table.getPageCount() - 1)
//                             }
//                             disabled={!table.getCanNextPage()}
//                             className="px-3 py-1 border rounded"
//                         >
//                             {">>"}
//                         </button>
//                     </div>

//                     <select
//                         value={table.getState().pagination.pageSize}
//                         onChange={(e) =>
//                             table.setPageSize(Number(e.target.value))
//                         }
//                         className="border rounded px-2 py-1 text-sm"
//                     >
//                         {[10, 100, 500, 1000, 2000].map((size) => (
//                             <option key={size} value={size}>
//                                 {size}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//             )}
//         </div>
//     );
// }