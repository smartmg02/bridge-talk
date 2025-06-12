"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
exports.callAI = callAI;
// src/lib/ai.ts
const openai_1 = __importDefault(require("openai"));
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error('❌ OPENAI_API_KEY is not set in environment variables.');
}
exports.openai = new openai_1.default({ apiKey });
async function callAI({ messages, model = 'gpt-3.5-turbo', }) {
    try {
        const response = await exports.openai.chat.completions.create({
            model,
            messages,
        });
        const reply = response.choices[0]?.message?.content || '⚠️ AI 沒有回應內容';
        const tokenCount = response.usage?.total_tokens ?? 0;
        return { reply, tokenCount };
    }
    catch {
        return { reply: '⚠️ 發生錯誤，請稍後再試。', tokenCount: 0 };
    }
}
