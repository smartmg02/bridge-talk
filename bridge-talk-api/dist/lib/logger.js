"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
exports.logWarn = logWarn;
exports.logError = logError;
exports.default = logger;
/* eslint-disable no-console */
const env_1 = require("@/constants/env");
/**
 * INFO 等級 log（開發用）
 * @param data - 輸出的資料
 * @param comment - 補充說明
 */
function logInfo(data, comment) {
    if (!env_1.showLogger)
        return;
    console.log('%c📘 INFO:', 'color: #22D3EE', comment ?? '', data);
}
/**
 * WARN 等級 log（開發用）
 * @param data - 輸出的資料
 * @param comment - 補充說明
 */
function logWarn(data, comment) {
    if (!env_1.showLogger)
        return;
    console.warn('%c⚠️ WARNING:', 'color: #FACC15', comment ?? '', data);
}
/**
 * ERROR 等級 log（開發用，可擴充至上報）
 * @param data - 輸出的資料
 * @param comment - 補充說明
 */
function logError(data, comment) {
    if (!env_1.showLogger)
        return;
    console.error('%c❌ ERROR:', 'color: #EF4444', comment ?? '', data);
}
/**
 * 傳統 logger（等同 info）
 * 保留舊版支援，避免原有調用壞掉
 */
function logger(data, comment) {
    logInfo(data, comment);
}
