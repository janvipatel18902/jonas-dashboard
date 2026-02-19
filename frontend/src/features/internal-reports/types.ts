export interface University {
    id: string | number;
    university_name?: string;
    name?: string;
    label?: string;
}

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
