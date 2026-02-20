import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getCourses } from "../api/internalReportsApi";
import { Link } from "react-router-dom";

interface Course {
    course_id: string;
    name: string;
    org: string;
    number: string;
    short_description?: string;
    pacing: string;
    media?: {
        image?: {
            raw: string;
        };
    };
}

export default function OpenEdxPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            try {
                const response = await getCourses();

                // ✅ Correct mapping based on your backend screenshot
                const results = response?.data?.results ?? [];

                setCourses(results);
            } catch (err) {
                console.error("Failed to load courses:", err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, []);

    return (
        <Layout title="Micro-Experiences">
            {loading ? (
                <div className="text-gray-600 text-sm">Loading courses...</div>
            ) : (
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                        <p className="text-sm text-gray-600">
                            Showing {courses.length} of {courses.length} courses
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {courses.map((course) => (
                            <div
                                key={course.course_id}
                                className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-6">
                                    {course.media?.image?.raw && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={course.media.image.raw}
                                                alt={course.name}
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-2">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {course.name}
                                        </h2>

                                        <p className="text-sm text-gray-600">
                                            {course.org} / {course.number}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Course ID: {course.course_id}
                                        </p>

                                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                                            <Link
                                                to={`/open-edx/course/${encodeURIComponent(
                                                    course.course_id
                                                )}/grades`}
                                                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
                                            >
                                                Grades
                                            </Link>

                                            <Link
                                                to={`/open-edx/course/${encodeURIComponent(
                                                    course.course_id
                                                )}/gradebook`}
                                                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
                                            >
                                                Gradebook
                                            </Link>

                                            <Link
                                                to={`/open-edx/course/${encodeURIComponent(
                                                    course.course_id
                                                )}/details`}
                                                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Layout>
    );
}