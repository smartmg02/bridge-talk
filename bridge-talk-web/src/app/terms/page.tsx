'use client';

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow border border-gray-200 p-8 rounded">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">使用條款 Terms of Use</h1>

        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          歡迎使用 BridgeTalk。本服務旨在提供情緒表達與第三人稱溝通支援。使用本網站即表示您同意以下條款。
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">1. 使用者責任</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          使用者應對其所輸入的訊息內容負全部責任。請勿輸入包含誹謗、侵權、暴力或非法內容。
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">2. 智慧財產與授權</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          所有使用者輸入之內容，其著作權仍屬原創者所有。但您同意授權 BridgeTalk 於不具識別性的情況下，用於系統優化、模型訓練與統計分析。
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">3. 系統穩定與風險</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          本平台為實驗性質，可能隨時修改功能、暫停服務或更新模型，不保證穩定連線或結果正確性。請勿作為唯一決策依據。
        </p>

        <h2 className="text-md font-semibold mt-6 mb-2 text-gray-800">4. 法律適用與爭議處理</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          本條款適用於網站營運所在地（目前為美國德州），如發生爭議，將以當地法院為第一審管轄機關。
        </p>

        <p className="text-xs text-gray-500 mt-6">
          若您不同意上述條款，請勿使用本服務。條款如有更新，將公告於本網站，不另行個別通知。
        </p>
      </div>
    </main>
  );
}
