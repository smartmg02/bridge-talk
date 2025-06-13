// src/app/layout.tsx

import { ReactNode } from 'react';

import './globals.css';

import { SupabaseProvider } from '@/providers/supabase-provider';

export const metadata = {
  title: 'BridgeTalk',
  description: 'AI-driven emotional assistant',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* ✅ 插入 Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4437355355807949"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-screen bg-gray-50 text-black font-sans">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
