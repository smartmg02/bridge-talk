import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resendEmail } from '@/lib/resendEmail';
import { cookieAdapter } from '@/lib/cookieAdapter';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookieAdapter(cookies() as unknown as ReadonlyRequestCookies);

    const { recordId, forwardTo, userEmail } = await req.json();
    if (!recordId || !forwardTo || !userEmail) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('records')
      .select('gpt_reply')
      .eq('id', recordId)
      .single();

    if (error || !data?.gpt_reply) {
      return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 });
    }

    await resendEmail({
      to: forwardTo,
      subject: 'BridgeTalk 心聲轉寄',
      body: data.gpt_reply,
      userEmail,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Error in forward-from-history:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
