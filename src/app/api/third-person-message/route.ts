import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { buildProxyPrompt } from '@/utils/buildProxyPrompt';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const noop = () => undefined;

export async function POST(req: NextRequest) {
  const {
    message,
    tone = 'normal',
    recipient = '',
    role = 'bestie',
  } = await req.json();

  const userInput = typeof message === 'string' ? message.trim() : '';

  const MAX_LENGTH = 1200;
  if (!userInput || userInput.length > MAX_LENGTH) {
    return new Response(
      JSON.stringify({
        error: `⚠️ 輸入內容過長（${userInput.length} 字），請壓縮至 ${MAX_LENGTH} 字以內。`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: '❌ Supabase 環境變數未設定' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cookieStore = nextCookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: noop,
      remove: noop,
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return new Response(JSON.stringify({ error: '⚠️ 找不到登入使用者 email' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userEmail = user.email;

  let messages;
  try {
    messages = buildProxyPrompt({
      userInput,
      role,
      tone,
      recipient: typeof recipient === 'string' ? recipient : '',
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '⚠️ 無效角色或 prompt 組裝失敗' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

  const result = await openAIRes.json();
  const fullText = result.choices?.[0]?.message?.content?.trim();

  if (!fullText) {
    return new Response(JSON.stringify({ error: '⚠️ OpenAI 回傳空內容' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await supabaseAdmin.from('records').insert({
    user_email: userEmail,
    message: userInput,
    gpt_reply: fullText,
    mode: 'proxy',
    tone,
    recipient,
    role,
  });

  return new Response(JSON.stringify({ reply: fullText }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
