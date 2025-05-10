'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import UserInputForm from '@/components/UserInputForm';
import HistoryList from '@/components/HistoryList';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [reply, setReply] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async ({
    message,
    email,
    role,
    tone,
    highlight,
  }: {
    message: string;
    email: string;
    role: string;
    tone: string;
    highlight: string;
  }) => {
    setReply('AI 回應產生中...');

    const res = await fetch('/api/third-person-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        email,
        role,
        tone,
        highlight,
        language: 'zh',
      }),
    });

    if (!res.body) {
      setReply('⚠️ 無法取得回應內容');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finalText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const clean = line.replace(/^data: /, '').trim();
        if (clean === '[DONE]') break;
        if (!clean) continue;

        try {
          const parsed = JSON.parse(clean);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            finalText += delta;
            setReply(finalText);
          }
        } catch (err) {
          console.warn('JSON parse error:', err, 'content:', clean);
        }
      }
    }

    setReply(finalText || '⚠️ 沒有接收到有效內容');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail('');
    router.push('/login');
  };

  useEffect(() => {
    const checkSession = async () => {
      console.log('[BridgeTalk] ✅ Checking Supabase session...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[BridgeTalk] ❌ Session error:', error.message);
      }

      console.log('[BridgeTalk] 🔍 Session:', session);

      if (!session?.user?.email) {
        console.warn('[BridgeTalk] ⚠️ No session found, redirecting to /login');
        router.replace('/login');
      } else {
        console.log('[BridgeTalk] ✅ Session OK. User:', session.user.email);
        setUserEmail(session.user.email);
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return <main className="p-6 text-center">載入中...</main>;
  }

  return (
    <main className="max-w-screen-md mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center border-b pb-2">
        <h1 className="text-2xl font-bold">BridgeTalk：讓 AI 替你說心裡話</h1>
        {userEmail && (
          <div className="text-right text-sm">
            <p>{userEmail}</p>
            <button className="text-blue-600 underline" onClick={handleLogout}>
              登出
            </button>
          </div>
        )}
      </header>

      <UserInputForm onSubmit={handleSubmit} />

      <section className="p-4 border rounded bg-gray-100 whitespace-pre-wrap min-h-[120px]">
        {reply || '尚未產生回應'}
      </section>

      {userEmail && <HistoryList userEmail={userEmail} limit={3} />}

      <div className="text-center">
        <button
          onClick={() => router.push('/history')}
          className="w-full bg-gray-200 p-2 rounded text-center"
        >
          查看完整歷史紀錄
        </button>
      </div>
    </main>
  );
}
