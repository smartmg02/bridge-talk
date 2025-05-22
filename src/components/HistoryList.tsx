'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { logError } from '@/lib/logger';
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

export default function HistoryList({
  userEmail,
  limit,
  onSelect,
  selectedId,
}: {
  userEmail: string;
  limit?: number;
  onSelect?: (id: string) => void;
  selectedId?: string;
}) {
  const [records, setRecords] = useState<Record[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const query = supabase
        .from('records')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      const { data, error } = limit ? await query.limit(limit) : await query;

      if (error) {
        logError(error.message, '❌ Supabase 查詢失敗');
      } else if (data && data.length > 0) {
        setRecords(data as Record[]);
      }
    };

    if (userEmail) {
      fetchData();
    }
  }, [userEmail, limit, supabase]);

  if (!userEmail) return null;

  return (
    <div className="space-y-4 mt-6">
      {records.length === 0 ? (
        <p className="text-muted-foreground">尚無紀錄。</p>
      ) : (
        records.map((r) => (
          <div
            key={r.id}
            onClick={() => onSelect?.(r.id.toString())}
            className={clsx(
              'rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition',
              selectedId === r.id.toString() &&
                'ring-2 ring-blue-200 border-blue-500'
            )}
          >
            <p className="text-sm text-gray-500">
              {new Date(r.created_at).toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-blue-600 mb-2">
              {r.mode === 'proxy' ? '📨 轉述訊息' : '🧠 回應訊息'}
            </p>

            <p className="mb-2">
              <strong>我說：</strong>
              {r.message}
            </p>

            <hr className="my-3 border-gray-300" />

            <p>
              <strong>AI 回應：</strong>
              {r.gpt_reply}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
