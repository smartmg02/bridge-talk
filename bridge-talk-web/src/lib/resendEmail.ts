// resendEmail.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BLOCKED_KEYWORDS = ['匯款', '帳戶', '轉帳', '提款', '貸款', '密碼', '信用卡'];

function containsBlockedWords(text: string): boolean {
  return BLOCKED_KEYWORDS.some((word) => text.includes(word));
}

export async function resendEmail({
  to,
  subject,
  body,
  userEmail,
}: {
  to: string;
  subject: string;
  body: string;
  userEmail: string;
}) {
  if (!to || !body) throw new Error('Missing email content or recipient');
  if (containsBlockedWords(body)) {
    throw new Error('❌ Email content contains restricted words');
  }

  const footer = `\n\n---\n⚠️ 本訊息內容由 BridgeTalk 平台使用者（${userEmail}）主動輸入，並透過 AI 工具進行語意轉述與傳送。\n內容純屬使用者個人意見，不代表 BridgeTalk 立場或觀點。\n如您對內容有疑慮，請聯繫我們：support@bridgetalk.ai`;

  try {
    const result = await resend.emails.send({
      from: 'BridgeTalk <noreply@bridgetalkai.com>',
      to,
      subject,
      text: `${body}${footer}`,
    });
    return result;
  } catch (err) {
    console.error('❌ Failed to send email via Resend:', err);
    throw new Error('Failed to send email');
  }
}
