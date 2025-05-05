'use client'

import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [audioURL, setAudioURL] = useState('');
  const [responseText, setResponseText] = useState('');
  const [style, setStyle] = useState<'bestie' | 'peacemaker' | 'observer' | 'loose'>('bestie');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      audioChunks.current = [];

      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');

      const whisperRes = await fetch('/api/voice-to-text', {
        method: 'POST',
        body: formData
      });

      const whisperData = await whisperRes.json();
      const userText = whisperData.text;
      setTextInput(userText);

      handleAIResponse(userText, url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleAIResponse = async (userText: string, audioUrl: string | null = null) => {
    setIsLoading(true);
    const highlightRes = await fetch('/api/highlight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_description: userText })
    });

    const highlightData = await highlightRes.json();
    const highlight = highlightData.highlight;

    const gptRes = await fetch('/api/third-person-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_description: userText,
        highlight_points: highlight,
        style,
        intensity
      })
    });

    const gptData = await gptRes.json();
    const reply = gptData.reply;
    setResponseText(reply);

    await supabase.from('records').insert([
      {
        id: uuidv4(),
        user_text: userText,
        gpt_reply: reply,
        audio_url: audioUrl ?? ''
      }
    ]);

    setIsLoading(false);
  };

  const handleTextSubmit = async () => {
    if (textInput.trim()) {
      handleAIResponse(textInput.trim());
    }
  };

  const handleSendEmail = async () => {
    if (!email || !responseText || !textInput) return;
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'BridgeTalk AI 回應',
        message: { user_text: textInput, gpt_reply: responseText }
      })
    });
    alert('已發送至指定 Email');
  };

  return (
    <div className="p-4 border rounded shadow w-full max-w-md">
      <h2 className="text-xl font-bold mb-2">輸入心聲</h2>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">選擇回應風格：</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as any)}
          className="p-2 border rounded w-full"
        >
          <option value="bestie">👯 閨蜜（bestie）</option>
          <option value="peacemaker">🕊️ 和事佬（peacemaker）</option>
          <option value="observer">🔍 旁觀者（observer）</option>
          <option value="loose">😆 嘴賤朋友（loose）</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">語氣強度：</label>
        <div className="flex space-x-4">
          <label><input type="radio" name="intensity" value="low" checked={intensity === 'low'} onChange={() => setIntensity('low')} /> 弱</label>
          <label><input type="radio" name="intensity" value="medium" checked={intensity === 'medium'} onChange={() => setIntensity('medium')} /> 普通</label>
          <label><input type="radio" name="intensity" value="high" checked={intensity === 'high'} onChange={() => setIntensity('high')} /> 強</label>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded text-white ${recording ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {recording ? '⏹️ 停止錄音' : '🎤 開始錄音'}
        </button>
      </div>

      {audioURL && (
        <div className="mb-4">
          <audio src={audioURL} controls />
        </div>
      )}

      <div className="mb-4">
        <textarea
          rows={4}
          placeholder="請輸入你的心聲..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleTextSubmit}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
        >
          ✉️ 送出文字
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold text-lg mb-2">第三人設回應：</h3>
        {isLoading ? (
          <p>🤖 AI 回應產生中...</p>
        ) : (
          responseText && <p>{responseText}</p>
        )}
      </div>

      <div className="mt-4">
        <label className="block mb-1 font-semibold">寄送回應至 Email（可選）：</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={handleSendEmail}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          📧 寄出回應
        </button>
      </div>
    </div>
  );
};

export default VoiceRecorder;
