import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { InternalSupabaseService } from './internal-supabase.service';

@Module({
    providers: [SupabaseService, InternalSupabaseService],
    exports: [SupabaseService, InternalSupabaseService],
})
export class SupabaseModule { }
