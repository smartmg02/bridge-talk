import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/supabase-js';

export const createClient = (): SupabaseClient => {
  return createPagesBrowserClient();
};
