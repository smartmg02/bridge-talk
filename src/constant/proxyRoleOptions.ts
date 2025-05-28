import { proxyRoleTemplates } from './proxyRoleTemplates';

export const roleOptions = Object.keys(proxyRoleTemplates).map((key) => ({
  value: key,
  label: proxyRoleTemplates[key as keyof typeof proxyRoleTemplates].zh.persona,
}));
