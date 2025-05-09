'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { roles } from '@/constants/roles';

type Props = {
  onSubmit: (params: {
    message: string;
    highlight: string;
    tone: string;
    role: string;
    email: string;
  }) => void;
};

export default function UserInputForm({ onSubmit }: Props) {
  const [userEmail, setUserEmail] = useState('');
  const [highlight, setHighlight] = useState('');
  const [userInput, setUserInput] = useState('');
  const [tone, setTone] = useState('medium');
  const [selectedRole, setSelectedRole] = useState('bestie');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      message: userInput,
      highlight,
      tone,
      role: selectedRole,
      email: userEmail,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">收件者 Email（可選）</Label>
        <Input
          id="email"
          type="email"
          placeholder="例如：friend@example.com"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">角色風格</Label>
        <select
          id="role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tone">語氣強度</Label>
        <select
          id="tone"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="soft">弱</option>
          <option value="medium">中</option>
          <option value="strong">強</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="highlight">特別想強調的重點（可選）</Label>
        <Textarea
          id="highlight"
          placeholder="例如：我那時真的很受傷，覺得完全被忽視了。"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userInput">心聲內容</Label>
        <Textarea
          id="userInput"
          placeholder="輸入你的心聲內容..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full">送出</Button>
    </form>
  );
}
