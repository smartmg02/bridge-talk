'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <div className="space-y-4">
      <Input
        type="email"
        placeholder="請輸入 Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleMagicLinkLogin} className="w-full">
        使用 Email 登入
      </Button>
      <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
        使用 Google 登入
      </Button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
