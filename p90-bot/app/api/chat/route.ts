export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getKBEntries, getScheduleItems, buildScheduleText } from '@/lib/storage';
import { buildSystemPrompt } from '@/lib/knowledge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured', detail: 'ANTHROPIC_API_KEY is not set in Vercel environment variables' }, { status: 500 });
    }

    const [kbEntries, scheduleItems] = await Promise.all([
      getKBEntries(),
      getScheduleItems(),
    ]);
    const scheduleText = buildScheduleText(scheduleItems);
    const systemPrompt = buildSystemPrompt(kbEntries, scheduleText);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.slice(-20),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data);
      return NextResponse.json({ error: 'AI error', detail: data?.error?.message || JSON.stringify(data) }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error', detail: String(error) }, { status: 500 });
  }
}
