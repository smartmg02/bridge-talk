import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { TextDecoder, TextEncoder } from 'util';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

import { buildReplyPrompt } from '@/utils/buildReplyPrompt';
import { logWarn } from '@/utils/logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY is not set in .env.local');
}

const noop = () => undefined;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    message,
    tone = 'normal',
    role = 'bestie',
    highlight = '',
  } = body;

  if (!message || typeof message !== 'string') {
    return new Response('⚠️ 沒有接收到有效內容', { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response('❌ Supabase 環境變數未設定', { status: 500 });
  }

  const cookieStore = nextCookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: noop,
      remove: noop,
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return new Response('⚠️ 找不到登入使用者 email', { status: 401 });
  }

  const userEmail = user.email;

  let system: string, userMessage: string;
  try {
    const prompt = buildReplyPrompt({
      message,
      highlight,
      role,
      tone,
    });
    system = prompt.system;
    userMessage = prompt.userMessage;
  } catch (err) {
    return new Response('⚠️ 無效角色或 prompt 組裝失敗', { status: 400 });
  }

  const encoder = new TextEncoder();
  let fullReply = '';
  let sentFinalOutput = false;

  const stream = new ReadableStream({
    async start(controller) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          stream: true,
          temperature: tone === 'strong' ? 1 : tone === 'soft' ? 0.3 : 0.7,
          max_tokens: 500,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!response.ok || !response.body) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'OpenAI request failed' })}\n\n`));
        controller.close();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let doneReading = false;

      while (!doneReading) {
        const { value, done } = await reader.read();
        doneReading = done;
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const clean = line.replace(/^data: /, '').trim();

          if (clean === '[DONE]' && !sentFinalOutput) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: fullReply } }] })}\n\n`)
            );
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
            sentFinalOutput = true;

            await supabaseAdmin.from('records').insert({
              user_email: userEmail,
              message,
              gpt_reply: fullReply,
              mode: 'reply',
              tone,
              role,
              highlight,
            });
            return;
          }

          try {
            const parsed = JSON.parse(clean);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullReply += delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`)
              );
            }
          } catch (err) {
            logWarn(err, '⚠️ 回應解析錯誤');
          }
        }
      }
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
