import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { buildPrompt } from '@/utils/buildPrompt';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY is not set in .env.local');
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies() as unknown as { get(name: string): { value: string } | undefined };

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
    error: userError,
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return new Response(JSON.stringify({ error: '⚠️ 找不到登入使用者 email' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = user.email;
  const body = await req.json();

  const role = body.role as string;
  const highlight = body.highlight || '';
  const langParam = (body.language ?? 'zh') as string;
  const tone = (body.tone ?? 'normal') as 'soft' | 'normal' | 'strong';
  const content = (body.content ?? body.message) as string;

  const validLanguages = ['zh', 'zh_cn', 'en'] as const;
  type ValidLanguage = typeof validLanguages[number];
  const safeLanguage: ValidLanguage = validLanguages.includes(langParam as ValidLanguage)
    ? (langParam as ValidLanguage)
    : 'zh';

  const finalPrompt = buildPrompt({
    mode: 'reply',
    message: content,
    highlight,
    role,
    tone,
    language: safeLanguage,
  });

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      temperature: 0.8,
      stream: true,
      messages: [{ role: 'system', content: finalPrompt }],
    }),
  });

  if (!openaiRes.ok || !openaiRes.body) {
    return new Response(JSON.stringify({ error: '⚠️ OpenAI 回應錯誤' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const reader = openaiRes.body.getReader();
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder();
  let fullText = '';

  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line === 'data: [DONE]') {
            controller.close();
            break;
          }

          if (line.startsWith('data: ')) {
            const json = line.replace(/^data: /, '');
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`)
                );
              }
            } catch (err) {
              console.warn('❌ JSON parse error:', err, 'line:', line);
            }
          }
        }
      }

      if (fullText && email) {
        await supabase.from('records').insert({
          user_email: email,
          message: content,
          gpt_reply: fullText,
          mode: 'reply',
          tone,
          highlight,
          role,
        });
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
