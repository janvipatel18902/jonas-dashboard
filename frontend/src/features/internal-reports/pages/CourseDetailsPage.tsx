import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getCourseDetails } from "../api/internalReportsApi";
import { CourseDetailsDisplay } from "../components/CourseDetailsDisplay";
import { EnvironmentBadge } from "../components/EnvironmentBadge";

interface CourseDetails {
    id: string;
    name: string;
}

export default function CourseDetailsPage() {
    const { courseId } = useParams<{ courseId: string }>();

    const [details, setDetails] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchDetails() {
            try {
                if (!courseId) return;

                const response = await getCourseDetails(
                    decodeURIComponent(courseId)
                );

                const data = response?.data ?? response;

                setDetails(data);
            } catch (err) {
                console.error("Failed to load course details:", err);
                setDetails(null);
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [courseId]);

    // return (
    //     <Layout
    //         title={
    //             <div className="space-y-2">
    //                 {/* MAIN HEADER */}
    //                 <div className="flex items-center justify-between">
    //                     <h1 className="text-2xl font-semibold text-gray-900">
    //                         Course Details
    //                     </h1>
    //                     <EnvironmentBadge />
    //                 </div>

    //                 {/* COURSE NAME */}
    //                 {details && (
    //                     <h2 className="text-lg text-gray-800">
    //                         {details.name}
    //                     </h2>
    //                 )}
    //             </div>
    //         }
    //     >
    //         {/* NAVIGATION TABS */}
    //         <div className="flex gap-2 mb-6">
    //             <Link
    //                 to={`/open-edx/course/${courseId ?? ""}/grades`}
    //                 className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
    //             >
    //                 Grades
    //             </Link>

    //             <Link
    //                 to={`/open-edx/course/${courseId ?? ""}/gradebook`}
    //                 className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
    //             >
    //                 Gradebook
    //             </Link>

    //             <Link
    //                 to={`/open-edx/course/${courseId ?? ""}/details`}
    //                 className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700"
    //             >
    //                 Details
    //             </Link>
    //         </div>

    //         {loading ? (
    //             <div className="text-sm text-gray-500">
    //                 Loading...
    //             </div>
    //         ) : !details ? (
    //             <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm text-red-600 text-sm">
    //                 Failed to load course details.
    //             </div>
    //         ) : (
    //             <CourseDetailsDisplay details={details as any} />
    //         )}
    //     </Layout>
    // );





    return (
        <Layout title="Course Details">
            {/* Back Button */}
            <div className="mb-4">
                <Link
                    to="/open-edx"
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                    ← Back to Micro-Experiences
                </Link>
            </div>

            {/* Course Name + Environment */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    {details?.name ?? "Loading..."}
                </h2>
                <EnvironmentBadge />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Link
                    to={`/open-edx/course/${courseId ?? ""}/grades`}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    Grades
                </Link>

                <Link
                    to={`/open-edx/course/${courseId ?? ""}/gradebook`}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    Gradebook
                </Link>

                <Link
                    to={`/open-edx/course/${courseId ?? ""}/details`}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700"
                >
                    Details
                </Link>
            </div>

            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : !details ? (
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm text-red-600 text-sm">
                    Failed to load course details.
                </div>
            ) : (
                <CourseDetailsDisplay details={details as any} />
            )}
        </Layout>
    );
}