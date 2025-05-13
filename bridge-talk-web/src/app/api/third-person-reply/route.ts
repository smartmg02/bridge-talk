import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { rolePromptTemplates } from '@/constants/rolePromptTemplates';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY is not set in .env.local');
}

export async function POST(req: NextRequest) {
  console.log('🚀 route.ts POST handler triggered');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value;
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

  console.log('🧾 Supabase auth.getUser() result:', { user, userError });

  const body = await req.json();

  const role = body.role as string;
  const highlight = body.highlight || '';
  const email = user?.email ?? '';
  const langParam = (body.language ?? 'zh') as string;
  const tone = (body.tone ?? 'medium') as 'soft' | 'medium' | 'strong';
  const content = (body.content ?? body.message) as string;

  console.log('📨 Received content:', content);

  const validLanguages = ['zh', 'zh_cn', 'en'] as const;
  type ValidLanguage = typeof validLanguages[number];
  const safeLanguage: ValidLanguage = validLanguages.includes(langParam as ValidLanguage)
    ? (langParam as ValidLanguage)
    : 'zh';

  const promptSet = rolePromptTemplates[role];
  if (!promptSet) {
    return new Response(JSON.stringify({ error: '⚠️ 找不到對應角色' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const toneDescriptions: Record<typeof tone, string> = {
    soft: '語氣請保持溫和、體貼，避免過度批評或責備。',
    medium: '語氣保持中立理性，同時不失溫度與同理。',
    strong: '語氣可以直接、有力地表達不滿與情緒，強調立場與情感。',
  };

  const promptTemplate = promptSet[safeLanguage];
  const finalPrompt = `${promptTemplate}

${toneDescriptions[tone]}

使用者的心聲：${content}

${highlight ? `重點提示：${highlight}` : ''}`;

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
      messages: [
        { role: 'system', content: finalPrompt },
      ],
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
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`));
              }
            } catch (err) {
              console.warn('❌ JSON parse error:', err, 'line:', line);
            }
          }
        }
      }

      if (fullText) {
        const { data, error } = await supabase
          .from('records')
          .insert({
            user_email: email,
            message: content,
            gpt_reply: fullText,
            audio_url: null,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error('❌ 寫入 Supabase records 失敗:', error.message);
        } else {
          console.log('✅ 已成功寫入紀錄:', data);
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
