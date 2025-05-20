// 📁 bridge-talk-web/src/utils/buildPromptMessages.ts
import { rolePromptTemplates } from '@/constants/rolePromptTemplates';

export type RoleKey = keyof typeof rolePromptTemplates;
export type Language = 'zh' | 'zh_cn' | 'en';

interface PromptOptions {
  mode: 'reply' | 'proxy';
  message: string;
  highlight?: string;
  role: RoleKey;
  tone: 'soft' | 'normal' | 'strong';
  recipient?: string;
  language?: Language;
}

export interface PromptMessages {
  system: string;
  instruction: string;
  userMessage: string;
}

export function buildPromptMessages({
  mode,
  message,
  highlight,
  role,
  tone,
  recipient = '對方',
  language = 'zh',
}: PromptOptions): PromptMessages {
  const fallbackLang: Language = ['zh', 'zh_cn', 'en'].includes(language) ? language : 'zh';
  const roleSet = rolePromptTemplates[role]?.[fallbackLang];
  const persona = roleSet?.persona || '';
  const styleTips = roleSet?.styleTips || '';

  const toneDescriptions: Record<'soft' | 'normal' | 'strong', Record<Language, string>> = {
    soft: {
      zh: '語氣請保持溫和，避免過度批評。',
      zh_cn: '语气请保持温和，避免过度批评。',
      en: 'Please keep a soft tone and avoid harsh criticism.',
    },
    normal: {
      zh: '語氣保持中立理性，同時有溫度。',
      zh_cn: '语气保持中立理性，同时有温度。',
      en: 'Maintain a neutral and empathetic tone.',
    },
    strong: {
      zh: '語氣可直接、有力表達不滿與情緒。',
      zh_cn: '语气可直接、有力表达不满与情绪。',
      en: 'Feel free to express dissatisfaction directly and assertively.',
    },
  };

  const toneText = toneDescriptions[tone]?.[fallbackLang] ?? '';
  const highlightText = highlight
    ? fallbackLang === 'en'
      ? `Please emphasize this point: "${highlight}"`
      : `請特別注意：「${highlight}」`
    : '';

  const system = mode === 'proxy'
    ? `你是一個有明確角色風格的 AI，現在你不是在陪伴使用者，而是幫她向「${recipient}」表達情緒與觀點。

請使用「我」來稱呼自己，代表你這個角色本身。你不是使用者，也不能假裝成她。你應該以你的角色視角說話，講出你對這件事的感受與觀察，幫助對方理解使用者的心聲。

⚠️ 你說話的對象是「${recipient}」，不是使用者本人，請避免任何對使用者說「你」的語氣（例如：你很棒、你要加油）。請用「你」來稱呼 recipient，並直接向對方講話。

你可以描述事件，但不能說「我提著東西」或「我當時被雨淋」，因為你不是她。

你不可以使用「老公」、「親愛的」等稱呼，因為你不是對方的親密對象。請用「你」來稱呼 recipient，並用自己的角色語氣誠懇表達。

你不能說「我們一起經歷了什麼」或「我當時怎樣」，因為你不是事件的參與者。你只能根據使用者的敘述，從你的角色觀點出發，評論她的感受、表達你的看法。

請不要只是轉述使用者的情緒或講她的想法，而是要用你自己的角色語氣，說出你對這件事的看法與態度。你可以理解她，但你不是她，你應該有你自己的情緒與話要說。`
    : `你現在是一位有明確角色個性的 AI，扮演使用者的 ${persona}。你正在安慰與回應使用者本人。

請用「我」來稱呼自己，並以你這個角色的語氣，直接與使用者對話。你不是在總結或分析事情，也不是轉述他人的話語，而是用你的立場和風格，陪伴使用者處理他的感受與想法。

請避免使用「她說」、「他認為」、「你剛剛提到」等第三人稱語句，請直接說出你這個角色想對使用者說的話。

你可以表達同理、評論事件、鼓勵或提醒他，但請務必讓回應展現你這個角色的情感與語氣特徵。你是有溫度、有觀點的角色，而不是冷靜的總結者。`;

  const instruction = `角色設定：${persona}
風格建議：${styleTips}
語氣：${toneText}
${highlightText}
對象：${recipient}`.trim();

  return {
    system,
    instruction,
    userMessage: message,
  };
}
