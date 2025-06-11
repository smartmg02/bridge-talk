// src/lib/ai.ts
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('❌ OPENAI_API_KEY is not set in environment variables.');
}

export const openai = new OpenAI({ apiKey });

export type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function callAI({
  messages,
  model = 'gpt-3.5-turbo',
}: {
  messages: ChatMessage[];
  model?: string;
}): Promise<{ reply: string; tokenCount: number }> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
    });

    const reply = response.choices[0]?.message?.content || '⚠️ AI 沒有回應內容';
    const tokenCount = response.usage?.total_tokens ?? 0;

    return { reply, tokenCount };
  } catch {
    return { reply: '⚠️ 發生錯誤，請稍後再試。', tokenCount: 0 };
  }
}
