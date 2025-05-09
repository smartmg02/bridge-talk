import { NextRequest, NextResponse } from 'next/server';
import { rolePrompts } from '@/constants/rolePrompts';

export async function POST(req: NextRequest) {
  const { message, role } = await req.json();
  const systemPrompt = rolePrompts[role as keyof typeof rolePrompts];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    }),
  });

  const { body } = response;
  if (!body) {
    return new NextResponse('No response body', { status: 500 });
  }

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
