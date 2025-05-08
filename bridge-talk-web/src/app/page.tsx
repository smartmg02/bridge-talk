'use client';

import { useState } from 'react';
import UserInputForm from '@/components/UserInputForm';

export default function HomePage() {
  const [reply, setReply] = useState('');

  const handleSubmit = async ({ message, email, role }: { message: string; email: string; role: string }) => {
    setReply('AI 回應產生中...');
    const res = await fetch('/api/third-person-reply', {
      method: 'POST',
      body: JSON.stringify({ message, email, role }),
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      fullText += chunk;
      setReply(fullText);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">BridgeTalk：讓 AI 替你說心裡話</h1>
      <UserInputForm onSubmit={handleSubmit} />
      <div className="p-4 border rounded bg-gray-100 whitespace-pre-wrap">{reply}</div>
    </main>
  );
}