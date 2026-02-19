import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfessionalAccessService {
    constructor(private readonly supabase: SupabaseService) { }

    async grantAccess(userId: string, universityName: string | null, adminEmail: string) {
        if (!userId) {
            throw new BadRequestException('Missing user_id');
        }

        if (!adminEmail.endsWith('@e1133.co')) {
            throw new UnauthorizedException('Unauthorized');
        }

        const client = this.supabase.getClient();

        const planId =
            typeof universityName === 'string' && universityName.trim() !== ''
                ? universityName
                : 'unknown';

        const startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

        /* ================= CHECK EXISTING ================= */

        const { data: existing, error: existingError } = await client
            .from('premium_access')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (existingError) {
            throw new InternalServerErrorException(existingError.message);
        }

        if (existing) {
            return { ok: true, already_granted: true };
        }

        /* ================= INSERT ================= */

        const { error: insertError } = await client
            .from('premium_access')
            .insert({
                user_id: userId,
                payment_type: 'stripe',
                plan_id: planId,
                status: 'active',
                start_date: startDate.toISOString(),
                valid_through: endDate.toISOString(),
                payment_reference: adminEmail,
                amount_paid: null,
                xp_points_used: null,
            });

        if (insertError) {
            throw new InternalServerErrorException(insertError.message);
        }

        return { ok: true, already_granted: false };
    }
}
