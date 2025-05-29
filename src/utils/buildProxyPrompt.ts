import { rolePromptTemplates } from '@/constant/rolePromptTemplates';
import { formatProxySystemPrompt } from '@/utils/formatProxySystemPrompt';

export function buildProxyPrompt({
  userInput,
  role,
  tone = 'normal',
  highlight = '',
  recipient = '對方',
  lang = 'zh',
}: {
  userInput: string;
  role: keyof typeof rolePromptTemplates;
  tone?: 'soft' | 'normal' | 'strong';
  highlight?: string;
  recipient?: string;
  lang?: 'zh';
}) {
  const roleData = rolePromptTemplates[role]?.[lang]?.proxy;

  if (!roleData) {
    throw new Error(`⚠️ 無效角色 "${role}" 或缺少 proxy 模式設定`);
  }

  const systemPrompt = formatProxySystemPrompt(
    roleData.persona,
    roleData.styleTips,
    recipient,
    tone
  );

  const userMessage = `請根據以下事件描述，完成一封遵守上述規則的信件：\n\n${userInput}${
    highlight ? `\n\n🔎 特別強調：「${highlight}」` : ''
  }`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];
}
