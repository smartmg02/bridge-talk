'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import UserInputForm from '@/components/UserInputForm';
import HistoryList from '@/components/HistoryList';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [reply, setReply] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [mode, setMode] = useState<'reply' | 'proxy'>('reply');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState<'soft' | 'normal' | 'strong'>('normal');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async ({
    message,
    email,
    role,
    tone: userTone,
    highlight,
    recipient,
    mode: submitMode,
  }: {
    message: string;
    email: string;
    role: string;
    tone: string;
    highlight: string;
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => {
    setReply('AI 回應產生中...');

    const modeToUse = submitMode || mode;
    const apiPath = modeToUse === 'proxy' ? '/api/third-person-message' : '/api/third-person-reply';
    const payload = modeToUse === 'proxy'
      ? { userInput: message, language: 'zh', tone, recipient, email }
      : { message, email, role, tone: userTone, highlight };

    const res = await fetch(apiPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
    router.refresh();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail('');
    router.refresh();
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserEmail(data.user.email ?? '');
    });
  }, []);

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

      <div className="space-y-2">
        <label className="font-medium">模式切換：</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'reply' | 'proxy')}
          className="border rounded px-2 py-1"
        >
          <option value="reply">🎯 第三人稱 AI 回應</option>
          <option value="proxy">📨 訊息轉述給對方</option>
        </select>
        {mode === 'proxy' && (
          <>
            <div>
              <label className="mr-2">收件人：</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="例如：他、她、你"
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="mr-2">語氣：</label>
              <select value={tone} onChange={(e) => setTone(e.target.value as any)} className="border rounded px-2 py-1">
                <option value="soft">溫和</option>
                <option value="normal">中性</option>
                <option value="strong">強烈</option>
              </select>
            </div>
          </>
        )}
      </div>

      <UserInputForm onSubmit={handleSubmit} mode={mode} />

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
