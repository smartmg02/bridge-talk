import { NextRequest } from 'next/server';
import { rolePromptTemplates } from '@/constants/rolePromptTemplates';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY is not set in .env.local');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const role = body.role as string;
  const content = body.content as string;

  const validLanguages = ['zh', 'zh_cn', 'en'] as const;
  type ValidLanguage = typeof validLanguages[number];

  const langParam = (body.language ?? 'zh') as string;
  const safeLanguage: ValidLanguage = validLanguages.includes(langParam as ValidLanguage)
    ? (langParam as ValidLanguage)
    : 'zh';

  const promptSet = rolePromptTemplates[role];

  console.log('🧩 Debug Info:', {
    role,
    language: langParam,
    safeLanguage,
    hasRole: role in rolePromptTemplates,
    availableLanguages: promptSet ? Object.keys(promptSet) : '❌ no role found',
    promptContent: promptSet?.[safeLanguage] || '❌ no prompt for this language',
  });

  if (!promptSet) {
    return new Response(JSON.stringify({ error: '⚠️ 找不到對應角色' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const promptTemplate = promptSet[safeLanguage];

  if (!promptTemplate) {
    return new Response(JSON.stringify({ error: '⚠️ 沒有接收到有效內容' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const finalPrompt = `${promptTemplate}\n\n使用者的心聲：${content}`;

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: finalPrompt },
      ],
      temperature: 0.8,
      stream: true,
    }),
  });

  if (!openaiRes.ok || !openaiRes.body) {
    return new Response(JSON.stringify({ error: '⚠️ OpenAI 回應錯誤' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openaiRes.body!.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        controller.enqueue(new TextEncoder().encode(chunk));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
