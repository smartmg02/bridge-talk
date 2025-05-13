'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import HistoryList from '@/components/HistoryList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HistoryPage() {
  const [userEmail, setUserEmail] = useState('');
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
  }, []);

  const loadMore = () => {
    setLimit((prev) => prev + 5);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">我的歷史紀錄</h1>
        <Link href="/">
          <Button variant="outline">回到主頁</Button>
        </Link>
      </div>

      {userEmail ? (
        <>
          <HistoryList userEmail={userEmail} limit={limit} />
          <div className="mt-4 text-center">
            <Button onClick={loadMore}>載入更多</Button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">請先登入以查看紀錄。</p>
      )}
    </main>
  );
}
