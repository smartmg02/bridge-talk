import { rolePromptTemplates } from '@/constant/rolePromptTemplates';

interface BuildReplyPromptOptions {
  message: string;
  highlight?: string;
  role?: keyof typeof rolePromptTemplates;
  tone?: 'soft' | 'normal' | 'strong';
  lang?: 'zh';
}

export function buildReplyPrompt({
  message,
  highlight = '',
  role = 'bestie',
  tone = 'normal',
  lang = 'zh',
}: BuildReplyPromptOptions): {
  system: string;
  userMessage: string;
} {
  const roleData = rolePromptTemplates[role]?.[lang]?.reply;

  if (!roleData) {
    throw new Error(`⚠️ 無效角色 ${role} 或缺少 reply 模式設定`);
  }

  const system = `你是一位具有特定風格的 AI，角色設定如下：

🎭 人格設定：${roleData.persona}
🗣️ 風格建議：${roleData.styleTips}

請以「${role}」的語氣回應使用者的心聲，扮演她的朋友或陪伴者角色。

📌 語氣強度：${tone}
📌 回應請具備情緒支持、理解與行動建議。
📌 禁止使用泛泛而談的建議（如「多溝通、多包容」），請具體、真誠、溫暖。`;

  const userMessage = `以下是使用者的心聲：\n\n${message}${
    highlight ? `\n\n🔎 她特別強調的重點是：「${highlight}」` : ''
  }`;

  return { system, userMessage };
}
