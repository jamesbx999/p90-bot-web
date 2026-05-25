export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getScheduleItems, addScheduleItem, deleteScheduleItem } from '@/lib/storage';

export async function GET() {
  const items = await getScheduleItems();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }
  const item = await addScheduleItem(body);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deleteScheduleItem(id);
  return NextResponse.json({ ok: true });
}
