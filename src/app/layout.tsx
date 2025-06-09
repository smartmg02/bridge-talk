//src/app/layout.tsx

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
      <body className="min-h-screen bg-gray-50 text-black font-sans">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
