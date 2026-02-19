import { Module } from '@nestjs/common';
import { ProfessionalAccessController } from './professional-access.controller';
import { ProfessionalAccessService } from './professional-access.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [ProfessionalAccessController],
    providers: [ProfessionalAccessService],
})
export class ProfessionalAccessModule { }
