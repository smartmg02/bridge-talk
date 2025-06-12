"use strict";
// src/utils/checkRepeat.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRepeat = checkRepeat;
/**
 * 偵測是否出現「整段內容被重複敘述」的情況。
 * 允許小幅度不同（標點、詞彙順序）
 */
function checkRepeat(content) {
    const cleaned = content.trim();
    const mid = Math.floor(cleaned.length / 2);
    const firstHalf = cleaned.slice(0, mid).replace(/\s+/g, '');
    const secondHalf = cleaned.slice(mid).replace(/\s+/g, '');
    if (!firstHalf || !secondHalf)
        return false;
    const minLen = Math.min(firstHalf.length, secondHalf.length);
    let matchCount = 0;
    for (let i = 0; i < minLen; i++) {
        if (firstHalf[i] === secondHalf[i]) {
            matchCount++;
        }
    }
    const similarity = matchCount / minLen;
    return similarity >= 0.9;
}
