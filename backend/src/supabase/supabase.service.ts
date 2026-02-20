import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.EXTERNAL_DATABASE_SUPABASE_URL!,
      process.env.EXTERNAL_DATABASE_SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
