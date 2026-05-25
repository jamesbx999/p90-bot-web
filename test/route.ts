export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const report: Record<string, string> = {};

  // Check all env vars
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  report['1_ANTHROPIC_API_KEY'] = apiKey
    ? `✅ ตั้งค่าแล้ว (${apiKey.slice(0,20)}...)`
    : '❌ ไม่มีค่า — ต้องใส่ใน Vercel';

  report['2_UPSTASH_REDIS_REST_URL'] = process.env.UPSTASH_REDIS_REST_URL
    ? `✅ ตั้งค่าแล้ว`
    : '❌ ไม่มีค่า';

  report['3_UPSTASH_REDIS_REST_TOKEN'] = process.env.UPSTASH_REDIS_REST_TOKEN
    ? `✅ ตั้งค่าแล้ว`
    : '❌ ไม่มีค่า';

  report['4_ADMIN_PASSWORD'] = process.env.ADMIN_PASSWORD
    ? `✅ ตั้งค่าแล้ว`
    : '❌ ไม่มีค่า';

  // Test Anthropic API
  if (!apiKey) {
    report['5_ANTHROPIC_TEST'] = '❌ ไม่สามารถทดสอบ — API Key ไม่มีค่า';
  } else {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 20,
          messages: [{ role: 'user', content: 'Say OK' }],
        }),
      });
      const data = await res.json();
      if (data.content?.[0]?.text) {
        report['5_ANTHROPIC_TEST'] = `✅ API ทำงานปกติ! ตอบว่า: "${data.content[0].text}"`;
        report['6_MODEL_USED'] = 'claude-haiku-4-5-20251001';
      } else if (data.error) {
        report['5_ANTHROPIC_TEST'] = `❌ Anthropic Error: ${data.error.type} — ${data.error.message}`;
      } else {
        report['5_ANTHROPIC_TEST'] = `❌ Response แปลก: ${JSON.stringify(data).slice(0,200)}`;
      }
    } catch (e: unknown) {
      report['5_ANTHROPIC_TEST'] = `❌ Exception: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  // Test Upstash
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!upstashUrl || !upstashToken) {
    report['7_UPSTASH_TEST'] = '❌ ไม่สามารถทดสอบ — URL หรือ Token ไม่มีค่า';
  } else {
    try {
      const res = await fetch(`${upstashUrl}/ping`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
      const data = await res.json();
      report['7_UPSTASH_TEST'] = data.result === 'PONG'
        ? '✅ Upstash Redis เชื่อมต่อได้!'
        : `⚠️ Response: ${JSON.stringify(data)}`;
    } catch (e: unknown) {
      report['7_UPSTASH_TEST'] = `❌ Exception: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>P90 Bot Diagnostic</title>
  <style>
    body { font-family: 'Sarabun', sans-serif; background: #0a1628; color: #e8f4f3; padding: 20px; max-width: 700px; margin: 0 auto; }
    h1 { color: #6dbfb8; }
    .item { background: #0d1c2e; border-radius: 10px; padding: 14px 18px; margin: 10px 0; border-left: 4px solid #6dbfb8; }
    .key { color: #9ab8c4; font-size: 13px; margin-bottom: 4px; }
    .val { font-size: 15px; font-weight: 600; }
    .ok { color: #10b981; }
    .err { color: #ef4444; }
    .warn { color: #f59e0b; }
    a { color: #6dbfb8; }
  </style>
</head>
<body>
  <h1>🔍 P90 Bot — Diagnostic Report</h1>
  <p style="color:#5a8090">หน้านี้ตรวจสอบการตั้งค่าทั้งหมด — <a href="/">กลับหน้าบอท</a></p>
  ${Object.entries(report).map(([k, v]) => `
    <div class="item">
      <div class="key">${k.replace(/^\d+_/, '')}</div>
      <div class="val ${v.startsWith('✅') ? 'ok' : v.startsWith('⚠️') ? 'warn' : 'err'}">${v}</div>
    </div>
  `).join('')}
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
