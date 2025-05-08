'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (!error) alert('登入連結已寄出，請至信箱點擊連結登入');
    else alert('登入失敗：' + error.message);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert('Google 登入失敗：' + error.message);
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">登入 BridgeTalk</h1>
      <input
        className="w-full p-2 border rounded"
        type="email"
        placeholder="請輸入 email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded">
        寄送登入連結
      </button>
      <button onClick={handleGoogleLogin} className="w-full bg-red-500 text-white p-2 rounded">
        使用 Google 登入
      </button>
    </main>
  );
}