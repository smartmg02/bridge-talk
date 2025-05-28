// src/utils/buildProxyPrompt.ts

import { ProxyRole, proxyRoleTemplates } from '@/constant/proxyRoleTemplates';

export function buildProxyPrompt({
  userInput,
  role,
  tone,
  highlight,
}: {
  userInput: string;
  role: ProxyRole;
  tone: string;
  highlight: string;
}) {
  const roleConfig = proxyRoleTemplates[role]?.zh;

  if (!roleConfig || !roleConfig.proxy) {
    throw new Error('⚠️ 無效角色或缺少 proxy prompt 設定');
  }

  const systemPrompt = roleConfig.proxy;
  const userContent = `請根據以下事件描述，完成一封遵守上述規則的信件：\n\n${userInput}${
    highlight ? `\n\n🔎 特別強調：「${highlight}」` : ''
  }`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
