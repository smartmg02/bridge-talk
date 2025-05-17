'use client';

import { useState } from 'react';

export default function UserInputForm({
  onSubmit,
  mode,
}: {
  onSubmit: (data: {
    message: string;
    email: string;
    role: string;
    tone: string;
    highlight: string;
    recipient?: string;
    forwardEmail?: string;
    mode?: 'reply' | 'proxy';
  }) => void;
  mode: 'reply' | 'proxy';
}) {
  const [message, setMessage] = useState('');
  const [highlight, setHighlight] = useState('');
  const [role, setRole] = useState('bestie');
  const [tone, setTone] = useState('normal');
  const [recipient, setRecipient] = useState('');
  const [forwardEmail, setForwardEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, email: '', role, tone, highlight, recipient, forwardEmail, mode });
  };

  const renderToneSelector = () => (
    <div>
      <label className="block mb-1 font-medium">語氣</label>
      <select
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="soft">溫和</option>
        <option value="normal">中性</option>
        <option value="strong">強烈</option>
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 心聲輸入 */}
      <div>
        <label className="block mb-1 font-medium">請輸入你的心聲</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border rounded p-2"
        />
      </div>

      {/* 重點 highlight */}
      <div>
        <label className="block mb-1 font-medium">想突顯的重點（可選）</label>
        <input
          type="text"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* 通用語氣選單 */}
      {renderToneSelector()}

      {/* Proxy 模式下才顯示的欄位 */}
      {mode === 'proxy' && (
        <>
          <div>
            <label className="block mb-1 font-medium">收件人</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="例如：老公、老婆、主管、朋友、未來的自己"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">若希望將內容寄出，請輸入收件人 Email：</label>
            <input
              type="email"
              value={forwardEmail}
              onChange={(e) => setForwardEmail(e.target.value)}
              placeholder="選填：someone@example.com"
              className="w-full border rounded p-2"
            />
          </div>
        </>
      )}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        送出
      </button>
    </form>
  );
}
