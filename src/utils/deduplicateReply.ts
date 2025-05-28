// src/utils/deduplicateReply.ts

/**
 * 嘗試裁切掉重複內容，只保留第一段
 * 適用於「整段內容被貼兩次」的情況（常見於 GPT 輸出錯誤）
 */
export function deduplicateReply(reply: string): string {
  const cleaned = reply.trim();

  // 切半
  const mid = Math.floor(cleaned.length / 2);
  const firstHalf = cleaned.slice(0, mid).trim();
  const secondHalf = cleaned.slice(mid).trim();

  // 比較是否高度相似（排除空白）
  const normalizedFirst = firstHalf.replace(/\s+/g, '');
  const normalizedSecond = secondHalf.replace(/\s+/g, '');

  if (normalizedFirst && normalizedFirst === normalizedSecond) {
    return firstHalf; // 移除重複的第二段
  }

  return reply; // 無重複，回傳原始內容
}
