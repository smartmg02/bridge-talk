import { NextRequest, NextResponse } from 'next/server';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  throw new Error('❌ OPENAI_API_KEY is not set in .env.local');
}

export async function POST(req: NextRequest) {
  const { full_description } = await req.json();

  const systemPrompt = `
你是一位善於提取情緒重點的溝通教練。
請閱讀使用者描述的事件，從中找出最核心、最情緒化、最有意義的兩句話，
作為「highlight 重點」，用於幫助 AI 更精準地回應。

輸出格式範例：
highlight: 「我雙手都提著東西，他卻沒有幫我撐傘，搞得我全身都被淋濕了。」、「他竟然一點表示都沒有，我真的覺得很受傷。」

請直接輸出 highlight 重點句，不需要任何說明或引言。
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: full_description }
      ],
      temperature: 0.7
    })
  });

  const result = await response.json();

  return NextResponse.json({
    highlight: result.choices?.[0]?.message?.content || '⚠️ AI 無法產生 highlight。'
  });
}
