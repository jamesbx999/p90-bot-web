export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export interface UserData {
  id: string;
  username: string;
  phone: string;
  refCode: string;
  referredBy?: string;
  lineUrl?: string;
  facebookUrl?: string;
  messengerUrl?: string;
  profileImg?: string;
  refBaseUrl?: string;
  heroTitle?: string;
  createdByAdmin?: boolean;
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

function genRefCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9\u0E00-\u0E7F]/g, '')
    .slice(0, 16) || genRefCode().toLowerCase();
}

export async function GET() {
  const users = await redisGet<UserData[]>('p90:users') || [];
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, phone, referredBy, lineUrl, messengerUrl, facebookUrl, profileImg, refBaseUrl, heroTitle, slug, createdByAdmin } = body;
  if (!username?.trim()) {
    return NextResponse.json({ error: 'username required' }, { status: 400 });
  }
  const users = await redisGet<UserData[]>('p90:users') || [];
  const refCode = slug?.trim() ? slug.trim().toUpperCase() : genRefCode();
  const newUser: UserData = {
    id: Date.now().toString(),
    username: username.trim(),
    phone: phone?.trim() || '',
    refCode,
    referredBy: referredBy || undefined,
    lineUrl: lineUrl?.trim() || undefined,
    messengerUrl: messengerUrl?.trim() || undefined,
    facebookUrl: facebookUrl?.trim() || undefined,
    profileImg: profileImg?.trim() || undefined,
    refBaseUrl: refBaseUrl?.trim() || undefined,
    heroTitle: heroTitle?.trim() || undefined,
    createdByAdmin: createdByAdmin || false,
    ts: Date.now(),
  };
  await redisSet('p90:users', [newUser, ...users]);
  return NextResponse.json(newUser, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const users = await redisGet<UserData[]>('p90:users') || [];
  const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
  await redisSet('p90:users', updated);
  return NextResponse.json(updated.find(u => u.id === id));
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const users = await redisGet<UserData[]>('p90:users') || [];
  await redisSet('p90:users', users.filter(u => u.id !== id));
  return NextResponse.json({ ok: true });
}
