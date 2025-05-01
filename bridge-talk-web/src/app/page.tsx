'use client'

import VoiceRecorder from '@/components/VoiceRecorder'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">BridgeTalk 語音輸入測試</h1>
      
      {/* 錄音功能 */}
      <VoiceRecorder />
      
      {/* 查看歷史紀錄 */}
      <Link href="/history" className="text-blue-500 underline mt-6">
        查看歷史紀錄
      </Link>
    </main>
  )
}
