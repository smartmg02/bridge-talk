'use client';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow border border-gray-200 p-8 rounded">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">隱私政策 Privacy Policy</h1>

        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          BridgeTalk 尊重並保護使用者的隱私。本政策說明我們如何收集、使用、儲存和保護您在使用本服務時所提供的資訊。
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">1. 資料收集</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          當您使用本服務時，我們可能會收集以下資訊：<br />
          • 您輸入的對話內容（包括情緒描述、訊息、角色選擇等）<br />
          • 使用者帳號資訊（例如 email）<br />
          • 使用記錄（如回應時間、token 使用量）
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">2. 資料用途</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          收集之資料將用於：<br />
          • 產出個人化 AI 回應<br />
          • 優化服務品質與系統性能<br />
          • 匿名統計與產品開發分析
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">3. 第三方服務</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          本網站可能透過第三方服務（如 OpenAI、Supabase、Vercel）處理部分資料，惟僅限於提供本服務所需功能，不會販售或公開個資。
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">4. 使用者權利</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          您有權要求查詢、刪除您所提供的個人資料，或撤回對資料使用的同意。您可隨時透過 support@bridgetalkai.com 聯繫我們提出申請。
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">5. 資料保存期間</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          我們將依據資料使用目的，於合理期間內保存資料；當資料無使用需求時將安全刪除。
        </p>

        <p className="text-xs text-gray-500 mt-6">
          本政策可能因應法規或服務調整更新，最新版本將公告於本站。
        </p>
      </div>
    </main>
  );
}
