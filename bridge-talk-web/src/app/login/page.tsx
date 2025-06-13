'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase-browser';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const supabase = createClient();
  const [agreed, setAgreed] = useState(false);
  const [hasAgreedBefore, setHasAgreedBefore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAgreement = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const metadata = session?.user?.user_metadata;
      if (metadata?.has_agreed_terms) {
        setHasAgreedBefore(true);
      }
      setLoading(false);
    };
    checkUserAgreement();
  }, [supabase]);

  if (loading) {
    return <div className="text-center p-8">載入中...</div>;
  }

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">登入 BridgeTalk</h1>

      {!hasAgreedBefore && (
        <div className="mb-6 border border-gray-300 rounded p-4 bg-white text-sm text-gray-800">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <span>
              我已閱讀並同意{' '}
              <a href="/terms" className="underline text-blue-600" target="_blank">使用條款</a>{' '}
              與{' '}
              <a href="/privacy-policy" className="underline text-blue-600" target="_blank">隱私政策</a>
            </span>
          </label>
        </div>
      )}

      {(hasAgreedBefore || agreed) ? (
        <LoginForm hasAgreed={!hasAgreedBefore} />
      ) : (
        <button
          disabled
          className="w-full py-2 bg-gray-300 text-white rounded cursor-not-allowed"
        >
          請先勾選同意條款才能登入
        </button>
      )}
    </main>
  );
}
