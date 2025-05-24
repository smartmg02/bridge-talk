'use client';

import { useState } from 'react';

import Button from '@/components/buttons/Button';

type Props = {
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
  maxMessageLength?: number;
  maxHighlightLength?: number;
};

export default function UserInputForm({
  onSubmit,
  mode,
  maxMessageLength = 800,
  maxHighlightLength = 100,
}: Props) {
  const [message, setMessage] = useState('');
  const [highlight, setHighlight] = useState('');
  const [role, setRole] = useState('bestie');
  const [tone, setTone] = useState('normal');
  const [recipient, setRecipient] = useState('');

  const recipientOptions = [
    '老公',
    '老婆',
    '主管',
    '爸媽',
    '朋友',
    '孩子',
    '未來的自己',
    '前任',
    '室友',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (mode === 'proxy' && !recipient.trim()) {
      alert('⚠️ Proxy 模式下請輸入收件人名稱');
      return;
    }
    onSubmit({
      message,
      email: '',
      role,
      tone,
      highlight,
      recipient,
      mode,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-xl p-8 rounded-xl max-w-2xl mx-auto space-y-6 text-black"
    >
      <div className="bg-gradient-to-b from-gray-100 to-white p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-1">BridgeTalk 是什麼？</h2>
        <p className="text-sm text-gray-700">
          這是一個讓 AI 幫你說出心裡話的平台，請儘量完整描述事件與情緒。
        </p>
        <p className="text-sm mt-2 italic text-gray-500">
          範例：那天因為下著雨，我和老公一路從超市走回來⋯⋯
        </p>
      </div>

      <div className="p-4 border border-gray-200 rounded shadow-sm bg-white">
        <label className="block mb-1 font-medium">請輸入你的心聲</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={maxMessageLength}
          className="w-full border border-gray-300 rounded p-3"
          placeholder="描述你想讓 AI 轉述的事情與感受..."
        />
        <p className="text-sm text-right text-gray-500">
          {message.length} / {maxMessageLength} 字
        </p>
        {message.length > 1000 && (
          <p className="text-sm text-red-500">
            ⚠️ 輸入過長可能會造成回應品質下降，建議壓縮重點
          </p>
        )}
      </div>

      <div className="p-4 border border-gray-200 rounded shadow-sm bg-white">
        <label className="block mb-1 font-medium">
          想特別強調的點（最多 {maxHighlightLength} 字）
        </label>
        <input
          type="text"
          value={highlight}
          onChange={(e) =>
            setHighlight(e.target.value.slice(0, maxHighlightLength))
          }
          className="w-full border border-gray-300 rounded p-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          例如：「我不是在意傘，而是在意他沒有保護我」
        </p>
        <p className="text-sm text-right text-gray-500 mt-1">
          {highlight.length} / {maxHighlightLength} 字
        </p>
      </div>

      <div className="flex gap-4">
        <div className="w-2/3">
          <label className="block mb-1 font-medium text-black">角色風格</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-black bg-white"
          >
            <option value="bestie">刀子嘴豆腐心的閨蜜</option>
            <option value="analyst">張口就來的股市名嘴</option>
            <option value="cheerleader">天真的樂天派</option>
            <option value="dramatic">戲精的朋友</option>
          </select>
        </div>
        <div className="w-1/3">
          <label className="block mb-1 font-medium text-black">語氣</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-black bg-white"
          >
            <option value="soft">溫和</option>
            <option value="normal">中性</option>
            <option value="strong">強烈</option>
          </select>
        </div>
      </div>

      {mode === 'proxy' && (
        <div className="p-4 border border-gray-200 rounded shadow-sm bg-white">
          <label className="block mb-1 font-medium">收件人 <span className="text-red-500">*</span></label>
          <select
            className="w-full border border-gray-300 rounded p-2 mb-2 text-black bg-white"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          >
            <option value="">請選擇收件人（可自訂）</option>
            {recipientOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.slice(0, 20))}
            className="w-full border border-gray-300 rounded p-2"
            placeholder="也可以自訂收件人"
            required
          />
        </div>
      )}

      <div className="text-center">
        <Button type="submit" className="px-6 py-2">
          送出
        </Button>
      </div>
    </form>
  );
}
