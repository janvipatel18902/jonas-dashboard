// import { useMemo, useState } from "react";
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
// } from "@tanstack/react-table";
// import { Link } from "react-router-dom";
// import type { WebinarWithParticipants } from "../types";

// interface Props {
//     data: WebinarWithParticipants[];
// }

// export function EventsTable({ data }: Props) {
//     const [sorting, setSorting] = useState<SortingState>([]);
//     const [columnFilters, setColumnFilters] =
//         useState<ColumnFiltersState>([]);
//     const [pagination, setPagination] =
//         useState<PaginationState>({
//             pageIndex: 0,
//             pageSize: 100,
//         });

//     const columns = useMemo<ColumnDef<WebinarWithParticipants>[]>(
//         () => [
//             {
//                 accessorKey: "id",
//                 header: "ID",
//                 cell: (info) => (
//                     <Link
//                         to={`/events/${info.getValue()}`}
//                         className="text-green-600 hover:underline"
//                     >
//                         {info.getValue<number>()}
//                     </Link>
//                 ),
//             },
//             {
//                 accessorKey: "title",
//                 header: "Title",
//             },
//             {
//                 accessorKey: "start_date",
//                 header: "Start Date",
//             },
//             {
//                 accessorKey: "end_date",
//                 header: "End Date",
//             },
//             {
//                 accessorKey: "speaker_name",
//                 header: "Speaker",
//             },
//             {
//                 id: "registered",
//                 header: "Registered",
//                 accessorFn: (row) =>
//                     row.registered_participants.length,
//             },
//             {
//                 id: "attended",
//                 header: "Attended",
//                 accessorFn: (row) =>
//                     row.attended_participants.length,
//             },
//             {
//                 id: "paid",
//                 header: "Paid",
//                 accessorFn: (row) =>
//                     row.paid_participants.length,
//             },
//         ],
//         []
//     );

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

//     return (
//         <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
//             <h2 className="text-lg font-semibold mb-4">
//                 Events ({data.length})
//             </h2>

//             <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                     <thead>
//                         {table.getHeaderGroups().map((hg) => (
//                             <tr key={hg.id}>
//                                 {hg.headers.map((header) => (
//                                     <th
//                                         key={header.id}
//                                         className="py-3 px-3 text-left font-semibold"
//                                     >
//                                         {flexRender(
//                                             header.column.columnDef.header,
//                                             header.getContext()
//                                         )}
//                                     </th>
//                                 ))}
//                             </tr>
//                         ))}
//                     </thead>

//                     <tbody>
//                         {table.getRowModel().rows.map((row) => (
//                             <tr
//                                 key={row.id}
//                                 className="border-b hover:bg-green-50/30"
//                             >
//                                 {row.getVisibleCells().map((cell) => (
//                                     <td
//                                         key={cell.id}
//                                         className="py-3 px-3"
//                                     >
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
//         </div>
//     );
// }