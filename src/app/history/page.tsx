'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase';

import Button from '@/components/buttons/Button';
import HistoryList from '@/components/HistoryList';

export default function HistoryPage() {
  const [userEmail, setUserEmail] = useState('');
  const [limit, setLimit] = useState(5);

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

  const loadMore = () => {
    setLimit((prev) => prev + 5);
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的歷史紀錄</h1>
        <Link href="/">
          <Button variant="outline">回到主頁</Button>
        </Link>
      </div>

      {userEmail ? (
        <>
          <HistoryList userEmail={userEmail} limit={limit} />
          <div className="text-center mt-6">
            <Button onClick={loadMore}>載入更多</Button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">請先登入以查看紀錄。</p>
      )}
    </main>
  );
}
