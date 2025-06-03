import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

import type { Database } from '@/types/supabase';

export const createClient = () =>
  createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => nextCookies().get(name)?.value ?? '',
        set() {},
        remove() {},
      },
    }
  );
