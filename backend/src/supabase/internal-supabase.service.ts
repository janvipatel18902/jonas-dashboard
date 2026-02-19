import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalSupabaseService {
    private client: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        const url = this.configService.get<string>(
            'NEXT_PUBLIC_APP_INTERNAL_SUPABASE_URL',
        );

        const serviceRoleKey = this.configService.get<string>(
            'APP_INTERNAL_SUPABASE_SERVICE_ROLE_KEY',
        );

        if (!url || !serviceRoleKey) {
            throw new Error(
                'Internal Supabase environment variables not configured properly',
            );
        }

        this.client = createClient(url, serviceRoleKey);
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}
