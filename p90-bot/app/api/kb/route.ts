import { NextRequest, NextResponse } from 'next/server';
import { getKBEntries, addKBEntry, deleteKBEntry } from '@/lib/storage';

export async function GET() {
  const entries = await getKBEntries();
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'title and content required' }, { status: 400 });
  }
  const entry = await addKBEntry({ title: body.title.trim(), content: body.content.trim() });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deleteKBEntry(id);
  return NextResponse.json({ ok: true });
}
