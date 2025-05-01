import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export const runtime = 'edge'; // ✅ 或改為 'nodejs' 看你部署環境

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('audio') as File;

  if (!file) {
    return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: (() => {
      const form = new FormData();
      form.append('file', new Blob([buffer]), 'voice.webm');
      form.append('model', 'whisper-1');
      return form;
    })() as any
  });

  const result = await response.json();
  return NextResponse.json({ text: result.text });
}
