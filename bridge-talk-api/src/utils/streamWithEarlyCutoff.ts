// ✅ streamWithEarlyCutoff.ts
// 替代原本 handle stream 的 while-loop，邊傳邊檢查重複，早期中斷

import { TextDecoder } from 'util';

import { checkRepeat } from './checkRepeat';
import { deduplicateReply } from './deduplicateReply';

export async function streamWithEarlyCutoff({
  response,
  onDelta,
  onDone,
}: {
  response: Response;
  onDelta: (chunk: string) => void;
  onDone: (finalText: string) => void;
}): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('⚠️ 無效的串流物件');

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = '';
  let doneReading = false;
  let cutoffTriggered = false;

  while (!doneReading && !cutoffTriggered) {
    const { value, done } = await reader.read();
    doneReading = done;
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const clean = line.replace(/^data: /, '').trim();
      if (clean === '[DONE]') {
        onDone(fullText);
        return;
      }

      try {
        const parsed = JSON.parse(clean);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;

          if (checkRepeat(fullText)) {
            const trimmed = deduplicateReply(fullText);
            onDelta(trimmed);
            cutoffTriggered = true;
            onDone(trimmed);
            return;
          } else {
            onDelta(delta);
          }
        }
      } catch (err) {
        // Ignore malformed lines
      }
    }
  }

  onDone(fullText);
}
