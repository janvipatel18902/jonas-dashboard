export interface CoursesApiResponse {
    results: Course[];
    pagination: Pagination;
}

export interface Pagination {
    next: string | null;
    previous: string | null;
    count: number;
    num_pages: number;
}

export interface Course {
    blocks_url: string;
    effort: string | null;
    end: string | null;
    enrollment_start: string | null;
    enrollment_end: string | null;

    id: string;
    course_id: string;

    media: CourseMedia;

    name: string;
    number: string;
    org: string;

    short_description: string;

    start: string | null;
    start_display: string | null;
    start_type: string | null;

    pacing: "self" | "instructor" | string;
    mobile_available: boolean;
    hidden: boolean;
    invitation_only: boolean;
}

export interface CourseMedia {
    banner_image: BannerImage;
    course_image: SimpleImage;
    course_video: { uri: string | null };
    image: CourseImageSet;
}

export interface BannerImage {
    uri: string;
    uri_absolute: string;
}

export interface SimpleImage {
    uri: string;
}

export interface CourseImageSet {
    raw: string;
    small: string;
    large: string;
}

export interface CourseGradesResponse {
    next: string | null;
    previous: string | null;
    results: CourseGradeResult[];
}

export interface CourseGradeResult {
    username: string;
    email: string;
    course_id: string;
    passed: boolean;
    percent: number;
    letter_grade: string | null;
}

export interface GradebookResult {
    user_id: number;
    username: string;
    email: string;
    percent: number;
    section_breakdown: GradebookSectionBreakdown[];
}

export type GradeCategory =
    | "Self_Assessment"
    | "Peer_Assessment"
    | "Peer_Meeting";

export interface GradebookSectionBreakdown {
    attempted: boolean;
    category: GradeCategory;
    label: string;
    module_id: string;
    percent: number;
    score_earned: number;
    score_possible: number;
    subsection_name: string;
}

export interface GradebookResponse {
    next: string | null;
    previous: string | null;
    results: GradebookResult[];
}

export interface CourseDetailResponse {
    access_expiration: string | null;
    can_show_upgrade_sock: boolean;
    content_type_gating_enabled: boolean;

    course_goals: {
        selected_goal: string | null;
        weekly_learning_goal_enabled: boolean;
    };

    effort: string | null;
    end: string | null;

    enrollment: {
        mode: string | null;
        is_active: boolean;
    };

    enrollment_start: string | null;
    enrollment_end: string | null;

    entrance_exam_data: {
        entrance_exam_current_score: number;
        entrance_exam_enabled: boolean;
        entrance_exam_id: string;
        entrance_exam_minimum_score_pct: number;
        entrance_exam_passed: boolean;
    };

    id: string;
    license: string | null;
    language: string | null;

    media: {
        course_image: {
            uri: string | null;
        };
        course_video: {
            uri: string | null;
        };
        image: {
            raw: string;
            small: string;
            large: string;
        };
    };

    name: string;
    offer: unknown | null;
    related_programs: unknown | null;

    short_description: string;

    start: string | null;
    start_display: string | null;
    start_type: string | null;

    pacing: "self" | "instructor-paced" | string;
    user_timezone: string | null;

    show_calculator: boolean;
    can_access_proctored_exams: boolean;

    notes: {
        enabled: boolean;
        visible: boolean;
    };

    marketing_url: string | null;

    celebrations: {
        first_section: boolean;
        streak_length_to_celebrate: number | null;
        streak_discount_enabled: boolean;
        weekly_goal: boolean;
    };

    user_has_passing_grade: boolean;
    course_exit_page_is_active: boolean;

    certificate_data: unknown | null;
    verify_identity_url: string | null;
    verification_status: string;
    linkedin_add_to_profile_url: string | null;

    is_integrity_signature_enabled: boolean;
    user_needs_integrity_signature: boolean;

    learning_assistant_enabled: boolean;
}
