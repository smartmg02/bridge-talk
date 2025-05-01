import { NextRequest, NextResponse } from 'next/server';

// 讀取 OpenAI API Key
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  throw new Error('❌ OPENAI_API_KEY is not set in .env.local');
}

// 定義角色版 Prompt 模板
const rolePromptTemplates: Record<'bestie' | 'peacemaker' | 'observer', { zh: string; en: string; es: string }> = {
  bestie: {
    zh: `
你是使用者最親密的閨蜜，總是站在使用者這一邊。請用親密直率、充滿感情的中文語氣幫助轉達highlight重點，讓對方能感受到使用者的情緒。請保持口語、活潑、有撒嬌感。
- 完整描述：{full_description}
- 使用者特別強調的重點：{highlight_points}
`,
    en: `
You are the user's closest bestie who always sides with the user. Speak warmly, casually, and emotionally to deliver the highlighted feelings. Keep it lively and intimate.
- Full description: {full_description}
- Highlighted points: {highlight_points}
`,
    es: `
Eres la mejor amiga del usuario, siempre de su lado. Habla de manera cálida, casual y emocional para transmitir los puntos destacados. Mantén un tono íntimo y vivaz.
- Descripción completa: {full_description}
- Puntos destacados: {highlight_points}
`
  },
  peacemaker: {
    zh: `
你是溫柔的和事佬。請用平和、同理心強的中文語氣，溫和地幫助轉達使用者的highlight重點，同時引導雙方理解彼此。保持語氣溫柔、中立，但充滿理解。
- 完整描述：{full_description}
- 使用者特別強調的重點：{highlight_points}
`,
    en: `
You are a gentle peacemaker. Speak with calmness and empathy, softly conveying the user's highlighted points and encouraging mutual understanding between both parties.
- Full description: {full_description}
- Highlighted points: {highlight_points}
`,
    es: `
Eres un pacificador amable. Habla con calma y empatía, transmitiendo suavemente los puntos destacados del usuario y fomentando la comprensión mutua entre ambas partes.
- Descripción completa: {full_description}
- Puntos destacados: {highlight_points}
`
  },
  observer: {
    zh: `
你是冷靜中立的觀察者。請用中立、平和的中文語氣，客觀描述使用者的highlight重點，不偏袒、不評論。幫助雙方冷靜思考。
- 完整描述：{full_description}
- 使用者特別強調的重點：{highlight_points}
`,
    en: `
You are a calm and neutral observer. Describe the user's highlighted points objectively without judging or taking sides. Help both parties reflect calmly.
- Full description: {full_description}
- Highlighted points: {highlight_points}
`,
    es: `
Eres un observador calmado y neutral. Describe objetivamente los puntos destacados del usuario sin juzgar ni tomar partido. Ayuda a que ambas partes reflexionen con calma.
- Descripción completa: {full_description}
- Puntos destacados: {highlight_points}
`
  }
};

export async function POST(req: NextRequest) {
  const { full_description, highlight_points, style = 'observer', language = 'en' } = await req.json() as {
    full_description: string;
    highlight_points: string;
    style?: 'bestie' | 'peacemaker' | 'observer';
    language?: 'zh' | 'en' | 'es';
  };

  const template = rolePromptTemplates[style][language] || rolePromptTemplates['observer'].en;
  const userPrompt = template
    .replace('{full_description}', full_description)
    .replace('{highlight_points}', highlight_points);

  const systemPrompt = {
    zh: '你是BridgeTalk AI，根據指定角色（閨蜜/和事佬/觀察者）協助用戶以適當語氣表達情緒。',
    en: 'You are BridgeTalk AI, playing the assigned role (Bestie/Peacemaker/Observer) to help users express their feelings appropriately.',
    es: 'Eres BridgeTalk AI, actuando en el rol asignado (Mejor amiga/Pacificador/Observador) para ayudar a los usuarios a expresar sus sentimientos adecuadamente.'
  }[language] || 'You are BridgeTalk AI, acting as a third-person helper.';

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
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🧨 OpenAI API 回傳錯誤：', response.status, errorText);
    return NextResponse.json({ reply: `⚠️ AI 回覆失敗 (${response.status})：${errorText}` });
  }

  const result = await response.json();

  return NextResponse.json({
    reply: result.choices?.[0]?.message?.content || 'AI 沒有回應內容。'
  });
}
