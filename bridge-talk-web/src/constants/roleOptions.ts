import { rolePromptTemplates } from './rolePromptTemplates';

export const roleOptions = Object.keys(rolePromptTemplates).map((key) => ({
  value: key,
  label: getRoleLabel(key),
}));

function getRoleLabel(key: string): string {
  const labels: Record<string, string> = {
    bestie: '💅 刀子嘴豆腐心的閨蜜',
    analyst: '📊 張口就來的股市名嘴',
    cheerleader: '🎉 天真浪漫超樂天派',
    quirky: '🌀 真天馬行空點子王',
    listener: '🧸 感性同理的傾聽者',
    doer: '🛠️ 務實可靠的行動派',
    elder: '🧓 嘮叨但熱心的長輩',
    dramatic: '🎭 戲精上身的好朋友',
    philosopher: '🧠 我是誰哲學家朋友',
  };

  return labels[key] ?? key;
}
