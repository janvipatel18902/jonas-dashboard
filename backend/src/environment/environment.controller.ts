import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('environment')
export class EnvironmentController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getEnvironment() {
    const supabaseUrl = this.configService.get<string>(
      'EXTERNAL_DATABASE_SUPABASE_URL',
    );

    if (!supabaseUrl) {
      throw new InternalServerErrorException(
        'EXTERNAL_DATABASE_SUPABASE_URL not configured',
      );
    }

    if (supabaseUrl === 'https://fitsrpssvvqtpxeeyysn.supabase.co') {
      return { environment: 'PRODUCTION' };
    }

    if (supabaseUrl === 'https://pdgvgcpyzilovoejbijp.supabase.co') {
      return { environment: 'DEVELOPMENT' };
    }

    return {
      environment: 'UNKNOWN',
      url: supabaseUrl,
    };
  }
}
