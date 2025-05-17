import { rolePromptTemplates } from '@/constants/rolePromptTemplates';

type RoleKey = keyof typeof rolePromptTemplates; // 自動推斷出 'bestie' | 'analyst' | ...
type Language = 'zh' | 'zh_cn' | 'en';

interface PromptOptions {
  mode: 'reply' | 'proxy';
  message: string;
  highlight?: string;
  role: RoleKey;
  tone: 'soft' | 'normal' | 'strong';
  recipient?: string;
  language?: Language;
}

export function buildPrompt({
  mode,
  message,
  highlight,
  role,
  tone,
  recipient = '對方',
  language = 'zh',
}: PromptOptions): string {
  const fallbackLang: Language = ['zh', 'zh_cn', 'en'].includes(language) ? language as Language : 'zh';
  const roleSet = rolePromptTemplates[role]?.[fallbackLang];

  const persona = roleSet?.persona || '';
  const styleTips = roleSet?.styleTips || '';

  const toneDescriptions: Record<string, Record<Language, string>> = {
    soft: {
      zh: '語氣請保持溫和、體貼，避免過度批評或責備。',
      zh_cn: '语气请保持温和、体贴，避免过度批评或责备。',
      en: 'Please keep a soft and gentle tone. Avoid harsh criticism or blame.',
    },
    normal: {
      zh: '語氣保持中立理性，同時不失溫度與同理。',
      zh_cn: '语气保持中立理性，同时不失温度与同理。',
      en: 'Use a balanced and neutral tone, with warmth and empathy.',
    },
    strong: {
      zh: '語氣可以直接、有力地表達不滿與情緒，強調立場與情感。',
      zh_cn: '语气可以直接、有力地表达不满与情绪，强调立场与情感。',
      en: 'You may express frustration or strong feelings directly and assertively.',
    }
  };

  const toneText = toneDescriptions[tone]?.[fallbackLang] || '';

  const highlightText = highlight
    ? (fallbackLang === 'en'
        ? `Please pay special attention to this point: "${highlight}".`
        : `請特別注意這個重點：「${highlight}」。`)
    : '';

  if (mode === 'proxy') {
    return `
你是一位具有鮮明角色風格的 AI，正在幫助使用者向「${recipient}」傳遞一段話。

你不是在轉述使用者的話，也不是回答使用者，雖然你沒有涉入使用者所描述的事件中，但請試著理解並站在身為使用者好友的立場與角色風格，代替使用者對「${recipient}」說這段話。

角色設定：
${persona}

說話風格建議：
${styleTips}

${toneText}
${highlightText}

使用者的心聲如下：
「${message}」

請你用自己的語氣與立場，幫使用者出面說出這段話。
    `.trim();
  }

  if (mode === 'reply') {
    return `
你是使用者的 ${persona}

說話風格建議：
${styleTips}

${toneText}
${highlightText}

使用者的心聲如下：
「${message}」

請用第三人稱方式，幫助使用者轉述他的心聲，讓他更能理解自己的情緒與處境。
    `.trim();
  }

  return '⚠️ 無法產生 Prompt，請確認模式與參數是否正確。';
}
