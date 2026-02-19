// import { useEffect, useState } from "react";
// import { EventsTable } from "../components/EventsTable";
// import type { WebinarWithParticipants } from "../types";

// const BASE_URL = import.meta.env.VITE_API_URL as string;

// export default function EventsPage() {
//     const [events, setEvents] = useState<WebinarWithParticipants[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         async function fetchEvents() {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const res = await fetch(`${BASE_URL}/events`);
//                 const json = await res.json();

//                 if (!res.ok || json.error) {
//                     throw new Error(json.error || "Failed to fetch events");
//                 }

//                 setEvents(json.data ?? []);
//             } catch (err) {
//                 setError(
//                     err instanceof Error ? err.message : "Unknown error occurred"
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         }

//         fetchEvents();
//     }, []);

//     return (
//         <div className="space-y-6">
//             <div>
//                 <h1 className="text-2xl font-semibold text-gray-900">
//                     Events Dashboard
//                 </h1>
//                 <p className="text-sm text-gray-600 mt-1">
//                     Manage and explore all webinars and platform events.
//                 </p>
//             </div>

//             {loading && (
//                 <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
//                     <p className="text-sm text-gray-600">Loading events...</p>
//                 </div>
//             )}

//             {error && (
//                 <div className="border border-red-200 rounded-xl p-6 bg-red-50">
//                     <p className="text-sm text-red-600">{error}</p>
//                 </div>
//             )}

//             {!loading && !error && <EventsTable data={events} />}
//         </div>
//     );
// }