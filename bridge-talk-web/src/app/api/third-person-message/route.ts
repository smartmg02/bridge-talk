import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resendEmail } from '@/lib/resendEmail';
import { buildPromptMessages } from '@/utils/buildPromptMessages';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(req: NextRequest) {
  const {
    userInput,
    language = 'zh',
    tone = 'normal',
    recipient = '',
    role = 'bestie',
    forwardEmail,
    highlight = '',
  } = await req.json();

  const MAX_LENGTH = 1200;
  if (userInput.length > MAX_LENGTH) {
    return new Response(JSON.stringify({
      error: `⚠️ 輸入內容過長（${userInput.length} 字），請壓縮至 ${MAX_LENGTH} 字以內。`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ✅ 修正：使用 await cookies() 避免 TS 錯誤
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set() {},
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
    mode: 'proxy',
    message: userInput,
    highlight,
    role,
    tone,
    recipient,
    language,
  });

  const encoder = new TextEncoder();
  let fullReply = '';

  const stream = new ReadableStream({
    async start(controller) {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          stream: true,
          temperature: 0.8,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: instruction },
            { role: 'user', content: `使用者的心聲如下：「${userMessage}」` },
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

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const clean = line.replace(/^data: /, '').trim();
          if (clean === '[DONE]') {
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();

            await supabaseAdmin.from('records').insert({
              user_email: userEmail,
              message: userInput,
              gpt_reply: fullReply,
              mode: 'proxy',
              tone,
              recipient,
              role,
              highlight,
            });

            if (forwardEmail) {
              await resendEmail({
                to: forwardEmail,
                subject: `BridgeTalk 代轉使用者的心聲`,
                body: `${fullReply}\n\n---\n📢 本訊息由 BridgeTalk AI 轉述使用者心聲，內容由使用者提供並自行負責，不代表本站立場。`,
                userEmail,
              });
            }

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
            console.warn('Parse error:', err);
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
