import { Redis } from '@upstash/redis';

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Missing Upstash environment variables');
  }
  return new Redis({ url, token });
}

export interface KBEntry {
  id: string;
  title: string;
  content: string;
  ts: number;
}

export interface ScheduleItem {
  id: string;
  type: 'promo' | 'meeting';
  week: number;
  day: number;
  category: string;
  title: string;
  desc: string;
  startTime: string;
  endTime: string;
  badge?: string;
  location?: string;
  note?: string;
  ts: number;
}

export async function getKBEntries(): Promise<KBEntry[]> {
  try {
    const redis = getRedis();
    const data = await redis.get<KBEntry[]>('kb:entries');
    return data || [];
  } catch (e) {
    console.error('getKBEntries error:', e);
    return [];
  }
}

export async function addKBEntry(entry: Omit<KBEntry, 'id' | 'ts'>): Promise<KBEntry> {
  const redis = getRedis();
  const entries = await getKBEntries();
  const newEntry: KBEntry = { ...entry, id: Date.now().toString(), ts: Date.now() };
  await redis.set('kb:entries', JSON.stringify([newEntry, ...entries]));
  return newEntry;
}

export async function deleteKBEntry(id: string): Promise<void> {
  const redis = getRedis();
  const entries = await getKBEntries();
  await redis.set('kb:entries', JSON.stringify(entries.filter(e => e.id !== id)));
}

export async function getScheduleItems(): Promise<ScheduleItem[]> {
  try {
    const redis = getRedis();
    const data = await redis.get<ScheduleItem[]>('schedule:items');
    return data || [];
  } catch (e) {
    console.error('getScheduleItems error:', e);
    return [];
  }
}

export async function addScheduleItem(item: Omit<ScheduleItem, 'id' | 'ts'>): Promise<ScheduleItem> {
  const redis = getRedis();
  const items = await getScheduleItems();
  const newItem: ScheduleItem = { ...item, id: Date.now().toString(), ts: Date.now() };
  await redis.set('schedule:items', JSON.stringify([newItem, ...items]));
  return newItem;
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const redis = getRedis();
  const items = await getScheduleItems();
  await redis.set('schedule:items', JSON.stringify(items.filter(i => i.id !== id)));
}

export function buildScheduleText(items: ScheduleItem[]): string {
  if (items.length === 0) return '';
  const DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const WEEKS = ['สัปดาห์ที่ 1','สัปดาห์ที่ 2','สัปดาห์ที่ 3','สัปดาห์ที่ 4'];
  let text = '';
  for (let w = 0; w < 4; w++) {
    const weekItems = items.filter(i => i.week === w);
    if (weekItems.length === 0) continue;
    text += `\n【${WEEKS[w]}】\n`;
    for (let d = 0; d < 7; d++) {
      const dayItems = weekItems.filter(i => i.day === d);
      if (dayItems.length === 0) continue;
      text += `  ${DAYS[d]}:\n`;
      dayItems.forEach(i => {
        const icon = i.type === 'promo' ? '🎯' : '📅';
        text += `    ${icon} ${i.title} (${i.startTime}–${i.endTime})`;
        if (i.desc) text += ` — ${i.desc}`;
        if (i.location) text += ` @ ${i.location}`;
        text += '\n';
      });
    }
  }
  return text;
}
