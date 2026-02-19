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
    start?: string | null;
    end?: string | null;
    effort?: string | null;
    pacing: string;
    mobile_available: boolean;
    hidden: boolean;
    invitation_only: boolean;
    media?: {
        course_image?: {
            uri: string;
        };
    };
}

export default function OpenEdxPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            try {
                const data = await getCourses();

                // Robust response handling
                const results =
                    data?.results ??
                    data?.data?.results ??
                    data ??
                    [];

                const total =
                    data?.pagination?.count ??
                    data?.data?.pagination?.count ??
                    results.length;

                setCourses(results);
                setCount(total);
            } catch (err) {
                console.error("Failed to load courses:", err);
                setCourses([]);
                setCount(0);
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, []);

    return (
        <Layout title="Micro-Experiences" environment="PRODUCTION">
            {loading ? (
                <div className="text-gray-600 text-sm">Loading courses...</div>
            ) : (
                <div className="space-y-4">
                    {/* Course count */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                        <p className="text-sm text-gray-600">
                            Showing {courses.length} of {count} courses
                        </p>
                    </div>

                    {/* Course list */}
                    <div className="grid gap-4">
                        {courses.map((course) => (
                            <div
                                key={course.course_id}
                                className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-6">
                                    {/* Course Image */}
                                    {course.media?.course_image && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={
                                                    "https://learn.e1133.co" +
                                                    course.media.course_image.uri
                                                }
                                                alt={course.name}
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {/* Course Content */}
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {course.name}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                {course.org} / {course.number}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Course ID: {course.course_id}
                                            </p>
                                        </div>

                                        {course.short_description && (
                                            <p className="text-sm text-gray-700 line-clamp-2">
                                                {course.short_description}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                                            <Link
                                                to={`/open-edx/course/${encodeURIComponent(
                                                    course.course_id
                                                )}/grades`}
                                                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                            >
                                                Grades
                                            </Link>

                                            <Link
                                                to={`/open-edx/course/${encodeURIComponent(
                                                    course.course_id
                                                )}/gradebook`}
                                                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                            >
                                                Gradebook
                                            </Link>

                                            <Link
                                                to={`/open-edx/course/${encodeURIComponent(
                                                    course.course_id
                                                )}/details`}
                                                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
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
