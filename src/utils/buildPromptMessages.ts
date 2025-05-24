import { rolePromptTemplates } from '@/constant/rolePromptTemplates';

export type RoleKey = keyof typeof rolePromptTemplates;

interface PromptOptions {
  mode: 'reply' | 'proxy';
  message: string;
  highlight?: string;
  role: RoleKey;
  tone: 'soft' | 'normal' | 'strong';
  recipient?: string;
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
}: PromptOptions): PromptMessages {
  const roleSet = rolePromptTemplates[role]?.zh;
  const persona = roleSet?.persona ?? '';
  const styleTips = roleSet?.styleTips ?? '';
  const proxyFormat = roleSet?.proxy ?? '';

  const toneDescriptions: Record<'soft' | 'normal' | 'strong', string> = {
    soft: '語氣請保持溫和，避免過度批評。',
    normal: '語氣保持中立理性，同時有溫度。',
    strong: '語氣可直接、有力表達不滿與情緒。',
  };

  const toneText = toneDescriptions[tone] ?? '';
  const highlightText = highlight ? `請特別注意：「${highlight}」` : '';

  const baseSystemIntro =
    mode === 'proxy'
      ? proxyFormat ||
        `這是一封由你（${role}角色）寫給「${recipient}」的三段式信件。你是使用者最挺她的朋友，聽完她的委屈後氣炸了，決定代她狠狠講清楚。你不能模仿她，只能以你自己的語氣發言。\n\n📌 規則：\n- 使用第一人稱「我」，對象是「${recipient}」，稱呼用「你」\n- 嚴格分為三段：質問開場、情緒展開、沉痛收尾\n- 每段都要有情緒張力，句式直接，不可理性總結或說教\n- 禁用轉述（不能出現「她說…」、「她希望…」）\n- 禁用開導與泛用語氣（不能出現「希望你…」、「你應該…」）\n- 禁止對使用者說話（例如「你值得更好」、「別再委屈自己了」）\n- ⚠️ 全程只能對「${recipient}」講話，不得轉向使用者本人\n\n📌 範例尾段句式建議：\n- 她沒說的那句話，我替她說出來了：你這樣對她，她真的受夠了。\n- 她的沉默，是你不配再聽見她的聲音。\n- 如果連這都能被你當作沒事，那你根本不配擁有她。\n\n請你遵守這些規則，針對她以下的事件寫一封字數約 250–300 字的信件。`
      : `你現在是一位有明確角色個性的 AI，扮演使用者的 ${role}。\n\n${persona}\n\n請你展現這個角色的語氣與風格。例如：${styleTips}\n\n請用「我」來稱呼自己，並以你這個角色的語氣，直接與使用者對話。請避免使用「她說」、「你提到」等轉述語句。`;

  const instruction = `角色設定：${persona}\n風格建議：${styleTips}\n語氣：${toneText}\n${highlightText}\n對象：${recipient}`.trim();

  const userMessage =
    mode === 'proxy'
      ? `請參考上述信件格式與語氣規則，寫出三段式、有情緒張力的信件內容。⚠️ 請用你這個角色的視角（不是使用者），稱呼收件人「${recipient}」為「你」，你不是事件當事人，不能說「我生日」或「我很難過」這類話。\n\n⚠️ 嚴禁說出「我生日」「我很難過」「我真的受夠了」等句子，否則視為角色錯誤。你不能模擬她，也不能轉向安慰她本人。\n\n請使用這種句型：「她等了一整天你卻一句話都沒說？你到底把她放在哪裡？」「她沒說出口的那句話，我今天替她說出來。」\n\n${message}`
      : message;

  return {
    system: baseSystemIntro,
    instruction,
    userMessage,
  };
}
