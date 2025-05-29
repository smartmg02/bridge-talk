'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase';

import HistoryList from '@/components/HistoryList';
import Button from '@/components/ui/button';
import UserInputForm from '@/components/UserInputForm';

import { roleOptions } from '@/constant/roleOptions';

export default function HomePage() {
  const [reply, setReply] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [mode, setMode] = useState<'reply' | 'proxy'>('reply');
  const [tone, setTone] = useState<'soft' | 'normal' | 'strong'>('normal');
  const [role, setRole] = useState(roleOptions[0]?.value || 'bestie');
  const [recipient, setRecipient] = useState('');
  const [records, setRecords] = useState<{ id: string; message: string; created_at: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.email) return;
      setUserEmail(session.user.email);

      const { data, error } = await supabase
        .from('records')
        .select('id, message, created_at')
        .eq('user_email', session.user.email)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        const mapped = data.map((item) => ({
          id: item.id.toString(),
          message: item.message,
          created_at: item.created_at,
        }));
        setRecords(mapped);
      }
    };
    fetchHistory();
  }, [supabase]);

  const handleSubmit = async ({ message, highlight, email, role, tone, recipient, mode }: {
    message: string;
    highlight: string;
    email: string;
    role: string;
    tone: 'soft' | 'normal' | 'strong';
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => {
    setReply('AI 回應產生中...');
    const res = await fetch(`/api/third-person-${mode === 'proxy' ? 'message' : 'reply'}`, {
      method: 'POST',
      body: JSON.stringify({ message, highlight, tone, role, recipient }),
    });
    const result = await res.text();
    setReply(result);
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <UserInputForm
        onSubmit={handleSubmit}
        mode={mode}
        disableRecipient={mode === 'reply'}
      />

      <div className="max-w-2xl mx-auto mt-8">
        <h3 className="text-lg font-semibold mb-2">最近紀錄預覽</h3>
        <HistoryList userEmail={userEmail} selectedId={selectedId} limit={3} />
      </div>

      <div className="text-center mt-8">
        <Button variant="primary" onClick={() => router.push('/history')}>查看所有紀錄</Button>
      </div>

      {reply && (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-300 rounded">
          <h4 className="text-md font-semibold mb-2">AI 回應</h4>
          <p className="whitespace-pre-wrap text-sm text-gray-800">{reply}</p>
        </div>
      )}
    </main>
  );
}
