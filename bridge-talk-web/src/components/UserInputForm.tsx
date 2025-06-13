'use client';

import Image from 'next/image'; // ✅ 使用 Next.js Image 元件
import { useState } from 'react';

import Button from '@/components/buttons/Button';

import { roleOptions } from '@/constant/roleOptions';

type Tone = 'soft' | 'normal' | 'strong';

type RecipientOption = {
  label: string;
  value: string;
};

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
  recipientOptions?: RecipientOption[];
  disabled?: boolean;
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
  disabled = false,
}: Props) {
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(roleOptions[0]?.value || 'bestie');
  const [tone, setTone] = useState<Tone>('normal');
  const [recipient, setRecipient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit({ message, role, tone, recipient, mode });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`max-w-2xl mx-auto space-y-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
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
          placeholder="請描述你內心的話，例如：那天他讓我全身淋濕..."
          required
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 text-right">
          {message.length}/{maxMessageLength}
        </p>
      </div>

      {/* 🎯 圖像角色選擇區塊 */}
      <div>
        <label className="block text-sm font-medium mb-2">選擇角色</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              disabled={disabled}
              className={`rounded-xl border-2 p-2 flex flex-col items-center transition-all ${
                role === opt.value ? 'border-blue-500 shadow-lg' : 'border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}`}
            >
              <Image
                src={`/images/characters/${opt.value}.webp`}
                alt={opt.label}
                width={96}
                height={96}
                className="object-cover rounded-md"
              />
              <span className="mt-2 text-sm">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">語氣強度</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          className="w-full border border-gray-300 rounded p-2"
          disabled={disabled}
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
            disabled={disabled}
          >
            <option value="">請選擇對象</option>
            {recipientOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" variant="primary" disabled={disabled}>
        送出
      </Button>
    </form>
  );
}
