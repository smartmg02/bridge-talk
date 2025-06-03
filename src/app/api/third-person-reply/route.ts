import { NextRequest } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { buildReplyPrompt } from '@/utils/buildReplyPrompt';
import type { Database } from '@/types/supabase';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const noop = () => undefined;

export async function POST(req: NextRequest) {
  const {
    message,
    tone: rawTone = 'normal',
    role: rawRole = 'bestie',
    recipient: rawRecipient = '',
  } = await req.json();

  const userInput = typeof message === 'string' ? message.trim() : '';
  const MAX_LENGTH = 800;

  if (!userInput || userInput.length > MAX_LENGTH) {
    return new Response(
      JSON.stringify({
        error: `⚠️ 輸入內容過長（${userInput.length} 字），請壓縮至 ${MAX_LENGTH} 字以內。`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => nextCookies().get(name)?.value,
        set: noop,
        remove: noop,
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return new Response(JSON.stringify({ error: '⚠️ 找不到登入使用者 email' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tone = rawTone || 'normal';
  const role = rawRole || 'bestie';
  const recipient = rawRecipient || '';

  const prompt = buildReplyPrompt({
    message: userInput,
    tone,
    role,
    lang: 'zh',
  });

  const messages = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.userMessage },
  ];

  const openAIRes = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      stream: false,
      temperature: tone === 'strong' ? 1 : tone === 'soft' ? 0.3 : 0.7,
      max_tokens: 500,
      messages,
    }),
  });

  if (!openAIRes.ok) {
    const error = await openAIRes.text();
    return new Response(JSON.stringify({ error: `❌ OpenAI 請求失敗：${error}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await openAIRes.json();
  const fullText = result.choices?.[0]?.message?.content?.trim() || '';

  await supabase.from('records').insert({
    user_email: user.email!,
    message: userInput,
    gpt_reply: fullText,
    role,
    tone,
    mode: 'reply',
    recipient,
  });

  return new Response(JSON.stringify({ reply: fullText }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
