import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getCourseGradebook } from "../api/internalReportsApi";

interface GradebookRow {
    username: string;
    email: string;
    percent: number;
}

export default function CourseGradebookPage() {
    const { courseId } = useParams();
    const [rows, setRows] = useState<GradebookRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGradebook() {
            try {
                if (!courseId) return;

                const decodedId = decodeURIComponent(courseId);
                const response = await getCourseGradebook(decodedId);

                const results =
                    response?.data?.results ??
                    response?.results ??
                    [];

                setRows(results);
            } catch (err) {
                console.error("Failed to load gradebook:", err);
                setRows([]);
            } finally {
                setLoading(false);
            }
        }

        fetchGradebook();
    }, [courseId]);

    return (
        <Layout title="Course Gradebook" environment="PRODUCTION">
            <div className="flex gap-2 mb-4">
                <Link
                    to={`/open-edx/course/${courseId}/grades`}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                    Grades
                </Link>

                <Link
                    to={`/open-edx/course/${courseId}/gradebook`}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700"
                >
                    Gradebook
                </Link>

                <Link
                    to={`/open-edx/course/${courseId}/details`}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                    Details
                </Link>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : rows.length === 0 ? (
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm text-sm text-gray-500">
                    No gradebook data found.
                </div>
            ) : (
                <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2 text-left">Username</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-right">Percent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-2">{r.username}</td>
                                    <td className="px-4 py-2">{r.email || "-"}</td>
                                    <td className="px-4 py-2 text-right">
                                        {r.percent ?? 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Layout>
    );
}
