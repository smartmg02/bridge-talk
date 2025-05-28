// src/lib/ai.ts
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('❌ OPENAI_API_KEY is not set in environment variables.');
}

export const openai = new OpenAI({ apiKey });

export type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

/**
 * 呼叫 OpenAI 生成內容
 * @param messages - 傳入的對話訊息陣列
 * @param model - 預設使用 GPT-3.5-turbo
 * @returns AI 回應內容字串
 */
export async function callAI({
  messages,
  model = 'gpt-3.5-turbo',
}: {
  messages: ChatMessage[];
  model?: string;
}): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
    });

    return response.choices[0]?.message?.content || '⚠️ AI 沒有回應內容';
  } catch {
    return '⚠️ 發生錯誤，請稍後再試。';
  }
}
