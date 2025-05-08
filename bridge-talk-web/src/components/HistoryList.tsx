'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Record = {
  id: number;
  user_email: string;
  message: string;
  ai_reply: string;
  created_at: string;
};

export default function HistoryList({ userEmail }: { userEmail: string }) {
  const [records, setRecords] = useState<Record[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('records')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (data) setRecords(data);
    };

    fetchData();
  }, [userEmail]);

  return (
    <div className="space-y-2 mt-6">
      <h2 className="text-lg font-semibold">歷史紀錄</h2>
      {records.length === 0 ? (
        <p className="text-gray-500">尚無紀錄。</p>
      ) : (
        records.map((r) => (
          <div key={r.id} className="border p-3 rounded bg-white">
            <p className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</p>
            <p><strong>我說：</strong>{r.message}</p>
            <p><strong>AI 回應：</strong>{r.ai_reply}</p>
          </div>
        ))
      )}
    </div>
  );
}
