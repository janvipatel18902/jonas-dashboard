import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getCourseGradebook, getCourseDetails } from "../api/internalReportsApi";
import { CourseGradebookTable } from "../components/CourseGradebookTable";
import { EnvironmentBadge } from "../components/EnvironmentBadge";

interface GradebookSectionBreakdown {
    attempted: boolean;
    label: string;
    percent: number;
    score_earned: number;
    score_possible: number;
    subsection_name: string;
}

interface GradebookRow {
    user_id: number;
    username: string;
    email: string;
    percent: number;
    section_breakdown: GradebookSectionBreakdown[];
}

export default function CourseGradebookPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const [rows, setRows] = useState<GradebookRow[]>([]);
    const [courseName, setCourseName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!courseId) return;

            const decoded = decodeURIComponent(courseId);

            const [gradebookRes, detailsRes] = await Promise.all([
                getCourseGradebook(decoded),
                getCourseDetails(decoded),
            ]);

            setRows(gradebookRes?.data?.results ?? []);
            setCourseName(detailsRes?.data?.name ?? detailsRes?.name ?? "");
            setLoading(false);
        }

        fetchData();
    }, [courseId]);

    // return (
    //     <Layout title="Course Gradebook">
    //         <div className="flex items-center justify-between mb-4">
    //             <h1 className="text-xl font-semibold">
    //                 {courseName}
    //             </h1>
    //             <EnvironmentBadge />
    //         </div>

    //         <div className="flex gap-2 mb-6">
    //             <Link
    //                 to={`/open-edx/course/${courseId ?? ""}/grades`}
    //                 className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
    //             >
    //                 Grades
    //             </Link>

    //             <Link
    //                 to={`/open-edx/course/${courseId ?? ""}/gradebook`}
    //                 className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700"
    //             >
    //                 Gradebook
    //             </Link>

    //             <Link
    //                 to={`/open-edx/course/${courseId ?? ""}/details`}
    //                 className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
    //             >
    //                 Details
    //             </Link>
    //         </div>

    //         {loading ? (
    //             <div className="text-sm text-gray-500">Loading...</div>
    //         ) : (
    //             <CourseGradebookTable data={rows} />
    //         )}
    //     </Layout>
    // );





    return (
        <Layout title="Course Gradebook">
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
                    {courseName}
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
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700"
                >
                    Gradebook
                </Link>

                <Link
                    to={`/open-edx/course/${courseId ?? ""}/details`}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    Details
                </Link>
            </div>

            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : (
                <CourseGradebookTable data={rows} />
            )}
        </Layout>
    );
}