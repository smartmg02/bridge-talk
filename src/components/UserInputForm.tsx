'use client';

import { useState } from 'react';

import Button from '@/components/ui/button';

const roleOptions = [
  { label: '閨蜜', value: 'bestie' },
  { label: '理性分析者', value: 'analyst' },
  { label: '戲精朋友', value: 'dramatic' },
  { label: '加油打氣型', value: 'cheerleader' },
];

const toneOptions = [
  { label: '柔和', value: 'soft' },
  { label: '中性', value: 'normal' },
  { label: '強烈', value: 'strong' },
];

type Props = {
  onSubmit: (data: {
    message: string;
    email: string;
    role: string;
    tone: 'soft' | 'normal' | 'strong';
    highlight: string;
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => void;
  mode: 'reply' | 'proxy';
  maxMessageLength?: number;
  maxHighlightLength?: number;
  disableRecipient?: boolean;
};

export default function UserInputForm({
  onSubmit,
  mode,
  maxMessageLength = 800,
  maxHighlightLength = 100,
  disableRecipient = false,
}: Props) {
  const [message, setMessage] = useState('');
  const [highlight, setHighlight] = useState('');
  const [role, setRole] = useState('bestie');
  const [tone, setTone] = useState<'soft' | 'normal' | 'strong'>('normal');
  const [email, setEmail] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, email, role, tone, highlight, recipient, mode });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">訊息內容</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={maxMessageLength}
          className="w-full border border-gray-300 rounded p-2"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Highlight</label>
        <input
          type="text"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          maxLength={maxHighlightLength}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">角色</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">語氣強度</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as 'soft' | 'normal' | 'strong')}
          className="w-full border border-gray-300 rounded p-2"
        >
          {toneOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {!disableRecipient && (
        <div>
          <label className="block text-sm font-medium">收件人</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
      )}

      <Button type="submit" variant="primary">
        送出
      </Button>
    </form>
  );
}
