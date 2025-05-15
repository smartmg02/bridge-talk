'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Record {
  id: number;
  user_email: string;
  message: string;
  gpt_reply: string;
  created_at: string;
  audio_url?: string | null;
  mode?: string;
  tone?: string;
  recipient?: string;
  highlight?: string;
  role?: string;
}

export default function HistoryPage() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [records, setRecords] = useState<Record[]>([]);
  const [limit, setLimit] = useState<number>(5);
  const [forwardingId, setForwardingId] = useState<number | null>(null);
  const [forwardTo, setForwardTo] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
  }, []);

  useEffect(() => {
    if (userEmail) {
      const fetchData = async () => {
        const query = supabase
          .from('records')
          .select('*')
          .eq('user_email', userEmail)
          .order('created_at', { ascending: false });

        const { data, error } = limit ? await query.limit(limit) : await query;

        if (error) {
          console.error('❌ Supabase 查詢失敗:', error.message);
        } else {
          if (data && data.length > 0) {
            setRecords(data as Record[]);
          } else {
            console.warn('⚠️ 查無紀錄，可能 user_email 對不上或資料尚未寫入');
          }
        }
      };

      fetchData();
    }
  }, [userEmail, limit]);

  const loadMore = () => {
    setLimit((prev) => prev + 5);
  };

  const handleForward = async (recordId: number) => {
    if (!forwardTo) return;
    setStatus('⏳ 發送中...');

    try {
      const res = await fetch('/api/forward-from-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          forwardTo,
          userEmail,
        }),
      });

      if (res.ok) {
        setStatus('✅ 成功轉寄');
      } else {
        setStatus('❌ 發送失敗');
      }
    } catch (error) {
      console.error('轉寄錯誤', error);
      setStatus('❌ 發送錯誤');
    }
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
          {records.length === 0 ? (
            <p className="text-gray-500">尚無紀錄。</p>
          ) : (
            records.map((r) => (
              <div key={r.id} className="border p-3 rounded bg-white mb-4">
                <p className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</p>
                <p className="text-xs font-semibold text-blue-600">
                  {r.mode === 'proxy' ? '📨 轉述訊息' : '🧠 回應訊息'}
                </p>
                <p><strong>我說：</strong>{r.message}</p>
                <p><strong>AI 回應：</strong>{r.gpt_reply}</p>

                <div className="mt-2 space-y-2">
                  <input
                    type="email"
                    placeholder="輸入轉寄對象 email"
                    value={forwardingId === r.id ? forwardTo : ''}
                    onChange={(e) => {
                      setForwardingId(r.id);
                      setForwardTo(e.target.value);
                      setStatus('');
                    }}
                    className="border rounded px-2 py-1 w-full"
                  />
                  <Button onClick={() => handleForward(r.id)}>轉寄</Button>
                  {forwardingId === r.id && status && (
                    <p className="text-sm text-gray-600">{status}</p>
                  )}
                </div>
              </div>
            ))
          )}

          <div className="text-center mt-4">
            <Button onClick={loadMore}>載入更多</Button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">請先登入以查看紀錄。</p>
      )}
    </main>
  );
}
