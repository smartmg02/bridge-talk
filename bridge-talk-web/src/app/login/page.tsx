'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(`登入失敗：${error.message}`);
    } else {
      setMessage('📬 請查看你的信箱以完成登入連結。');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) {
      setMessage(`Google 登入失敗：${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">🔐 登入 BridgeTalk</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">使用 Email 登入</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleLogin}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded w-full"
        >
          ✉️ 寄送登入連結
        </button>
      </div>

      <div className="text-center my-4 text-gray-500">或</div>

      <button
        onClick={handleGoogleLogin}
        className="w-full px-4 py-2 bg-red-500 text-white rounded"
      >
        使用 Google 帳號登入
      </button>

      {message && (
        <div className="mt-4 text-sm text-gray-700">
          {message}
        </div>
      )}
    </div>
  );
}
