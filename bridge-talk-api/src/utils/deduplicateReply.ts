// src/utils/deduplicateReply.ts

/**
 * 嘗試裁切掉重複內容，只保留第一段。
 * 包含「精確切半法」+「換行切段法」+「相似度與長度比例複合判斷」
 */
export function deduplicateReply(reply: string): string {
  const cleaned = reply.trim();

  // ✅ 嘗試以換行為基準切段
  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const half = Math.floor(lines.length / 2);
  const firstPart = lines.slice(0, half).join(' ');
  const secondPart = lines.slice(half).join(' ');

  const normFirst = firstPart.replace(/\s+/g, '');
  const normSecond = secondPart.replace(/\s+/g, '');

  if (!normFirst || !normSecond) return reply;

  const minLen = Math.min(normFirst.length, normSecond.length);
  const maxLen = Math.max(normFirst.length, normSecond.length);
  let sameCount = 0;

  for (let i = 0; i < minLen; i++) {
    if (normFirst[i] === normSecond[i]) sameCount++;
  }

  const similarity = sameCount / minLen;
  const lengthRatio = minLen / maxLen;

  // ✅ 如果相似度 > 90% 且長度比例合理（避免片段重複誤判）
  if (similarity >= 0.9 && lengthRatio > 0.8) {
    return firstPart.trim();
  }

  return reply;
}
