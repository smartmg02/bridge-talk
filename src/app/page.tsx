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
  const [role, setRole] = useState(roleOptions[0]?.value || 'bestie');
  const [tone, setTone] = useState<'soft' | 'normal' | 'strong'>('normal');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyPreview, setHistoryPreview] = useState<
    { id: string; message: string; created_at: string }[]
  >([]);
  const replyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        fetchHistory(session.user.email);
      }
    };
    fetchSession();
  }, [supabase]);

  const fetchHistory = async (email: string) => {
    const { data } = await supabase
      .from('records')
      .select('id, message, created_at')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setHistoryPreview(data);
  };

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
        role,
        tone,
        recipient: currentMode === 'reply' ? '我自己' : recipient,
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
        {/* 登入狀態 + 查看歷史 */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {userEmail ? `登入中帳號：${userEmail}` : '尚未登入'}
          </div>
          <Button variant="outline" onClick={() => router.push('/history')}>
            查看更多
          </Button>
        </div>

        {/* 模式切換 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={mode === 'reply' ? 'default' : 'outline'}
            onClick={() => {
              setMode('reply');
              setReply('');
            }}
          >
            AI 聽懂你的心聲（Reply 模式）
          </Button>
          <Button
            variant={mode === 'proxy' ? 'default' : 'outline'}
            onClick={() => {
              setMode('proxy');
              setReply('');
            }}
          >
            AI 援你幫你出頭（Proxy 模式）
          </Button>
        </div>

        {/* 角色與語氣 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選 AI 角色
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI 語氣強度
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as 'soft' | 'normal' | 'strong')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="soft">🌸 溫和</option>
              <option value="normal">🗣️ 一般</option>
              <option value="strong">🔥 強烈</option>
            </select>
          </div>
        </div>

        {/* 輸入表單 */}
        <UserInputForm
          onSubmit={(data) =>
            handleSubmit({
              ...data,
              role,
              tone,
              recipient: mode === 'reply' ? '我自己' : recipient,
              mode,
            })
          }
          mode={mode}
          maxMessageLength={800}
          maxHighlightLength={100}
          recipient={recipient}
          onRecipientChange={(value) => setRecipient(value)}
          disableRecipient={mode === 'reply'}
        />

        {/* AI 回應區塊 */}
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
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">{reply}</p>
          </div>
        )}
      </div>
    </main>
  );
}
