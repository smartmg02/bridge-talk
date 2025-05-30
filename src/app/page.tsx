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
  const [loading, setLoading] = useState(false);
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
    if (!userEmail) return;

    // Step 1: Debug log - 檢查送出內容
    console.log('[前端送出]', {
      message,
      role,
      tone,
      recipient,
      mode: submitMode,
      email: userEmail,
    });

    setLoading(true);
    setReply('AI 回應產出中...');

    const res = await fetch(`/api/third-person-${submitMode === 'proxy' ? 'message' : 'reply'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tone, role, recipient, email: userEmail }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      console.warn('[❌ 回應失敗]', data);
      setReply(`⚠️ 產生失敗：${data.error || '未知錯誤'}`);
      return;
    }

    console.log('[✅ 回應成功]', data.reply);
    setReply(data.reply);
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
        {userEmail ? (
          <UserInputForm
            onSubmit={handleSubmit}
            mode={mode}
            maxMessageLength={800}
            disableRecipient={mode === 'reply'}
            recipientOptions={recipientOptions}
          />
        ) : (
          <div className="text-center text-gray-600 p-4 border border-gray-300 rounded">
            請先登入才能輸入心聲 ✨
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-300 rounded min-h-[120px]">
        <h4 className="text-md font-semibold mb-2">AI 回應</h4>
        <p className="whitespace-pre-wrap text-sm text-gray-800">
          {loading && !reply ? 'AI 回應產出中...' : reply}
        </p>
      </div>

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
