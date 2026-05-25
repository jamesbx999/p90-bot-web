export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export interface UserData {
  id: string;
  username: string;
  phone: string;
  refCode: string;
  referredBy?: string;
  ts: number;
}

async function getUsers(): Promise<UserData[]> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return [];
  try {
    const res = await fetch(`${url}/get/p90:users`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
    });
    const { result } = await res.json();
    return result ? JSON.parse(result) : [];
  } catch { return []; }
}

async function saveUsers(users: UserData[]): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', 'p90:users', JSON.stringify(users)]),
  });
}

function genRefCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, phone, referredBy } = body;
  if (!username?.trim()) {
    return NextResponse.json({ error: 'username required' }, { status: 400 });
  }
  const users = await getUsers();
  const newUser: UserData = {
    id: Date.now().toString(),
    username: username.trim(),
    phone: phone?.trim() || '',
    refCode: genRefCode(),
    referredBy: referredBy || undefined,
    ts: Date.now(),
  };
  await saveUsers([newUser, ...users]);
  return NextResponse.json(newUser, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const users = await getUsers();
  await saveUsers(users.filter(u => u.id !== id));
  return NextResponse.json({ ok: true });
}
