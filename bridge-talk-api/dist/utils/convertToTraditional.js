"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToTraditional = convertToTraditional;
// src/utils/convertToTraditional.ts
const OpenCC = require('node-opencc');
/**
 * 將簡體字轉為繁體字
 * @param text 輸入的簡體中文字串
 * @returns 轉換後的繁體中文
 */
async function convertToTraditional(text) {
    const converter = OpenCC.Converter({ from: 'cn', to: 'tw' }); // 簡轉繁
    return converter(text);
}
