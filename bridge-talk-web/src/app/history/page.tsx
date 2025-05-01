'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RecordItem {
  id: string;
  user_text: string;
  gpt_reply: string;
  audio_url: string;
  created_at: string;
}

const BATCH_SIZE = 3; // 🔥 每次載入3筆

export default function HistoryPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE); // 🔥 控制顯示的筆數

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🎯 撈回來的資料：', data);

      if (error) {
        console.error('讀取歷史紀錄失敗：', error.message);
      } else {
        setRecords(data || []);
      }
    };

    fetchRecords();
  }, []);

  const loadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  const recordsToShow = records.slice(0, visibleCount); // 🔥 顯示到目前允許的筆數

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🗂 歷史紀錄</h1>

      {records.length === 0 ? (
        <p>目前尚無紀錄。</p>
      ) : (
        <>
          <ul className="space-y-6">
            {recordsToShow.map((record) => (
              <li key={record.id} className="p-4 bg-white rounded shadow border">
                
                {/* 🔵 來源 Icon */}
                <div className="flex items-center space-x-2 mb-2">
                  {record.audio_url ? (
                    <span className="text-blue-500">🎤 語音輸入</span>
                  ) : (
                    <span className="text-green-500">🖊️ 文字輸入</span>
                  )}
                </div>

                <p><strong>🗣 心聲：</strong> {record.user_text}</p>
                <p className="mt-2"><strong>🤖 回應：</strong> {record.gpt_reply}</p>

                {record.audio_url && (
                  <audio className="mt-2" src={record.audio_url} controls />
                )}

                <p className="text-gray-500 text-sm mt-2">
                  🕒 {new Date(record.created_at).toLocaleString()}
                </p>

              </li>
            ))}
          </ul>

          {/* 🔽 載入更多按鈕，只在還有更多資料時顯示 */}
          {visibleCount < records.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
