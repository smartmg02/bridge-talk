// ✅ 修正 await cookies() 的版本：bridge-talk-web/src/app/api/third-person-message/route.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rolePromptTemplates } from '@/constants/rolePromptTemplates';
import { resendEmail } from '@/lib/resendEmail';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(req: NextRequest) {
  console.log('[DEBUG] proxy route handler triggered');

  const { userInput, language = 'zh', tone = '溫和', recipient = '', role = 'peacemaker', forwardEmail } = await req.json();
  console.log('[DEBUG] request json:', { userInput, language, tone, recipient, role, forwardEmail });

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
    error: userError,
  } = await supabase.auth.getUser();

  console.log('[DEBUG] Supabase getUser:', { user, userError });

  if (!user?.email) {
    return new Response(JSON.stringify({ error: '⚠️ 找不到登入使用者 email' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userEmail = user.email;
  const promptSet = rolePromptTemplates[role];

  if (!promptSet) {
    return new Response(JSON.stringify({ error: '⚠️ 找不到對應角色' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const safePrompt = promptSet[language as keyof typeof promptSet] ?? promptSet['zh'];
  const finalPrompt = `${safePrompt}

請幫忙轉述使用者希望對「${recipient || '對方'}」表達的內容，語氣保持「${tone}」。

使用者說：
「${userInput}」

請幫我寫成一段可以轉述的話，用你的語氣表達他的心聲。`;

  console.log('[DEBUG] final prompt to OpenAI:', finalPrompt);

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
            { role: 'system', content: 'You are a helpful AI who interprets and communicates on behalf of users.' },
            { role: 'user', content: finalPrompt },
          ],
        }),
      });

      if (!response.ok || !response.body) {
        console.error('[ERROR] OpenAI API failed:', response.status);
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
            });

            if (forwardEmail) {
              await resendEmail({
                to: forwardEmail,
                subject: `BridgeTalk 代轉使用者的心聲`,
                body: `${fullReply}\n\n---\n📢 本訊息由 BridgeTalk AI 轉述使用者心聲，內容由使用者提供並自行負責，不代表本站立場。`,
                userEmail,
              });
              console.log(`[DEBUG] Email sent to ${forwardEmail}`);
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
