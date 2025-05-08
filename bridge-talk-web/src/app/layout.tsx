import './globals.css';
import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import SupabaseProvider from '@/components/SupabaseProvider';

export const metadata = {
  title: 'BridgeTalk',
  description: 'AI-driven emotional assistant',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();

  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}