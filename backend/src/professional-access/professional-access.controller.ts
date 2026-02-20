import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ProfessionalAccessService } from './professional-access.service';

interface GrantAccessBody {
  user_id?: string;
  userId?: string;
  university_name?: string;
  admin_email?: string;
}

@Controller('users/professional-access')
export class ProfessionalAccessController {
  constructor(
    private readonly professionalAccessService: ProfessionalAccessService,
  ) {}

  @Post('grant')
  async grant(@Body() body: GrantAccessBody) {
    if (!body) {
      throw new BadRequestException('Request body is missing');
    }

    const userId = body.user_id ?? body.userId;
    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    // Default fallback instead of null
    const universityName =
      body.university_name && body.university_name.trim() !== ''
        ? body.university_name
        : 'unknown';

    const adminEmail =
      body.admin_email && body.admin_email.trim() !== ''
        ? body.admin_email
        : 'system@e1133.co';

    return this.professionalAccessService.grantAccess(
      userId,
      universityName,
      adminEmail,
    );
  }
}
