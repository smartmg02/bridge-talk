import { rolePromptTemplates } from './rolePromptTemplates';

export type RoleKey = keyof typeof rolePromptTemplates;
export type Language = 'zh' | 'en';

const roleLabels: Record<RoleKey, Record<Language, string>> = {
  bestie: {
    zh: '💅 刀子嘴豆腐心的閨蜜',
    en: '💅 Sassy But Loyal Bestie',
  },
  analyst: {
    zh: '📊 張口就來的股市名嘴',
    en: '📊 No-Nonsense Market Analyst',
  },
  cheerleader: {
    zh: '🎉 天真浪漫超樂天派',
    en: '🎉 High-Energy Cheerleader',
  },
  dramatic: {
    zh: '🎭 戲精上身的好朋友',
    en: '🎭 Over-the-Top Dramatic Friend',
  },
};

export function getRoleOptions(language: Language = 'zh') {
  return Object.keys(roleLabels).map((key) => ({
    value: key,
    label: roleLabels[key as RoleKey][language] ?? key,
  }));
} 

export const roleOptions = getRoleOptions('zh');
