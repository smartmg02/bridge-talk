'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase';

import AuthStatus from '@/components/AuthStatus';
import Button from '@/components/buttons/Button';
import HistoryList from '@/components/HistoryList';
import UserInputForm from '@/components/UserInputForm';

export default function HomePage() {
  const [reply, setReply] = useState('');
  const [mode, setMode] = useState<'proxy' | 'reply'>('reply');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const recipientOptions = ['老公', '老婆', '主管', '同事', '朋友', '父親', '母親'];

  useEffect(() => {
    const fetchUserEmail = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUserEmail();
  }, [supabase.auth]);

  const handleSubmit = async ({
    message,
    role,
    tone,
    recipient,
    mode: submitMode,
  }: {
    message: string;
    role: string;
    tone: 'soft' | 'normal' | 'strong';
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => {
    setReply('');

    const res = await fetch(`/api/third-person-${submitMode === 'proxy' ? 'message' : 'reply'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tone, role, recipient }),
    });

    if (!res.ok || !res.body) {
      const errorText = await res.text();
      setReply(`⚠️ 產生失敗：${errorText}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        const trimmed = line.replace(/^data: /, '').trim();
        if (!trimmed || trimmed === '[DONE]') continue;

        try {
          const json = JSON.parse(trimmed);
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            setReply((prev) => prev + content);
          }
        } catch {
          // 忽略錯誤格式資料
        }
      }
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto mb-4">
        <AuthStatus />
      </div>

      <div className="max-w-2xl mx-auto mb-4 space-x-4 text-center">
        <Button
          variant={mode === 'reply' ? 'primary' : 'ghost'}
          onClick={() => setMode('reply')}
        >
          回應模式
        </Button>
        <Button
          variant={mode === 'proxy' ? 'primary' : 'ghost'}
          onClick={() => setMode('proxy')}
        >
          代言模式
        </Button>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <UserInputForm
          onSubmit={handleSubmit}
          mode={mode}
          maxMessageLength={800}
          disableRecipient={mode === 'reply'}
          recipientOptions={recipientOptions}
        />
      </div>

      {reply && (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-300 rounded">
          <h4 className="text-md font-semibold mb-2">AI 回應</h4>
          <p className="whitespace-pre-wrap text-sm text-gray-800">{reply}</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto mt-8">
        <h3 className="text-lg font-semibold mb-2">最近紀錄預覽</h3>
        <HistoryList userEmail={userEmail} selectedId={undefined} limit={3} />
      </div>

      <div className="text-center mt-8">
        <Button variant="primary" onClick={() => router.push('/history')}>
          查看所有紀錄
        </Button>
      </div>
    </main>
  );
}
