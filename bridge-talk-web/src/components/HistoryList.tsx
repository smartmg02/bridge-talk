'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Record = {
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
};

export default function HistoryList({ userEmail, limit }: { userEmail: string; limit?: number }) {
  const [records, setRecords] = useState<Record[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      console.log('📬 嘗試讀取紀錄 for user_email:', userEmail);

      const query = supabase
        .from('records')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      const { data, error } = limit ? await query.limit(limit) : await query;

      if (error) {
        console.error('❌ Supabase 查詢失敗:', error.message);
      } else {
        console.log('📥 查詢結果:', data);
        if (data && data.length > 0) {
          setRecords(data as Record[]);
        } else {
          console.warn('⚠️ 查無紀錄，可能 user_email 對不上或資料尚未寫入');
        }
      }
    };

    if (userEmail) {
      fetchData();
    }
  }, [userEmail, limit]);

  return (
    <div className="space-y-2 mt-6">
      <h2 className="text-lg font-semibold">歷史紀錄</h2>
      <p className="text-sm text-gray-400">目前使用者: {userEmail}</p>
      {records.length === 0 ? (
        <p className="text-gray-500">尚無紀錄。</p>
      ) : (
        records.map((r) => (
          <div key={r.id} className="border p-3 rounded bg-white">
            <p className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</p>
            <p className="text-xs font-semibold text-blue-600">
              {r.mode === 'proxy' ? '📨 轉述訊息' : '🧠 回應訊息'}
            </p>
            <p><strong>我說：</strong>{r.message}</p>
            <p><strong>AI 回應：</strong>{r.gpt_reply}</p>
          </div>
        ))
      )}
    </div>
  );
}
