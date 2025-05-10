'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('🔄 處理登入中...');

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get('code');
      if (!code) {
        setStatus('❌ 沒有授權碼 (code)');
        setTimeout(() => router.replace('/login'), 2000);
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStatus('❌ Token 交換失敗: ' + error.message);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setStatus('✅ 登入成功: ' + session.user.email);
        setTimeout(() => router.replace('/'), 1500);
      } else {
        setStatus('⚠️ 沒有 session，2 秒後返回登入');
        setTimeout(() => router.replace('/login'), 2000);
      }
    };
    run();
  }, []);

  return (
    <main className="p-6 text-center">
      <h1 className="text-lg font-bold">🧠 處理登入流程</h1>
      <p>{status}</p>
    </main>
  );
}
