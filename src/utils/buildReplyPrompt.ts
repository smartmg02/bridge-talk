// src/utils/buildReplyPrompt.ts

interface BuildReplyPromptOptions {
  message: string;
  highlight?: string;
  role?: string;
  tone?: 'soft' | 'normal' | 'strong';
}

export function buildReplyPrompt({
  message,
  highlight = '',
  role = 'bestie',
  tone = 'normal',
}: BuildReplyPromptOptions): {
  system: string;
  userMessage: string;
} {
  const system = `你是一位具有特定風格的 AI，現在請你以「${role}」的語氣回應使用者的心聲。請給出情緒支持、理解與行動建議，而不是理性分析或建議對話技巧。

📌 語氣強度：${tone}
📌 請盡量使用自然口語，讓使用者感覺你是可信的傾聽者或朋友。
📌 禁止使用泛泛而談的建議，例如「多溝通、多包容」，請具體、真誠、溫暖。`;

  const userMessage = `以下是使用者的心聲：\n\n${message}${
    highlight ? `\n\n🔎 她特別強調的重點是：「${highlight}」` : ''
  }`;

  return { system, userMessage };
}
