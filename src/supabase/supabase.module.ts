import { Module , Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global()  // one client for the whole app, no re-import needed
@Module({
    providers: [SupabaseService], // makes the service injectable
    exports: [SupabaseService] // lets OTHER modules use it
})
export class SupabaseModule {}
