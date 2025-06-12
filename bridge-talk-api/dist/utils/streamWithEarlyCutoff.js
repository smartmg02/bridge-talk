"use strict";
// ✅ streamWithEarlyCutoff.ts
// 替代原本 handle stream 的 while-loop，邊傳邊檢查重複，早期中斷
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamWithEarlyCutoff = streamWithEarlyCutoff;
const util_1 = require("util");
const checkRepeat_1 = require("./checkRepeat");
const deduplicateReply_1 = require("./deduplicateReply");
async function streamWithEarlyCutoff({ response, onDelta, onDone, }) {
    const reader = response.body?.getReader();
    if (!reader)
        throw new Error('⚠️ 無效的串流物件');
    const decoder = new util_1.TextDecoder('utf-8');
    let buffer = '';
    let fullText = '';
    let doneReading = false;
    let cutoffTriggered = false;
    while (!doneReading && !cutoffTriggered) {
        const { value, done } = await reader.read();
        doneReading = done;
        if (done)
            break;
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
                    if ((0, checkRepeat_1.checkRepeat)(fullText)) {
                        const trimmed = (0, deduplicateReply_1.deduplicateReply)(fullText);
                        onDelta(trimmed);
                        cutoffTriggered = true;
                        onDone(trimmed);
                        return;
                    }
                    else {
                        onDelta(delta);
                    }
                }
            }
            catch (err) {
                // Ignore malformed lines
            }
        }
    }
    onDone(fullText);
}
