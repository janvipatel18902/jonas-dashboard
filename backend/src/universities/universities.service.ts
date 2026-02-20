import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UniversitiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUniversities() {
    const client = this.supabaseService.getClient();

    const { data, error } = await client.from('universities').select('*');

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch universities: ${error.message}`,
      );
    }

    return data;
  }
}
