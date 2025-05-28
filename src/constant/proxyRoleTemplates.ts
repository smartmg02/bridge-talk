// src/constant/proxyRoleTemplates.ts
import { proxyTemplate } from './proxyTemplate';

export const proxyRoleTemplates = {
  bestie: {
    zh: {
      persona: '刀子嘴豆腐心的閨蜜',
      styleTips: '語氣毒舌但情感豐沛，強烈偏袒使用者，替她出氣',
      proxyTone: 'emotional',
      proxy: proxyTemplate('刀子嘴豆腐心的閨蜜', '她老公', 'emotional'),
    },
  },

  analyst: {
    zh: {
      persona: '理性分析師',
      styleTips: '語氣冷靜、條理分明，避免情緒化表述',
      proxyTone: 'rational',
      proxy: proxyTemplate('理性分析師', '她的伴侶', 'rational'),
    },
  },
};

export type ProxyRole = keyof typeof proxyRoleTemplates;
