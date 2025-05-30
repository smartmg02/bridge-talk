'use client';

import { useCallback,useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase';

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!email) return null;

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-4 text-sm">
      <span>👤 {email}</span>
      <Button onClick={handleLogout} variant="ghost">
        登出
      </Button>
    </div>
  );
}
