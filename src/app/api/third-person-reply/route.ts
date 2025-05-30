// /src/app/api/third-person-reply/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { buildReplyPrompt } from '@/utils/buildReplyPrompt';
import { rolePromptTemplates } from '@/constant/rolePromptTemplates';
import { deduplicateReply } from '@/utils/deduplicateReply';
import { checkRepeat } from '@/utils/checkRepeat';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '❌ 缺少必要環境變數 (OPENAI_API_KEY / SUPABASE_URL / SUPABASE_ANON_KEY)'
  );
}

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      role = 'bestie',
      tone = 'normal',
      lang = 'zh',
      email,
    } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '❌ 請提供 message 欄位' },
        { status: 400 }
      );
    }

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: cookies(),
    });

    // 組合 Prompt
    const { system, userMessage } = buildReplyPrompt({
      message,
      role,
      tone,
      lang,
    });

    console.log('🧠 [GPT System Prompt]\n' + system);
    console.log('📝 [GPT User Message]\n' + userMessage);

    // 呼叫 OpenAI API（非串流）
    const completionRes = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
        }),
      }
    );

    const completionJson = await completionRes.json();
    const rawReply = completionJson.choices?.[0]?.message?.content?.trim();

    if (!rawReply) {
      return NextResponse.json(
        { error: '⚠️ 沒有接收到有效內容' },
        { status: 500 }
      );
    }

    // 去除重複內容與簡化
    const dedupedReply = deduplicateReply(rawReply);
    const isRepeat = checkRepeat(dedupedReply);
    const finalReply = isRepeat
      ? dedupedReply.slice(0, dedupedReply.length / 2)
      : dedupedReply;

    console.log('💬 [AI Reply]\n' + finalReply);

    // 儲存紀錄
    if (email) {
      const { error, status } = await supabase.from('records').insert({
        mode: 'reply',
        user_email: email,
        user_input: message,
        ai_response: finalReply,
        role,
        tone,
      });

      if (error) {
        console.error('❌ 寫入 Supabase records 失敗：', error.message);
      } else {
        console.log('✅ 已成功寫入 records 資料表。狀態碼:', status);
      }
    }

    return NextResponse.json({ reply: finalReply });
  } catch (error) {
    console.error('❌ route.ts error:', error);
    return NextResponse.json({ error: '❌ 伺服器錯誤' }, { status: 500 });
  }
}
