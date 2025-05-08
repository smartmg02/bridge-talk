'use client';

import { useState } from 'react';

type Props = {
  onSubmit: (input: { message: string; email: string; role: string }) => void;
};

export default function UserInputForm({ onSubmit }: Props) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('bestie');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, email, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="輸入你的心聲..."
        className="w-full p-2 border rounded"
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="bestie">閨蜜</option>
        <option value="marketGuru">股市名嘴</option>
        <option value="optimist">樂天派</option>
        <option value="dreamer">鬼點子王</option>
        <option value="empath">傾聽者</option>
        <option value="doer">行動派</option>
        <option value="elder">長輩</option>
        <option value="dramaFriend">戲精</option>
        <option value="philosopher">哲學家</option>
      </select>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="輸入你的 email（可選）"
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        送出
      </button>
    </form>
  );
}