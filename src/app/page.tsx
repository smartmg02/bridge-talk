'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase';

import Button from '@/components/buttons/Button';
import UserInputForm from '@/components/UserInputForm';

import { roleOptions } from '@/constant/proxyRoleOptions';
import { parseOpenAIStream } from '@/utils/parseOpenAIStream';

export default function HomePage() {
  const [userEmail, setUserEmail] = useState('');
  const [reply, setReply] = useState('');
  const [mode, setMode] = useState<'reply' | 'proxy'>('reply');
  const role = roleOptions[0]?.value || 'bestie';
  const [isLoading, setIsLoading] = useState(false);
  const replyRef = useRef<HTMLDivElement>(null);
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

  const handleSubmit = async (data: {
    message: string;
    email: string;
    role: string;
    tone: string;
    highlight: string;
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => {
    try {
      setReply('');
      setIsLoading(true);

      const currentMode = data.mode ?? 'reply';
      const endpoint =
        currentMode === 'reply'
          ? '/api/third-person-reply'
          : '/api/third-person-message';

      const payload = {
        ...data,
        userInput: data.message,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.body) throw new Error('⚠️ 沒有接收到串流資料');

      await parseOpenAIStream(res.body, (delta) => {
        setReply((prev) => prev + delta);
        setTimeout(() => {
          replyRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
      });
    } catch (err) {
      setReply('⚠️ 系統錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">選擇模式</label>
          <select
            value={mode}
            onChange={(e) => {
              setReply('');
              setMode(e.target.value as 'reply' | 'proxy');
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="reply">🧠 第三人稱 AI 回應</option>
            <option value="proxy">📨 訊息轉述給對方</option>
          </select>
        </div>

        <UserInputForm
          onSubmit={(data) => handleSubmit({ ...data, role })}
          mode={mode}
          maxMessageLength={800}
          maxHighlightLength={100}
        />

        {isLoading && (
          <div className="text-center text-gray-500 animate-pulse">
            AI 回應產生中...
          </div>
        )}

        {reply && (
          <div
            ref={replyRef}
            className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold mb-2">AI 回應結果</h2>
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
              {reply}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
