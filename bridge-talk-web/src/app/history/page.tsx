// ✅ C:\bridge-talk\bridge-talk-web\src\app\history\page.tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface RecordItem {
  id: string;
  user_text: string;
  gpt_reply: string;
  audio_url: string;
  created_at: string;
  user_email?: string;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUserAndRecords = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email);

      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ 讀取失敗：', error.message);
      } else {
        setRecords(data || []);
      }
    };

    loadUserAndRecords();
  }, [router]);

  const recordsToShow = showAll ? records : records.slice(0, 3);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('records').delete().eq('id', id);
    if (error) {
      alert('刪除失敗：' + error.message);
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('回應已複製');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🗂 歷史紀錄</h1>
        <div className="flex gap-4">
          <button onClick={() => router.push('/')} className="text-blue-600 underline">
            回到首頁
          </button>
          {userEmail && (
            <button onClick={handleLogout} className="text-red-600 underline">
              登出
            </button>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <p>目前尚無紀錄。</p>
      ) : (
        <>
          <ul className="space-y-6">
            {recordsToShow.map((record) => (
              <li key={record.id} className="p-4 bg-white rounded shadow border">
                <p><strong>🗣 心聲：</strong> {record.user_text}</p>
                <p className="mt-2"><strong>🤖 回應：</strong> {record.gpt_reply}</p>
                {record.audio_url && (
                  <audio className="mt-2" src={record.audio_url} controls />
                )}
                <p className="text-gray-500 text-sm mt-2">
                  🕒 {new Date(record.created_at).toLocaleString()}
                </p>
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={() => handleCopy(record.gpt_reply)}
                    className="px-2 py-1 text-sm bg-green-500 text-white rounded"
                  >
                    📋 複製回應
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                  >
                    🗑️ 刪除紀錄
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {!showAll && records.length > 3 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAll(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔽 載入更多
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
