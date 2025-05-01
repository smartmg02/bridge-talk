'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])

  const handleSend = async () => {
    if (input.trim() === '') return

    // 顯示使用者輸入
    const newMessages = [...messages, `🧑你說：${input}`]
    setMessages(newMessages)

    try {
      // 呼叫 AI Proxy API
      const res = await fetch('https://bridge-talk-proxy.onrender.com/proxy/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: input }
          ],
          temperature: 0.7
        })
      })

      const data = await res.json()
      const aiReply = data.choices?.[0]?.message?.content || '⚠️ AI 沒有回應'
      setMessages([...newMessages, `🤖AI回覆：${aiReply}`])
    } catch (err) {
      setMessages([...newMessages, '❌ 錯誤：無法取得 AI 回覆'])
      console.error('Fetch error:', err)
    }

    setInput('')
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">BridgeTalk - 測試版</h1>

      <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-4 space-y-4">
        {/* 回覆區 */}
        <div className="h-60 overflow-y-auto border rounded p-2 bg-gray-100 text-sm">
          {messages.map((msg, index) => (
            <p key={index} className="mb-1">
              {msg}
            </p>
          ))}
        </div>

        {/* 輸入區 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-grow border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="請輸入你的訊息..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            送出
          </button>
        </div>
      </div>
    </main>
  )
}
