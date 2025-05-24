// ✅ /api/third-person-reply/route.ts (Reply 模式)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { buildPromptMessages, RoleKey } from '@/utils/buildPromptMessages';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const role = body.role as RoleKey;
  const highlight = body.highlight || '';
  const tone = (body.tone ?? 'normal') as 'soft' | 'normal' | 'strong';
  const content = (body.content ?? body.message) as string;

  const MAX_LENGTH = 1200;
  if (content.length > MAX_LENGTH) {
    return new Response(JSON.stringify({
      error: `⚠️ 輸入內容過長（${content.length} 字），請壓縮至 ${MAX_LENGTH} 字以內。`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        set() {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        remove() {},
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

  const userEmail = user.email;
  const { system, instruction, userMessage } = buildPromptMessages({
    mode: 'reply',
    message: content,
    highlight,
    role,
    tone,
  });

  const encoder = new TextEncoder();
  let fullReply = '';

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      stream: true,
      temperature: 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: instruction },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    return new Response(JSON.stringify({ error: '⚠️ OpenAI 回應錯誤' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  const stream = new ReadableStream({
    async start(controller) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line === 'data: [DONE]') {
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
            break;
          }

          if (line.startsWith('data: ')) {
            const json = line.replace(/^data: /, '');
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullReply += delta;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`)
                );
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              console.warn('❌ JSON parse error:', err, 'line:', line);
            }
          }
        }
      }

      await supabase.from('records').insert({
        user_email: userEmail,
        message: content,
        gpt_reply: fullReply,
        mode: 'reply',
        tone,
        role,
        highlight,
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
