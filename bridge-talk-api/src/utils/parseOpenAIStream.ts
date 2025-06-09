// src/utils/parseOpenAIStream.ts

/**
 * 將 OpenAI Chat API 的串流回應解析為單個 delta.content 區塊，
 * 並即時透過 onDelta 回傳給呼叫端處理。
 *
 * @param stream OpenAI 回傳的 ReadableStream<Uint8Array>
 * @param onDelta 每次解析到內容時呼叫的 callback
 */
export async function parseOpenAIStream(
  stream: ReadableStream<Uint8Array>,
  onDelta: (chunk: string) => void
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = line.replace(/^data: /, '');
        if (json === '[DONE]') break;
        try {
          const delta = JSON.parse(json)?.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
        } catch {
          // 解析錯誤時靜默忽略，避免中斷串流處理
        }
      }
    }
  }
}
