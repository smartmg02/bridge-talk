'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function DebugSessionPage() {
  const supabase = createClient();

  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      console.log('[Debug] Session:', session);
      if (error) {
        console.error('[Debug] Session error:', error);
      }

      setSessionInfo(session);

      // 顯示目前 document.cookie（需要在 client side）
      if (typeof document !== 'undefined') {
        setCookies(document.cookie);
      }
    };

    checkSession();
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4 text-sm">
      <h1 className="text-xl font-bold">🔍 Session Debug</h1>

      <section className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold">👤 User Info</h2>
        <pre>{sessionInfo?.user?.email || '❌ 尚未登入'}</pre>
      </section>

      <section className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold">📦 Full Session Object</h2>
        <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
      </section>

      <section className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold">🍪 Cookies</h2>
        <pre>{cookies || '❌ 沒有任何 cookie'}</pre>
      </section>
    </main>
  );
}
