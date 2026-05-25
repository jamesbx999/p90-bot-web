# OlyLife P90+ AI Bot

บอทตอบคำถามอัตโนมัติสำหรับ OlyLife THZ Tera-P90+

## คุณสมบัติ
- 🤖 AI Bot ตอบคำถามภาษาไทย
- ⚖️ Guardrail อย. ไทย อัตโนมัติ
- 📝 Admin สามารถเพิ่ม/ลบ ฐานความรู้ได้
- 📅 จัดการโปรโมชั่นและตารางประชุมรายสัปดาห์
- 🔒 ระบบ Admin Protected ด้วย Password

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_PASSWORD=your_password_here
KV_REST_API_URL=...  (จาก Vercel KV)
KV_REST_API_TOKEN=...  (จาก Vercel KV)
```

## Deploy to Vercel

1. Push to GitHub
2. Import project on vercel.com
3. Add environment variables
4. Add Vercel KV store
5. Deploy!

## Local Development

```bash
npm install
cp .env.example .env.local
# แก้ไข .env.local ใส่ API keys
npm run dev
```

## Pages
- `/` — หน้าบอทสำหรับลูกค้า
- `/admin` — Admin Dashboard (ต้องล็อกอิน)
- `/admin/login` — หน้าล็อกอิน Admin
