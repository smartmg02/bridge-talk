/* eslint-disable no-console */
import { showLogger } from '../constants/env';

/**
 * INFO 等級 log（開發用）
 * @param data - 輸出的資料
 * @param comment - 補充說明
 */
export function logInfo(data: unknown, comment?: string): void {
  if (!showLogger) return;
  console.log(
    '%c📘 INFO:',
    'color: #22D3EE',
    comment ?? '',
    data
  );
}

/**
 * WARN 等級 log（開發用）
 * @param data - 輸出的資料
 * @param comment - 補充說明
 */
export function logWarn(data: unknown, comment?: string): void {
  if (!showLogger) return;
  console.warn(
    '%c⚠️ WARNING:',
    'color: #FACC15',
    comment ?? '',
    data
  );
}

/**
 * ERROR 等級 log（開發用，可擴充至上報）
 * @param data - 輸出的資料
 * @param comment - 補充說明
 */
export function logError(data: unknown, comment?: string): void {
  if (!showLogger) return;
  console.error(
    '%c❌ ERROR:',
    'color: #EF4444',
    comment ?? '',
    data
  );
}

/**
 * 傳統 logger（等同 info）
 * 保留舊版支援，避免原有調用壞掉
 */
export default function logger(data: unknown, comment?: string): void {
  logInfo(data, comment);
}
