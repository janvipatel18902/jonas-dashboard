import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getCourseDetails } from "../api/internalReportsApi";

interface CourseDetails {
    id: string;
    name: string;
    org: string;
    number: string;
    short_description?: string;
    overview?: string;
    start?: string | null;
    end?: string | null;
    effort?: string | null;
    pacing: string;
}

function formatDate(dateString?: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
}

export default function CourseDetailsPage() {
    const { courseId } = useParams();
    const [details, setDetails] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            try {
                if (!courseId) return;
                const data = await getCourseDetails(courseId);
                setDetails(data.data ?? data);
            } catch (err) {
                console.error("Failed to load course details:", err);
                setDetails(null);
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [courseId]);

    return (
        <Layout
            title={`Course Details: ${details?.name ?? courseId}`}
        >
            <div className="flex gap-2 mb-4">
                <Link
                    to={`/open-edx/course/${courseId}/grades`}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                    Grades
                </Link>

                <Link
                    to={`/open-edx/course/${courseId}/gradebook`}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                    Gradebook
                </Link>

                <Link
                    to={`/open-edx/course/${courseId}/details`}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700"
                >
                    Details
                </Link>
            </div>

            {loading ? (
                <div className="text-sm text-gray-600">Loading...</div>
            ) : !details ? (
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <p className="text-sm text-red-600">
                        Failed to load course details.
                    </p>
                </div>
            ) : (
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold">{details.name}</h2>

                    <div className="text-sm text-gray-600">
                        {details.org} / {details.number}
                    </div>

                    {details.short_description && (
                        <p className="text-sm text-gray-700">
                            {details.short_description}
                        </p>
                    )}

                    {details.overview && (
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: details.overview }}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                            <span className="font-medium">Start:</span>{" "}
                            {formatDate(details.start)}
                        </div>
                        <div>
                            <span className="font-medium">End:</span>{" "}
                            {formatDate(details.end)}
                        </div>
                        <div>
                            <span className="font-medium">Effort:</span>{" "}
                            {details.effort ?? "N/A"}
                        </div>
                        <div>
                            <span className="font-medium">Pacing:</span>{" "}
                            {details.pacing}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}