import React from "react";

interface CourseDetailResponse {
    id: string;
    name: string;
    short_description?: string | null;
    language?: string | null;
    pacing?: string | null;
    effort?: string | null;

    start?: string | null;
    start_display?: string | null;
    end?: string | null;
    enrollment_start?: string | null;
    enrollment_end?: string | null;
    access_expiration?: string | null;

    enrollment?: {
        mode?: string | null;
        is_active?: boolean;
    };

    user_has_passing_grade?: boolean;
    verification_status?: string | null;

    entrance_exam_data?: {
        entrance_exam_enabled?: boolean;
        entrance_exam_id?: string | null;
        entrance_exam_current_score?: number | null;
        entrance_exam_minimum_score_pct?: number | null;
        entrance_exam_passed?: boolean;
    };

    course_goals?: {
        selected_goal?: string | null;
        weekly_learning_goal_enabled?: boolean;
    };

    media?: {
        course_image?: { uri?: string | null };
        course_video?: { uri?: string | null };
    };

    marketing_url?: string | null;
    verify_identity_url?: string | null;
    linkedin_add_to_profile_url?: string | null;

    celebrations?: {
        first_section?: boolean;
        weekly_goal?: boolean;
        streak_discount_enabled?: boolean;
        streak_length_to_celebrate?: number | null;
    };
}

interface Props {
    details: CourseDetailResponse;
}

function formatDate(dateString?: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
}

function bool(val?: boolean) {
    return val ? "Yes" : "No";
}

export function CourseDetailsDisplay({ details }: Props) {
    return (
        <div className="space-y-6">

            {/* BASIC INFORMATION */}
            <div className="border rounded-xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                    <div>
                        <span className="font-medium text-gray-600">Course Name</span>
                        <p className="mt-1">{details.name}</p>
                    </div>

                    <div>
                        <span className="font-medium text-gray-600">Course ID</span>
                        <p className="mt-1 font-mono">{details.id}</p>
                    </div>

                    <div>
                        <span className="font-medium text-gray-600">Short Description</span>
                        <p className="mt-1">{details.short_description ?? "N/A"}</p>
                    </div>

                    <div>
                        <span className="font-medium text-gray-600">Language</span>
                        <p className="mt-1">{details.language ?? "N/A"}</p>
                    </div>

                    <div>
                        <span className="font-medium text-gray-600">Pacing</span>
                        <p className="mt-1 capitalize">{details.pacing ?? "N/A"}</p>
                    </div>

                    <div>
                        <span className="font-medium text-gray-600">Effort</span>
                        <p className="mt-1">{details.effort ?? "N/A"}</p>
                    </div>

                </div>
            </div>

            {/* DATES */}
            <div className="border rounded-xl p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Dates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>Start: {details.start_display ?? formatDate(details.start)}</div>
                    <div>End: {formatDate(details.end)}</div>
                    <div>Enrollment Start: {formatDate(details.enrollment_start)}</div>
                    <div>Enrollment End: {formatDate(details.enrollment_end)}</div>
                    <div>Access Expiration: {formatDate(details.access_expiration)}</div>
                </div>
            </div>

            {/* ENROLLMENT (SAFE) */}
            {details.enrollment && (
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Enrollment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>Mode: {details.enrollment.mode ?? "N/A"}</div>
                        <div>Active: {bool(details.enrollment.is_active)}</div>
                        <div>Passing Grade: {bool(details.user_has_passing_grade)}</div>
                        <div>Verification: {details.verification_status ?? "N/A"}</div>
                    </div>
                </div>
            )}

            {/* ENTRANCE EXAM (SAFE) */}
            {details.entrance_exam_data?.entrance_exam_enabled && (
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Entrance Exam</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>Exam ID: {details.entrance_exam_data.entrance_exam_id ?? "N/A"}</div>
                        <div>Current Score: {details.entrance_exam_data.entrance_exam_current_score ?? "N/A"}</div>
                        <div>Minimum Score %: {details.entrance_exam_data.entrance_exam_minimum_score_pct ?? "N/A"}</div>
                        <div>Passed: {bool(details.entrance_exam_data.entrance_exam_passed)}</div>
                    </div>
                </div>
            )}

            {/* GOALS (SAFE) */}
            {details.course_goals && (
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Course Goals</h2>
                    <div className="text-sm space-y-2">
                        <div>Selected Goal: {details.course_goals.selected_goal ?? "N/A"}</div>
                        <div>Weekly Goal Enabled: {bool(details.course_goals.weekly_learning_goal_enabled)}</div>
                    </div>
                </div>
            )}

            {/* MEDIA */}
            {details.media?.course_image?.uri && (
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Media</h2>
                    <img
                        src={`https://learn.e1133.co${details.media.course_image.uri}`}
                        alt={details.name}
                        className="w-48 rounded-lg border"
                    />
                </div>
            )}

            {/* URLS */}
            {(details.marketing_url ||
                details.verify_identity_url ||
                details.linkedin_add_to_profile_url) && (
                    <div className="border rounded-xl p-6 bg-white shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">URLs</h2>
                        <div className="text-sm space-y-2 break-all">
                            {details.marketing_url && <div>{details.marketing_url}</div>}
                            {details.verify_identity_url && <div>{details.verify_identity_url}</div>}
                            {details.linkedin_add_to_profile_url && <div>{details.linkedin_add_to_profile_url}</div>}
                        </div>
                    </div>
                )}

            {/* CELEBRATIONS (SAFE) */}
            {details.celebrations && (
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Celebrations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>First Section: {bool(details.celebrations.first_section)}</div>
                        <div>Weekly Goal: {bool(details.celebrations.weekly_goal)}</div>
                        <div>Streak Discount Enabled: {bool(details.celebrations.streak_discount_enabled)}</div>
                        <div>Streak Length: {details.celebrations.streak_length_to_celebrate ?? "N/A"}</div>
                    </div>
                </div>
            )}

        </div>
    );
}