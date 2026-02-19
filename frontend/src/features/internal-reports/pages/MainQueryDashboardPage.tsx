import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import QueryPanel from "../components/QueryPanel";
import type { University } from "../types";
import { getEnvironment } from "../api/internalReportsApi";

type EnvironmentType =
    | "PRODUCTION"
    | "DEVELOPMENT"
    | "UNKNOWN";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export default function MainQueryDashboardPage() {
    const [universities, setUniversities] =
        useState<University[] | null>(null);
    const [environment, setEnvironment] =
        useState<EnvironmentType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [envRes, uniRes] = await Promise.all([
                    getEnvironment(),
                    fetch(`${BASE_URL}/universities`).then((r) =>
                        r.json()
                    ),
                ]);

                setEnvironment(envRes.environment);

                setUniversities(uniRes.data ?? []);
            } catch (error) {
                console.error("Failed to load dashboard", error);
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, []);

    if (loading) {
        return (
            <Layout title="Dashboard" environment={environment}>
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    Loading dashboard...
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Dashboard" environment={environment}>
            <QueryPanel universities={universities} />
        </Layout>
    );
}
