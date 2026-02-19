import { Injectable } from '@nestjs/common';
import { InternalSupabaseService } from '../supabase/internal-supabase.service';

export interface InternalEventRow {
    id: string | number;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
    created_at: string;
    updated_at: string | null;
    registration_count?: number;
}

@Injectable()
export class InternalEventsService {
    constructor(
        private readonly internalSupabase: InternalSupabaseService,
    ) { }

    async getAllEvents(): Promise<InternalEventRow[]> {
        const client = this.internalSupabase.getClient();

        /* ================= FETCH EVENTS ================= */

        const { data: events, error: eventsError } = await client
            .from('events')
            .select('*')
            .order('start_date', { ascending: false, nullsFirst: false });

        if (eventsError) {
            throw new Error(`Failed to fetch events: ${eventsError.message}`);
        }

        if (!events || events.length === 0) {
            return [];
        }

        /* ================= FETCH REGISTRATION COUNTS ================= */

        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const { count, error: countError } = await client
                    .from('event_registrations')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_id', event.id);

                return {
                    ...event,
                    registration_count: countError ? 0 : count || 0,
                };
            }),
        );

        return eventsWithCounts;
    }
}
