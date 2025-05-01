// src/utils/emotionDetector.ts

export type EmotionLevel = 'mild' | 'medium' | 'strong';

export function detectEmotionLevel(text: string): EmotionLevel {
  const strongKeywords = ['氣到不行', '哭得很慘', '徹底心寒', '崩潰'];
  const mediumKeywords = ['很受傷', '非常失望', '爭執很激烈', '深感被忽略'];
  const mildKeywords = ['有點難過', '小小的不開心', '稍微爭執', '有些誤會'];

  let strongCount = 0;
  let mediumCount = 0;

  for (const keyword of strongKeywords) {
    if (text.includes(keyword)) strongCount++;
  }

  for (const keyword of mediumKeywords) {
    if (text.includes(keyword)) mediumCount++;
  }

  if (strongCount > 1) return 'strong';
  else if (mediumCount > 2) return 'medium';
  else return 'mild';
}
