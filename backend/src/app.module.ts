import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './test.controller';
import { EventsModule } from './events/events.module';
import { OpenEdxModule } from './open-edx/open-edx.module';
import { UniversitiesModule } from './universities/universities.module';
import { EnvironmentModule } from './environment/environment.module';
import { InternalEventsModule } from './internal-events/internal-events.module';
import { QueryModule } from './query/query.module';
import { ProfessionalAccessModule } from './professional-access/professional-access.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    EventsModule,
    OpenEdxModule,
    UniversitiesModule,
    EnvironmentModule,
    InternalEventsModule,
    QueryModule,
    ProfessionalAccessModule,
    AuthModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
