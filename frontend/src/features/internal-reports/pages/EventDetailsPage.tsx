import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout, { type EnvironmentType } from "../components/Layout";
import { getEnvironment, getEvents } from "../api/internalReportsApi";
import type { WebinarWithParticipants } from "../types";
import { EventDetailsDisplay } from "../components/EventDetailsDisplay";

export default function EventDetailsPage() {
    const { event_id } = useParams<{ event_id: string }>();

    const decodedEventId = useMemo(() => {
        try {
            return event_id ? decodeURIComponent(event_id) : null;
        } catch {
            return event_id ?? null;
        }
    }, [event_id]);

    const [environment, setEnvironment] = useState<EnvironmentType | null>(null);
    const [event, setEvent] = useState<WebinarWithParticipants | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);

                const [envRes, eventsRes] = await Promise.all([
                    getEnvironment(),
                    getEvents(),
                ]);

                setEnvironment(envRes.environment ?? null);

                const events = (eventsRes.data ?? []) as WebinarWithParticipants[];
                const found = decodedEventId
                    ? events.find((e) => e.id.toString() === decodedEventId)
                    : null;

                setEvent(found ?? null);
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "Failed to load event details"
                );
                setEvent(null);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [decodedEventId]);

    const displayTitle = event?.title || (decodedEventId ? `Event #${decodedEventId}` : "Event");

    if (loading) {
        return (
            <Layout title={`Event: ${displayTitle}`} environment={environment}>
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <p className="text-sm text-gray-600">Loading event details...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title={`Event: ${displayTitle}`} environment={environment}>
                <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={`Event: ${displayTitle}`} environment={environment}>
            <div className="flex gap-2">
                <Link
                    to="/events"
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                    ← Back to Events
                </Link>
            </div>

            {!event ? (
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <p className="text-sm text-red-600">
                        Failed to load event details. Please try again later.
                    </p>
                </div>
            ) : (
                <EventDetailsDisplay data={event} />
            )}
        </Layout>
    );
}
