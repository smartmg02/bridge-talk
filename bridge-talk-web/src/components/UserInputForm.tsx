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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, email: '', role, tone, highlight, recipient, mode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">請輸入你的心聲</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">想突顯的重點（可選）</label>
        <input
          type="text"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {mode === 'reply' && (
        <div>
          <label className="block mb-1 font-medium">選擇角色</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="bestie">刀子嘴豆腐心的閨蜜</option>
            <option value="rational">理性分析者</option>
            <option value="listener">感性傾聽者</option>
            {/* 可根據實際角色擴充 */}
          </select>
        </div>
      )}

      {mode === 'proxy' && (
        <>
          <div>
            <label className="block mb-1 font-medium">收件人</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="例如：他、她、你"
            />
          </div>
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
        </>
      )}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        送出
      </button>
    </form>
  );
}
