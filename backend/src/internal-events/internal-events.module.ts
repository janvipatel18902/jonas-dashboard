import { Module } from '@nestjs/common';
import { InternalEventsController } from './internal-events.controller';
import { InternalEventsService } from './internal-events.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [InternalEventsController],
  providers: [InternalEventsService],
})
export class InternalEventsModule {}
