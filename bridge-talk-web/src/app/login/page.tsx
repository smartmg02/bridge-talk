'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  };

  const loginWithEmail = async () => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });
    alert('登入連結已寄出，請至信箱點擊以完成登入');
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold text-center">登入</h1>
      <input
        type="email"
        placeholder="輸入 Email"
        className="w-full p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={loginWithEmail} className="w-full bg-blue-600 text-white p-2 rounded">
        使用 Email 登入
      </button>
      <button onClick={loginWithGoogle} className="w-full bg-red-600 text-white p-2 rounded">
        使用 Google 登入
      </button>
    </main>
  );
}
