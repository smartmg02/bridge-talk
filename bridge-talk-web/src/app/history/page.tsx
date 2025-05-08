'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import HistoryList from '@/components/HistoryList';

export default function HistoryPage() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email ?? '');
    });
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">我的歷史紀錄</h1>
      {userEmail ? (
        <HistoryList userEmail={userEmail} />
      ) : (
        <p className="text-gray-500">請先登入以查看紀錄。</p>
      )}
    </main>
  );
}