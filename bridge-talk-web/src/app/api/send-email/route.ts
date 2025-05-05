import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { to, subject, message } = await req.json();

  if (!to || !subject || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { user_text, gpt_reply } = message;

  try {
    const data = await resend.emails.send({
      from: 'BridgeTalk AI <noreply@bridgetalkai.com>', // ✅ 用你的驗證網域
      to,
      subject,
      html: `
        <h2>BridgeTalk AI 回應</h2>
        <p><strong>使用者心聲：</strong></p>
        <blockquote>${user_text}</blockquote>
        <p><strong>AI 回應：</strong></p>
        <blockquote>${gpt_reply}</blockquote>
      `
    });

    return NextResponse.json({ message: 'Email sent', data });
  } catch (error) {
    console.error('發信錯誤：', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
