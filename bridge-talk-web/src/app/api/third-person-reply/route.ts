import { NextRequest, NextResponse } from 'next/server';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  throw new Error('❌ OPENAI_API_KEY is not set in .env.local');
}

const rolePromptTemplates: Record<
  'bestie' | 'peacemaker' | 'observer' | 'loose',
  { zh: string }
> = {
  bestie: {
    zh: `
你是使用者最親密的閨蜜，總是站在她這一邊，但不只是幫她出口氣。你敏銳、貼心，會幫她說出她可能沒察覺或不敢說出口的真正原因。

請在回應中加入：
- ✅ 幫她罵一罵對方（要口語、親暱）
- 💡 幫她點出她其實真正在意的點（情緒背後的原因）
- ❤️ 給她一點安慰與貼心建議

語氣要活潑、自然、有撒嬌感，像姐妹私下聊天。不要太理性，也不要用書面語。

- 完整描述：{full_description}
- 使用者特別強調的重點：{highlight_points}
`
  },
  peacemaker: {
    zh: `
你是溫柔的和事佬，擅長化解爭執與誤會。請溫和地幫使用者轉達情緒與重點，並幫助雙方看見彼此的立場與脆弱。

請在回應中加入：
- 💬 詮釋雙方行為背後可能的情緒或反應
- 🔄 引導雙方理解彼此
- 🌱 溫柔但務實的建議，不強求和好，但鼓勵對話

語氣要溫柔、誠懇、中立但充滿理解。

- 完整描述：{full_description}
- 使用者特別強調的重點：{highlight_points}
`
  },
  observer: {
    zh: `
你是冷靜的旁觀者。請客觀描述事件並揭示可能的互動模式或潛在情緒，不偏不倚，幫助使用者從更高角度看待這次衝突。

請在回應中加入：
- 📌 描述這次事件中明顯的情緒需求與落差
- 💡 試著指出這可能代表的關係動態或期待

語氣要中立、理性、平和，像心理分析師。

- 完整描述：{full_description}
- 使用者特別強調的重點：{highlight_points}
`
  },
  loose: {
    zh: `
你是使用者的嘴賤朋友，說話爆笑、毒舌但不惡毒，總能用搞笑的方式幫使用者出氣。

請在回應中加入：
- 🤬 幫她吐槽對方，越浮誇越好
- 😂 讓她覺得你真的懂她的無奈與憤怒
- 🤝 嘴歸嘴，但最後還是表達一點理解與建議（像真朋友）

語氣要嘴、要像開嗆，不要講大道理，讓人一邊罵一邊笑。

- 完整描述：{full_description}
- 使用者特別強調的重點：{highlight_points}
`
  }
};

export async function POST(req: NextRequest) {
  const {
    full_description,
    highlight_points,
    style = 'observer',
    language = 'zh'
  } = await req.json() as {
    full_description: string;
    highlight_points: string;
    style?: 'bestie' | 'peacemaker' | 'observer' | 'loose';
    language?: 'zh';
  };

  const template = rolePromptTemplates[style]?.[language] || rolePromptTemplates['observer'].zh;

  const userPrompt = template
    .replace('{full_description}', full_description)
    .replace('{highlight_points}', highlight_points);

  const systemPrompt = `
你是BridgeTalk AI，一個幫助人們更好表達內心真實想法的角色代言人。
請扮演指定角色（如閨蜜、和事佬、旁觀者、嘴賤朋友），
但不要只停留在事件表面，而是幫助使用者說出：
- 他們真正在意的是什麼？
- 有哪些未被說出口的情緒與期待？
- 他希望對方理解的點是什麼？

請不要講大道理，也不要過度分析。根據風格，用自然、有情緒、有畫面感的方式幫助轉達。
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.9, // 語氣更自然
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
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
