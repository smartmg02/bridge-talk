// ✅ 使用 createBrowserClient，支援 SSR 和 client-side
import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
