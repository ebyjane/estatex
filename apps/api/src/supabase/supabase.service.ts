import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Optional server-side Supabase client (Storage, Auth admin, Realtime).
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (never expose service role to the browser).
 */
@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  readonly client: SupabaseClient | null;

  constructor() {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (url && key) {
      this.client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      this.logger.log('Supabase client initialized (service role)');
    } else {
      this.client = null;
      this.logger.warn(
        'Supabase client disabled — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.',
      );
    }
  }
}
