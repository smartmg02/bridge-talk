'use client';

import { useState } from 'react';

import Button from '@/components/buttons/Button';

import { roleOptions } from '@/constant/roleOptions';

type Tone = 'soft' | 'normal' | 'strong';

type Props = {
  onSubmit: (data: {
    message: string;
    role: string;
    tone: Tone;
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => void;
  mode: 'reply' | 'proxy';
  disableRecipient?: boolean;
  maxMessageLength?: number;
  recipientOptions?: string[];
};

const toneOptions: { label: string; value: Tone }[] = [
  { label: '柔和', value: 'soft' },
  { label: '中性', value: 'normal' },
  { label: '強烈', value: 'strong' },
];

export default function UserInputForm({
  onSubmit,
  mode,
  disableRecipient = false,
  maxMessageLength = 800,
  recipientOptions = [],
}: Props) {
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(roleOptions[0]?.value || 'bestie');
  const [tone, setTone] = useState<Tone>('normal');
  const [recipient, setRecipient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, role, tone, recipient, mode });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          請輸入你的心聲（包含你想強調的重點）
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={maxMessageLength}
          className="w-full border border-gray-300 rounded p-2"
          rows={5}
          required
        />
        <p className="text-xs text-gray-500 text-right">
          {message.length}/{maxMessageLength}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">角色</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        >
          {roleOptions.map((opt: { label: string; value: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">語氣強度</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
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
          <label className="block text-sm font-medium mb-1">對象（收件人）</label>
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
          >
            <option value="">請選擇對象</option>
            {recipientOptions.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" variant="primary">
        送出
      </Button>
    </form>
  );
}
