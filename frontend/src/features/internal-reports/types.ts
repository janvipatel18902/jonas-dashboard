export interface University {
    id: string | number;
    university_name?: string;
    name?: string;
    label?: string;
}

/* ================= USERS ================= */

export interface UserReportRow {
    id: string;
    full_name: string | null;
    email: string;
    registered_at: string;
    university_name: string | null;
    student_id: string | null;
    completed_c4f_at: string | null;
    has_c4f_record: boolean;
    has_development_objective_record: boolean;
    has_downloaded_certificate_record: boolean;
    has_professional_access: boolean;
}

/* ================= EVENTS ================= */

export interface ParticipantDetail {
    full_name: string | null;
    email: string;
}

export interface WebinarWithParticipants {
    id: number;
    title: string;
    description: string | null;
    type: string;
    language: string;
    duration: number;
    participant_limit: number;
    start_date: string | null;
    end_date: string | null;
    created_at: string | null;
    edited_at: string | null;
    cancelled_at: string | null;
    speaker_name: string;
    speaker_organisation: string;
    password_required: boolean;
    pricing_type: string;
    price: unknown;
    join_url: string | null;
    tags: string[];
    assignment: string | null;
    question_link: string | null;

    registered_participants: ParticipantDetail[];
    attended_participants: ParticipantDetail[];
    paid_participants: ParticipantDetail[];
}