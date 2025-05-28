// src/constant/replyRoleOptions.ts
import { replyRoleTemplates } from './replyRoleTemplates';

export const replyRoleOptions = Object.keys(replyRoleTemplates).map((key) => ({
  value: key,
  label: replyRoleTemplates[key as keyof typeof replyRoleTemplates].persona,
}));
