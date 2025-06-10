'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

export default function NotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <section className="bg-white">
      <div className="layout flex min-h-screen flex-col items-center justify-center text-center text-black">
        <RiAlarmWarningFill
          size={60}
          className="drop-shadow-glow animate-flicker text-red-500"
        />
        <h1 className="mt-8 text-4xl md:text-6xl">頁面找不到</h1>
        <p className="mt-4 text-lg text-gray-700">3 秒後將自動導回首頁</p>
      </div>
    </section>
  );
}
