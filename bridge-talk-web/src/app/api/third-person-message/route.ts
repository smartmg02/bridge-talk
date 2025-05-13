import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function buildProxyPrompt({
  userInput,
  recipient,
  language,
  tone,
}: {
  userInput: string;
  recipient: string;
  language: string;
  tone: string;
}) {
  if (language === 'zh') {
    return `你是一位善於觀察、具有高情緒智慧的溝通者。

一位使用者剛剛向你傾訴了他的心聲。他希望你幫他向 ${recipient || '對方'} 傳達一些內容，但他說不出口。

你的任務不是扮演他本人，而是以你自己的觀察角度與理解，用有同理心的方式幫他向對方解釋或轉述他想表達的事情。

請用你的語氣幫忙說出下面這段話想傳達的意義。語氣保持「${tone}」，清楚、溫和、有同理心。

使用者說：
「${userInput}」

請幫我寫成一段話，可以轉述給 ${recipient || '對方'}。`;
  } else {
    return `You are an emotionally intelligent and thoughtful mediator.

A user has just shared something personal with you. They hope you can explain or deliver a message to ${recipient || 'someone'} on their behalf, because they don't feel ready to say it themselves.

You are NOT speaking as the user, but as someone who understands their heart. Help them convey their feelings with care, using your own neutral and empathetic voice.

Keep the tone "${tone}" (gentle / neutral / firm).

Here is what the user told you:
"${userInput}"

Please turn this into a message that you, as a third party, would say to ${recipient || 'them'} to help express what the user truly meant.`;
  }
}

export async function POST(req: NextRequest) {
  const { userInput, language = 'zh', tone = '溫和', recipient = '' } = await req.json();

  const supabase = createServerComponentClient({ cookies });
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

  if (!userInput) {
    return new Response(JSON.stringify({ error: 'Missing userInput' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const systemPrompt = 'You are a helpful AI who interprets and communicates on behalf of users.';
  const prompt = buildProxyPrompt({ userInput, recipient, language, tone });

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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
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
            });
            return;
          }

          try {
            const parsed = JSON.parse(clean);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullReply += delta;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`));
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
