import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Controller('test')
export class TestController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  async testConnection() {
    const client = this.supabase.getClient();

    const { data, error } = await client.from('webinars').select('*').limit(1);

    if (error) {
      return { error };
    }

    return { data };
  }
}
