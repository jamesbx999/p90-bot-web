export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function upstashCmd(commands: unknown[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Redis not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// GET /api/img?id=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    const data = await upstashCmd(['GET', 'p90:img:' + id]) as string | null;
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const [header, base64] = data.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    const buffer = Buffer.from(base64, 'base64');
    return new Response(buffer, {
      headers: { 'Content-Type': mimeType, 'Cache-Control': 'public, max-age=31536000' },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/img  body: { data: "data:image/jpeg;base64,..." }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = body;
    if (!data || !data.startsWith('data:image/')) {
      return NextResponse.json({ error: 'invalid image data' }, { status: 400 });
    }
    // Size check — keep under 500KB base64 string
    if (data.length > 600_000) {
      return NextResponse.json({ error: 'ภาพใหญ่เกินไป กรุณาย่อขนาดก่อน (ไม่เกิน 400KB)' }, { status: 413 });
    }
    const id = uid();
    await upstashCmd(['SET', 'p90:img:' + id, data]);
    return NextResponse.json({ id, url: '/api/img?id=' + id });
  } catch (e) {
    console.error('img upload error:', e);
    return NextResponse.json({ error: 'upload failed: ' + String(e) }, { status: 500 });
  }
}

// DELETE /api/img?id=xxx
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await upstashCmd(['DEL', 'p90:img:' + id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
