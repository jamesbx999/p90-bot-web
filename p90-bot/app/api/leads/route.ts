export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  refCode?: string;
  memberName?: string;
  ts: number;
}

async function redisGet<T>(key: string): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
    });
    const { result } = await res.json();
    return result ? JSON.parse(result) : null;
  } catch { return null; }
}

async function redisSet(key: string, value: unknown): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, JSON.stringify(value)]),
  });
}

export async function GET() {
  const leads = await redisGet<Lead[]>('p90:leads') || [];
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, refCode, memberName } = body;
  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'name and phone required' }, { status: 400 });
  }
  const leads = await redisGet<Lead[]>('p90:leads') || [];
  const newLead: Lead = {
    id: Date.now().toString(),
    name: name.trim(),
    phone: phone.trim(),
    refCode: refCode || undefined,
    memberName: memberName || undefined,
    ts: Date.now(),
  };
  await redisSet('p90:leads', [newLead, ...leads]);
  return NextResponse.json(newLead, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const leads = await redisGet<Lead[]>('p90:leads') || [];
  await redisSet('p90:leads', leads.filter(l => l.id !== id));
  return NextResponse.json({ ok: true });
}
