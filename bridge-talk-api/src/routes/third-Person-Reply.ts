import { Request, Response, NextFunction } from 'express';
import { buildReplyPrompt } from '../utils/buildReplyPrompt';
import { checkAndTrackTokenUsage } from '../utils/trackTokenUsage';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const thirdPersonReply = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { message, tone = 'normal', role = 'bestie', email } = req.body;

  const userInput = typeof message === 'string' ? message.trim() : '';
  const MAX_LENGTH = 800;

  if (!userInput || userInput.length > MAX_LENGTH) {
    res.status(400).json({ error: `⚠️ 輸入內容過長（${userInput.length} 字），請壓縮至 ${MAX_LENGTH} 字以內。` });
    return;
  }

  if (!email) {
    res.status(401).json({ error: '⚠️ 找不到登入使用者 email' });
    return;
  }

  let messages;
  try {
    const { system, userMessage } = buildReplyPrompt({ message: userInput, role, tone });
    messages = [
      { role: 'system', content: system },
      { role: 'user', content: userMessage },
    ];
  } catch (err) {
    console.error('⚠️ buildPrompt 錯誤', err);
    res.status(400).json({ error: '⚠️ 無效角色或 prompt 組裝失敗' });
    return;
  }

  let openAIRes;
  try {
    openAIRes = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        stream: false,
        temperature: tone === 'strong' ? 1 : tone === 'soft' ? 0.3 : 0.7,
        max_tokens: 500,
        messages,
      }),
    });
  } catch (err) {
    console.error('⚠️ 呼叫 OpenAI API 錯誤', err);
    res.status(500).json({ error: '⚠️ 無法連線到 OpenAI API' });
    return;
  }

  let result;
  try {
    result = await openAIRes.json();
  } catch (err) {
    console.error('⚠️ 無法解析 OpenAI 回應 JSON', err);
    res.status(500).json({ error: '⚠️ OpenAI 回應解析失敗' });
    return;
  }

  const fullText = result.choices?.[0]?.message?.content?.trim();
  const tokenCount = result.usage?.total_tokens ?? 0;

  if (!fullText) {
    console.error('⚠️ OpenAI 回傳錯誤內容', result);
    res.status(500).json({ error: '⚠️ OpenAI 回傳空內容' });
    return;
  }

  const { allowed, remaining } = await checkAndTrackTokenUsage(email, tokenCount);
  if (!allowed) {
    res.status(429).json({
      error: `⚠️ 今日已達 token 上限（已用 ${20000 - remaining}/20000）`,
    });
    return;
  }

  await supabaseAdmin.from('records').insert({
    user_email: email,
    message: userInput,
    gpt_reply: fullText,
    mode: 'reply',
    tone,
    role,
  });

  res.status(200).json({ reply: fullText, remainingToken: remaining });
};
