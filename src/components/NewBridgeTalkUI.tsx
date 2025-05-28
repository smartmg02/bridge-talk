'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase';

import Button from '@/components/buttons/Button';

import { roleOptions } from '@/constant/proxyRoleOptions';

type Record = {
  id: number;
  message: string;
  gpt_reply: string;
  created_at: string;
  mode?: string;
};

interface RoleOption {
  value: string;
  label: string;
}

export default function NewBridgeTalkUI({
  onSubmit,
  userEmail,
}: {
  onSubmit: (data: {
    message: string;
    email: string;
    role: string;
    tone: string;
    highlight: string;
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => void;
  userEmail: string;
}) {
  const [mode, setMode] = useState<'reply' | 'proxy'>('reply');
  const [role, setRole] = useState(roleOptions[0]?.value || 'bestie');
  const [tone, setTone] = useState<'soft' | 'normal' | 'strong'>('normal');
  const [message, setMessage] = useState('');
  const [highlight, setHighlight] = useState('');
  const [recipient, setRecipient] = useState('');
  const [records, setRecords] = useState<Record[]>([]);
  const [tokensUsed, setTokensUsed] = useState<number>(0);

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit({ message, email: userEmail, role, tone, highlight, recipient, mode });
  };

  useEffect(() => {
    if (!userEmail) return;
    const today = new Date().toISOString().split('T')[0];
    const supabase = createClient();

    // 最近紀錄
    supabase
      .from('records')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setRecords(data as Record[]);
      });

    // 連線測試
    supabase
      .from('records')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Supabase 錯誤:', error.message); // eslint-disable-line no-console
        } else {
          console.log('✅ Supabase 連線成功，資料範例:', data); // eslint-disable-line no-console
        }
      });

    // token 用量查詢
    supabase
      .from('token_usage')
      .select('used_tokens')
      .eq('user_email', userEmail)
      .eq('date', today)
      .single()
      .then(({ data, error }) => {
        const usage = data as { used_tokens: number } | null;
        if (!error && usage?.used_tokens != null) {
          setTokensUsed(usage.used_tokens);
        }
      });
  }, [userEmail]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 space-y-10">
        <header className="flex justify-between items-center border-b pb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">BridgeTalk：讓 AI 替你說心裡話</h1>
          <div className="text-right text-sm">
            <p className="text-gray-600">{userEmail}</p>
            <Button variant="outline" onClick={() => location.href = '/login'}>
              登出
            </Button>
          </div>
        </header>

        <p className="text-sm text-gray-500">
          今日已使用 token：<strong>{tokensUsed}</strong> / 20000
        </p>

        <section className="bg-blue-100 border-l-4 border-blue-500 p-4 text-sm text-gray-800 rounded-xl">
          <p className="mb-1 font-semibold">BridgeTalk 是一個幫助你「用第三人稱視角說出心聲」的 AI 工具。</p>
          <p className="italic text-blue-700">範例：我雙手都提著東西，他竟然沒有幫我撐傘，我真的不是在意傘，而是在意他沒保護我。</p>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">模式切換：</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'reply' | 'proxy')}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="reply">🧠 第三人稱 AI 回應</option>
            <option value="proxy">📨 訊息轉述給對方</option>
          </select>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">請輸入你的心聲</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-xl p-4 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="🚨 這是新版 NewBridgeTalkUI 的輸入框 🚨"
          />
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">想特別強調的點（最多 100 字）</label>
          <input
            value={highlight}
            onChange={(e) => setHighlight(e.target.value.slice(0, 100))}
            className="w-full border border-gray-300 rounded-xl p-3 text-sm shadow-sm"
            placeholder="例如：我不是真的生氣，只是很失望。"
          />
        </section>

        <section className="flex gap-4">
          <div className="w-2/3">
            <label className="block text-sm font-medium mb-1 text-gray-700">角色風格</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm shadow-sm"
            >
              {roleOptions.map((opt: RoleOption) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium mb-1 text-gray-700">語氣</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as 'soft' | 'normal' | 'strong')}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm shadow-sm"
            >
              <option value="soft">溫和</option>
              <option value="normal">中性</option>
              <option value="strong">強烈</option>
            </select>
          </div>
        </section>

        {mode === 'proxy' && (
          <section className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">收件人（選填）</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm shadow-sm"
              placeholder="例如：老公、朋友、前任..."
            />
          </section>
        )}

        <div className="text-center pt-6">
          <Button className="w-full py-3 text-base shadow-lg" onClick={handleSubmit}>
            🚀 送出
          </Button>
        </div>

        {records.length > 0 && (
          <div className="pt-6">
            <h2 className="text-lg font-semibold mb-4">🕘 最近歷史紀錄</h2>
            <div className="space-y-4">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white hover:bg-gray-50"
                >
                  <p className="text-sm text-gray-400 mb-1">{new Date(r.created_at).toLocaleString()}</p>
                  <p className="text-xs font-semibold text-blue-600 mb-2">
                    {r.mode === 'proxy' ? '📨 轉述訊息' : '🧠 回應訊息'}
                  </p>
                  <p className="text-sm"><strong>我說：</strong> {r.message}</p>
                  <p className="text-sm text-gray-700 mt-2"><strong>AI 回應：</strong> {r.gpt_reply}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
