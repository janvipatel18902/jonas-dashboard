export interface ParticipantDetail {
    full_name: string | null;
    email: string;
}

export interface WebinarWithParticipants {
    id: number;
    created_at: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    duration: number;
    language: string;
    speaker_name: string;
    speaker_organisation: string;
    join_url: string;
    cancelled_at: string | null;
    edited_at: string | null;
    tags: string[];
    participant_limit: number;
    type: string;
    created_by: string;
    password_required: boolean;
    password: string | null;
    pricing_type: string;
    price: unknown | null;
    assignment: string | null;
    question_link: string | null;
    registered_participants: ParticipantDetail[];
    attended_participants: ParticipantDetail[];
    paid_participants: ParticipantDetail[];
}
