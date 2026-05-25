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
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.slice(-20),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
