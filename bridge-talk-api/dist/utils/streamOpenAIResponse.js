"use strict";
// src/utils/streamOpenAIResponse.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamOpenAIResponse = streamOpenAIResponse;
function streamOpenAIResponse(response) {
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            if (!reader) {
                controller.close();
                return;
            }
            const decoder = new TextDecoder('utf-8');
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter((line) => line.trim() !== '');
                for (const line of lines) {
                    if (line === 'data: [DONE]') {
                        controller.close();
                        return;
                    }
                    if (line.startsWith('data: ')) {
                        const data = line.replace('data: ', '');
                        try {
                            const json = JSON.parse(data);
                            const text = json.choices?.[0]?.delta?.content;
                            if (text) {
                                controller.enqueue(encoder.encode(text));
                            }
                        }
                        catch (e) {
                            // eslint-disable-next-line no-console
                            console.error('❌ JSON parse error in stream:', e);
                        }
                    }
                }
            }
        },
    });
    return stream;
}
