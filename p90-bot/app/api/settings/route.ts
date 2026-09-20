export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export interface SiteSettings {
  brandName: string;
  tagline: string;
  subTagline: string;
  welcomeMsg: string;
  phone: string;
  lineUrl: string;
  messengerUrl: string;
  facebookUrl: string;
  incomePlan: string;
  poster1: string;
  poster2: string;
  poster3: string;
  updatedAt: number;
}

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'OlyLife THZ Tera-P90+',
  tagline: 'ถามทุกเรื่องสินค้า ให้ AI ตอบแทนคุณ',
  subTagline: 'ผู้ช่วย AI ทำงาน 24 ชั่วโมง เทคโนโลยี PEMF & Terahertz พร้อมโอกาสสร้างรายได้',
  welcomeMsg: 'สวัสดีค่ะ! ฉันชื่อ โอลี่ 🌿 ผู้ช่วย AI OlyLife P90+ พร้อมตอบทุกคำถาม',
  phone: '',
  lineUrl: '',
  messengerUrl: '',
  facebookUrl: 'https://www.facebook.com/OlyLifeGlobalByVibeVerse/',
  incomePlan: 'ผัง Matrix\nระบบ BFS Global Queue — คิวเดียวกันทั้งระบบ จัดวางตามลำดับเวลา\nรายได้จากการแนะนำผู้สมัครใหม่',
  poster1: '',
  poster2: '',
  poster3: '',
  updatedAt: Date.now(),
};

async function getSettings(): Promise<SiteSettings> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return DEFAULT_SETTINGS;
  try {
    const res = await fetch(`${url}/get/p90:settings`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
    });
    const { result } = await res.json();
    return result ? { ...DEFAULT_SETTINGS, ...JSON.parse(result) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

async function saveSettings(settings: SiteSettings): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', 'p90:settings', JSON.stringify(settings)]),
  });
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const current = await getSettings();
  const updated: SiteSettings = { ...current, ...body, updatedAt: Date.now() };
  await saveSettings(updated);
  return NextResponse.json(updated);
}
