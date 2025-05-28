// src/utils/checkRepeat.ts

export function checkRepeat(content: string): boolean {
  const cleaned = content.trim();

  const mid = Math.floor(cleaned.length / 2);
  const firstHalf = cleaned.slice(0, mid).replace(/\s+/g, '');
  const secondHalf = cleaned.slice(mid).replace(/\s+/g, '');

  return firstHalf.length > 0 && firstHalf === secondHalf;
}
