'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase';

import Button from '@/components/buttons/Button';
import UserInputForm from '@/components/UserInputForm';

export default function HomePage() {
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchSession();
  }, [supabase]);

  const handleSubmit = (data: {
    message: string;
    email: string;
    role: string;
    tone: string;
    highlight: string;
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => {
    // eslint-disable-next-line no-console
    console.log('📨 提交資料:', data);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-300 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {userEmail ? `登入中帳號：${userEmail}` : '尚未登入'}
          </div>
          <Button variant="outline" onClick={() => router.push('/history')}>
            查看歷史紀錄
          </Button>
        </div>

        <UserInputForm
          onSubmit={handleSubmit}
          mode="reply"
          maxMessageLength={800}
          maxHighlightLength={100}
        />
      </div>
    </main>
  );
}
