# BridgeTalk

BridgeTalk 是一個以 AI 為核心的情緒表達應用，讓使用者能用第三人稱方式釋放內心話，並提供角色化回應風格。

## ✨ 功能概述

- 登入系統（Email 連結登入 / Google OAuth）
- 輸入心聲文字並選擇角色風格
- AI 即時 Streaming 回應
- 儲存歷史紀錄（綁定登入帳號）
- 可查看個人歷史紀錄

## 🛠 技術堆疊

- Next.js App Router
- Supabase Auth & Database
- OpenAI GPT API
- Tailwind CSS

## 🚀 安裝與啟動

```bash
git clone https://github.com/your-username/bridge-talk.git
cd bridge-talk
npm install
cp .env.example .env
# 填入 Supabase 專案對應資訊
npm run dev
```

## 📁 目錄結構簡介

```
src/
├── app/
│   ├── page.tsx              // 首頁 + 輸入框 + 歷史紀錄
│   ├── login/page.tsx        // 登入頁面
│   ├── history/page.tsx      // 獨立歷史紀錄頁
│   └── layout.tsx            // 使用 SupabaseProvider 包裝全站
├── components/
│   ├── UserInputForm.tsx     // 使用者輸入表單
│   ├── HistoryList.tsx       // 歷史紀錄元件
│   └── SupabaseProvider.tsx  // SessionContextProvider 包裝器
├── constants/
│   └── rolePrompts.ts        // 預設角色設定
├── lib/
│   └── supabase.ts           // Supabase client 初始化
```

## 🧪 測試用帳號

你可用任何 email 來測試 OTP 登入流程，或設定自己的 Google OAuth 憑證來整合 Google 登入。

## 📬 聯絡

如需協助請聯繫 maintainer@example.com