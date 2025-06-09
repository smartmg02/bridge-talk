'use client';

import { useState } from 'react';

import { createClient } from '@/lib/supabase-browser';

import Button from '@/components/buttons/Button';
import { Input } from '@/components/forms/Input';

export default function LoginForm() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleMagicLinkLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000',
      },
    });

    if (error) {
      setMessage('❌ 發送登入連結失敗：' + error.message);
    } else {
      setMessage('✅ 登入連結已寄出，請查收 Email。');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000',
      },
    });

    if (error) {
      setMessage('❌ Google 登入失敗：' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email 輸入欄位 */}
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="請輸入 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          onClick={handleMagicLinkLogin}
          className="w-full"
          variant="primary"
          size="base"
        >
          送出登入連結
        </Button>
      </div>

      {/* Google 登入 */}
      <div>
        <Button
          onClick={handleGoogleLogin}
          className="w-full"
          variant="outline"
          size="base"
        >
          使用 Google 登入
        </Button>
      </div>

      {/* 訊息顯示 */}
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
