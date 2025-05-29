//src/app/login/page.tsx

'use client';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">登入 BridgeTalk</h1>
      <LoginForm />
    </main>
  );
}
