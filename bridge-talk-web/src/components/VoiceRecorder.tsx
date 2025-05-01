'use client';

import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [responseText, setResponseText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [highlightPoints, setHighlightPoints] = useState('');
  const [style, setStyle] = useState('warm'); // 使用者選擇的回應風格
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // 🔵 偵測輸入語言（簡單判斷）
  const detectLanguage = (text: string): 'zh' | 'en' | 'es' => {
    const zhRegex = /[\u4e00-\u9fff]/;
    const esRegex = /[áéíóúñü¿¡]/i;
    
    if (zhRegex.test(text)) return 'zh';
    if (esRegex.test(text)) return 'es';
    return 'en'; // 預設英文
  };

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

      const response = await fetch('/api/voice-to-text', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      const userText = result.text;
      console.log('🗣 使用者心聲(語音)：', userText);

      await processUserText(userText, url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      alert('請輸入你的心聲（完整描述）喔！');
      return;
    }
    console.log('📝 使用者心聲(文字)：', manualInput);
    console.log('✨ 使用者 Highlight 重點：', highlightPoints);

    await processUserText(manualInput, null);

    setManualInput('');
    setHighlightPoints('');
  };

  const processUserText = async (fullText: string, audioUrl: string | null) => {
    const language = detectLanguage(fullText);

    const gptResponse = await fetch('/api/third-person-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_description: fullText,
        highlight_points: highlightPoints,
        emotion_level: style === 'warm' ? 'mild' : style === 'rational' ? 'medium' : 'strong',
        language: language
      })
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('🧨 GPT API 回傳錯誤：', gptResponse.status, errorText);
      alert('⚠️ AI 回覆失敗，請稍後再試');
      return;
    }

    const gptResult = await gptResponse.json();
    console.log('🤖 GPT 回應：', gptResult.reply);

    setResponseText(gptResult.reply);

    try {
      const { error } = await supabase.from('records').insert([
        {
          id: uuidv4(),
          user_text: fullText,
          gpt_reply: gptResult.reply,
          audio_url: audioUrl
        }
      ]);
      if (error) {
        console.error('儲存到 Supabase 時發生錯誤：', error.message);
      }
    } catch (err) {
      console.error('Supabase 插入資料失敗：', err);
    }
  };

  return (
    <div className="p-4 border rounded shadow w-full max-w-md space-y-6">
      <h2 className="text-xl font-bold mb-4">語音／文字輸入</h2>

      {/* 🔵 文字輸入區 */}
      <div className="space-y-2">
        <textarea
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="請輸入你的心聲（完整描述）..."
          className="w-full p-2 border rounded"
          rows={4}
        />
        <textarea
          value={highlightPoints}
          onChange={(e) => setHighlightPoints(e.target.value)}
          placeholder="請輸入特別想強調的重點（建議1-3個）"
          className="w-full p-2 border rounded mt-2"
          rows={2}
        />
        <div className="mb-4">
          <label className="block mb-1 font-semibold">選擇回應風格：</label>
          <select
  value={style}
  onChange={(e) => setStyle(e.target.value)}
  className="p-2 border rounded w-full"
>
  <option value="bestie">👯 閨蜜 Bestie</option>
  <option value="peacemaker">🕊️ 和事佬 Peacemaker</option>
  <option value="observer">👀 中立觀察者 Observer</option>
</select>

        </div>
        <button
          onClick={handleManualSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ✉️ 送出文字心聲
        </button>
      </div>

      <hr />

      {/* 🔵 語音錄音功能 */}
      <div className="space-y-2">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded text-white ${recording ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {recording ? '停止錄音' : '開始錄音'}
        </button>
        {audioURL && (
          <div className="mt-2">
            <audio src={audioURL} controls />
          </div>
        )}
      </div>

      {/* 🔵 顯示 GPT 回應 */}
      {responseText && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold text-lg mb-2">第三人設回應：</h3>
          <p>{responseText}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
