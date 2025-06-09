'use client';

import { useCallback, useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase-browser';

import Button from './buttons/Button';

export default function AuthStatus() {
  const [email, setEmail] = useState('');
  const supabase = createClient();

  const fetchSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-4 text-sm">
      {email ? (
        <>
          <span>👤 {email}</span>
          <Button onClick={handleLogout} variant="ghost">
            登出
          </Button>
        </>
      ) : (
        <Button onClick={handleLogin} variant="primary">
          使用 Google 登入
        </Button>
      )}
    </div>
  );
}
