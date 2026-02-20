import { useEffect, useState } from "react";
import Layout, { type EnvironmentType } from "../components/Layout";
import { getEnvironment, getEvents } from "../api/internalReportsApi";
import { EventsTable } from "../components/EventsTable";
import type { WebinarWithParticipants } from "../types";

export default function EventsPage() {
    const [environment, setEnvironment] = useState<EnvironmentType | null>(null);
    const [events, setEvents] = useState<WebinarWithParticipants[] | null>(null);
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
                setEvents(eventsRes.data ?? []);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load events");
                setEvents(null);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return (
            <Layout title="Events" environment={environment}>
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <p className="text-sm text-gray-600">Loading events...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Events" environment={environment}>
                <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </Layout>
        );
    }

    if (!events) {
        return (
            <Layout title="Events" environment={environment}>
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <p className="text-sm text-red-600">
                        Failed to load events. Please try again later.
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Events" environment={environment}>
            <EventsTable data={events} />
        </Layout>
    );
}
