'use client';

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow border border-gray-200 p-8 rounded">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">免責聲明 Disclaimer</h1>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          本網站 BridgeTalk 所提供之所有 AI 回應內容皆為透過人工智慧模型自動生成，僅供參考用途，不構成任何法律、心理、醫療或其他專業建議。
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          使用者應自行判斷回應內容之適用性，並為其後續行為與轉述內容負全部責任。BridgeTalk 團隊不保證 AI 回應內容之正確性、完整性或即時性，亦不承擔任何因使用本平台所產生之直接或間接損害、誤解或糾紛。
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          若您需要法律意見、心理諮詢或其他專業協助，請務必諮詢具資格之專業人士。
        </p>
        <p className="text-xs text-gray-500 mt-6">
          本聲明可能會依據服務內容調整，使用本網站即表示您同意此免責條款。
        </p>
      </div>
    </main>
  );
}
