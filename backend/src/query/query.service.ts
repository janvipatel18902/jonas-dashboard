import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ReportUserOverviewParams {
    university_name_filter?: string | null;
    completed_c4f_at_from_filter?: string | null;
    completed_c4f_at_to_filter?: string | null;
}

@Injectable()
export class QueryService {
    constructor(private readonly supabase: SupabaseService) { }

    async getUserOverview(
        params?: ReportUserOverviewParams,
    ) {
        const client = this.supabase.getClient();

        // Safe destructuring with fallback
        const {
            university_name_filter = null,
            completed_c4f_at_from_filter = null,
            completed_c4f_at_to_filter = null,
        } = params ?? {};

        const { data, error } = await client.rpc('report_user_overview', {
            university_name_filter,
            completed_c4f_at_from_filter,
            completed_c4f_at_to_filter,
        });

        if (error) {
            throw new InternalServerErrorException(
                `RPC report_user_overview failed: ${error.message}`,
            );
        }

        return data;
    }
}
