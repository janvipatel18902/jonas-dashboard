import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getCourseGrades, getCourseDetails } from "../api/internalReportsApi";
import { CourseGradesTable } from "../components/CourseGradesTable";
import { EnvironmentBadge } from "../components/EnvironmentBadge";

interface GradeRow {
    username: string;
    email: string;
    course_id: string;
    passed: boolean;
    percent: number;
    letter_grade: string | null;
}

export default function CourseGradesPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const [rows, setRows] = useState<GradeRow[]>([]);
    const [courseName, setCourseName] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!courseId) return;

            const decoded = decodeURIComponent(courseId);

            const [gradesRes, detailsRes] = await Promise.all([
                getCourseGrades(decoded),
                getCourseDetails(decoded),
            ]);

            setRows(gradesRes?.data?.results ?? []);
            setCourseName(detailsRes?.data?.name ?? detailsRes?.name ?? "");
            setLoading(false);
        }

        fetchData();
    }, [courseId]);

    return (
        <Layout title="Course Grades">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">
                    {courseName}
                </h1>
                <EnvironmentBadge />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Link
                    to={`/open-edx/course/${courseId ?? ""}/grades`}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700"
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
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
                >
                    Details
                </Link>
            </div>

            {loading ? (
                <div className="text-sm text-gray-600">Loading...</div>
            ) : (
                <CourseGradesTable data={rows} />
            )}
        </Layout>
    );
}