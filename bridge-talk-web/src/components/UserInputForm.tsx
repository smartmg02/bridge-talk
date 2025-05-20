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
    mode?: 'reply' | 'proxy';
  }) => void;
  mode: 'reply' | 'proxy';
}) {
  const [message, setMessage] = useState('');
  const [highlight, setHighlight] = useState('');
  const [role, setRole] = useState('bestie');
  const [tone, setTone] = useState('normal');
  const [recipient, setRecipient] = useState('');

  const MAX_LENGTH = 1200;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, email: '', role, tone, highlight, recipient, mode });
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

  const recipientOptions = [
    '老公', '老婆', '主管', '爸媽', '朋友', '孩子', '未來的自己', '前任', '室友'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 心聲輸入 */}
      <div>
        <label className="block mb-1 font-medium">請輸入你的心聲</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={MAX_LENGTH}
          className="w-full border rounded p-2"
        />
        <p className="text-sm text-right text-gray-500">{message.length} / {MAX_LENGTH} 字</p>
        {message.length > 1000 && (
          <p className="text-sm text-red-500">⚠️ 輸入過長可能會造成回應品質下降，建議壓縮重點</p>
        )}
      </div>

      {/* 重點 highlight */}
      <div>
        <label className="block mb-1 font-medium">想突顯的重點（可選）</label>
        <input
          type="text"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value.slice(0, 100))}
          className="w-full border rounded p-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          建議輸入「最想讓對方理解的一句話或情緒關鍵」，限 100 字內。
          <br />
          例如：「我不是在意傘，而是在意他沒有保護我」或「我不是真的生氣，只是很失望」。
        </p>
      </div>

      {/* 通用語氣選單 */}
      {renderToneSelector()}

      {/* Proxy 模式下才顯示的欄位 */}
      {mode === 'proxy' && (
        <>
          <div>
            <label className="block mb-1 font-medium">收件人</label>
            <select
              className="w-full border rounded p-2 mb-2"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="">請選擇收件人（可自訂）</option>
              {recipientOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.slice(0, 20))}
              className="w-full border rounded p-2"
              placeholder="也可以自訂收件人，例如：國中老師、某位同事等（20 字以內）"
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
