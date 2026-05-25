// No external imports needed — uses built-in fetch to call Upstash REST API directly

async function redisGet<T>(key: string): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const { result } = await res.json();
    if (!result) return null;
    return JSON.parse(result) as T;
  } catch { return null; }
}

async function redisSet(key: string, value: unknown): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, JSON.stringify(value)]),
  });
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
  const data = await redisGet<KBEntry[]>('kb:entries');
  return data || [];
}

export async function addKBEntry(entry: Omit<KBEntry, 'id' | 'ts'>): Promise<KBEntry> {
  const entries = await getKBEntries();
  const newEntry: KBEntry = { ...entry, id: Date.now().toString(), ts: Date.now() };
  await redisSet('kb:entries', [newEntry, ...entries]);
  return newEntry;
}

export async function deleteKBEntry(id: string): Promise<void> {
  const entries = await getKBEntries();
  await redisSet('kb:entries', entries.filter(e => e.id !== id));
}

export async function getScheduleItems(): Promise<ScheduleItem[]> {
  const data = await redisGet<ScheduleItem[]>('schedule:items');
  return data || [];
}

export async function addScheduleItem(item: Omit<ScheduleItem, 'id' | 'ts'>): Promise<ScheduleItem> {
  const items = await getScheduleItems();
  const newItem: ScheduleItem = { ...item, id: Date.now().toString(), ts: Date.now() };
  await redisSet('schedule:items', [newItem, ...items]);
  return newItem;
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const items = await getScheduleItems();
  await redisSet('schedule:items', items.filter(i => i.id !== id));
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
