'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClient } from '@/lib/supabase';

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}