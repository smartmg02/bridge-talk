'use client';

import { useEffect, useRef,useState } from 'react';

import { createClient } from '@/lib/supabase-browser';

import AuthStatus from '@/components/AuthStatus';
import Button from '@/components/buttons/Button';
import UserInputForm from '@/components/UserInputForm';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// ✅ 擴充 window.adsbygoogle 類型
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function HomePage() {
  const [reply, setReply] = useState('');
  const [mode, setMode] = useState<'proxy' | 'reply'>('reply');
  const [userEmail, setUserEmail] = useState('');
  const [remainingToken, setRemainingToken] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const adRef = useRef<HTMLDivElement | null>(null);
  const supabase = createClient();

  const recipientOptions = [
    { label: '我老公', value: '使用者的配偶（老公）' },
    { label: '我老婆', value: '使用者的配偶（老婆）' },
    { label: '我主管', value: '使用者的主管' },
    { label: '我同事', value: '使用者的同事' },
    { label: '我朋友', value: '使用者的朋友' },
  ];

  useEffect(() => {
    const fetchUserEmail = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        fetchRemainingToken(session.user.email);
      }
    };
    fetchUserEmail();
  }, [supabase.auth]);

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && adRef.current) {
            adRef.current.innerHTML = `
              <ins class="adsbygoogle"
                   style="display:block"
                   data-ad-client="ca-pub-4437355355807949"
                   data-ad-slot="4058285574"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
            `;
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch {
              // 廣告載入失敗，靜默處理
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px 200px 0px' }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchRemainingToken = async (email: string) => {
    const res = await fetch(`${API_BASE}/api/token-remaining?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (res.ok) {
      setRemainingToken(data.remaining);
    }
  };

  const handleSubmit = async ({
    message,
    role,
    tone,
    recipient,
    mode: submitMode,
  }: {
    message: string;
    role: string;
    tone: 'soft' | 'normal' | 'strong';
    recipient?: string;
    mode?: 'reply' | 'proxy';
  }) => {
    if (!userEmail) return;

    setLoading(true);
    setReply('AI 回應產出中...');

    const res = await fetch(`${API_BASE}/api/third-person-${submitMode === 'proxy' ? 'message' : 'reply'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tone, role, recipient, email: userEmail }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setReply(`⚠️ 產生失敗：${data.error || '未知錯誤'}`);
      return;
    }

    setReply(data.reply);
    if (typeof data.remainingToken === 'number') {
      setRemainingToken(data.remainingToken);
    }

    // 手動刷新廣告
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        const ads = adRef.current?.getElementsByClassName('adsbygoogle');
        if (ads && ads.length > 0) {
          for (let i = 0; i < ads.length; i++) {
            ads[i].innerHTML = '';
          }
        }
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // 廣告刷新失敗，靜默處理
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto mb-4">
        <AuthStatus />
      </div>

      <div className="max-w-2xl mx-auto mb-4 space-x-4 text-center">
        <Button variant={mode === 'reply' ? 'primary' : 'ghost'} onClick={() => setMode('reply')}>
          回應模式
        </Button>
        <Button variant={mode === 'proxy' ? 'primary' : 'ghost'} onClick={() => setMode('proxy')}>
          代言模式
        </Button>
      </div>

      {userEmail && (
        <div className="max-w-2xl mx-auto text-center text-sm text-gray-500 mb-2">
          🎯 今日剩餘 token：{remainingToken ?? '讀取中...'} / 20000
        </div>
      )}

      <div className="max-w-2xl mx-auto mb-8">
        {userEmail ? (
          <UserInputForm
            onSubmit={handleSubmit}
            mode={mode}
            maxMessageLength={800}
            disableRecipient={mode === 'reply'}
            recipientOptions={recipientOptions}
          />
        ) : (
          <div className="text-center text-gray-600 p-4 border border-gray-300 rounded">
            請先登入才能輸入心聲 ✨
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-300 rounded min-h-[120px]">
        <h4 className="text-md font-semibold mb-2">AI 回應</h4>
        <p className="whitespace-pre-wrap text-sm text-gray-800">
          {loading && !reply ? 'AI 回應產出中...' : reply}
        </p>
      </div>

      {/* ✅ Lazy-load 廣告區塊 */}
      <div className="max-w-2xl mx-auto mt-6" ref={adRef}></div>
    </main>
  );
}
