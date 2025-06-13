'use client';

import { useState } from 'react';

export default function AuthConsentGate({
  onProceed,
}: {
  onProceed: () => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-6 border border-gray-300 rounded bg-white text-sm text-gray-800">
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          className="mt-1"
        />
        <span>
          我已閱讀並同意{' '}
          <a href="/terms" className="underline text-blue-600" target="_blank">
            使用條款
          </a>{' '}
          與{' '}
          <a
            href="/privacy-policy"
            className="underline text-blue-600"
            target="_blank"
          >
            隱私政策
          </a>
        </span>
      </label>

      <button
        onClick={onProceed}
        disabled={!checked}
        className={`mt-4 w-full py-2 rounded text-white ${
          checked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        同意並繼續登入
      </button>
    </div>
  );
}
