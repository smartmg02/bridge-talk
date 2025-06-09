import { rolePromptTemplates } from '../constants/rolePromptTemplates';
import { formatProxySystemPrompt } from './formatProxySystemPrompt';

export function buildProxyPrompt({
  userInput,
  role,
  tone = 'normal',
  recipient = '對方',
  lang = 'zh',
}: {
  userInput: string;
  role: keyof typeof rolePromptTemplates;
  tone?: 'soft' | 'normal' | 'strong';
  recipient?: string;
  lang?: 'zh';
}) {
  const roleData = rolePromptTemplates[role]?.[lang]?.proxy;

  if (!roleData) {
    throw new Error(`⚠️ 無效角色 "${role}" 或缺少 proxy 模式設定`);
  }

  // 🔁 將 persona 與 styleTips 中的 ${recipient} 動態取代為實際對象
  const persona = roleData.persona.replace(/\${recipient}/g, recipient);
  const styleTips = roleData.styleTips.replace(/\${recipient}/g, recipient);

  const systemPrompt = formatProxySystemPrompt(
    persona,
    styleTips,
    recipient,
    tone
  );

  const userMessage = `請根據以下事件描述，完成遵守上述規則，來幫使用者教訓對方。請直接針對「${recipient}」說話，禁止稱謂與署名。\n\n${userInput}`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];
}
