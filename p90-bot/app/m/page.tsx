'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserData { id: string; username: string; phone: string; refCode: string; referredBy?: string; ts: number; }

const C = {
  bg0:'#070e1a', bg1:'#0d1c2e', bg2:'#122336',
  teal:'#6dbfb8', teal2:'#14a085', teal3:'#0d7377',
  text:'#ddeef0', muted:'#5a8090',
  border:'rgba(109,191,184,0.15)', border2:'rgba(109,191,184,0.3)',
};

function MemberContent() {
  const params = useSearchParams();
  const refCode = params.get('ref') || '';
  const [member, setMember] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [newUser, setNewUser] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Try to find member by refCode
    if (!refCode) return;
    fetch('/api/users').then(r => r.json()).then((users: UserData[]) => {
      const found = users.find(u => u.refCode === refCode);
      if (found) setMember(found);
    }).catch(() => {});
  }, [refCode]);

  const register = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name.trim(), phone: phone.trim(), referredBy: refCode }),
      });
      const user = await res.json();
      if (!user.error) {
        localStorage.setItem('p90_user', JSON.stringify(user));
        setNewUser(user);
        setDone(true);
      }
    } catch {}
    setLoading(false);
  };

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/m?ref=${code}`;
    navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  if (done && newUser) return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.bg0},#091622)`, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Sarabun',sans-serif" }}>
      <div style={{ width:'min(95vw,440px)', background:C.bg1, border:`1px solid ${C.border2}`, borderRadius:24, padding:32, textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
        <div style={{ color:C.teal, fontWeight:700, fontSize:24, marginBottom:6 }}>ลงทะเบียนสำเร็จ!</div>
        <div style={{ color:'#fff', fontWeight:600, fontSize:18, marginBottom:20 }}>ยินดีต้อนรับ คุณ {newUser.username}</div>

        <div style={{ background:'rgba(109,191,184,0.08)', border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:20, textAlign:'left' }}>
          <div style={{ color:C.teal, fontWeight:600, fontSize:14, marginBottom:8 }}>🌟 ขอให้ประสบความสำเร็จ</div>
          <div style={{ color:C.muted, fontSize:13, lineHeight:1.8 }}>
            ยินดีต้อนรับเข้าสู่ครอบครัว <strong style={{color:C.teal}}>OlyLife</strong> ค่ะ<br/>
            ขอให้ธุรกิจ P90+ เติบโต มีสุขภาพดี<br/>
            และประสบความสำเร็จในทุกก้าวค่ะ 💚
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:20 }}>
          <div style={{ color:C.muted, fontSize:12, marginBottom:6 }}>🔗 ลิงก์ Referral ของคุณ</div>
          <div style={{ color:C.teal, fontSize:12, fontFamily:'monospace', background:'rgba(0,0,0,0.3)', padding:'8px 10px', borderRadius:8, marginBottom:10, wordBreak:'break-all' }}>
            {typeof window!=='undefined' ? `${window.location.origin}/m?ref=${newUser.refCode}` : ''}
          </div>
          <button onClick={() => copyLink(newUser.refCode)} style={{ width:'100%', padding:'9px', borderRadius:9, border:`1px solid ${C.border2}`, background:copied?'rgba(16,185,129,0.2)':'rgba(109,191,184,0.1)', color:copied?'#10b981':C.teal, fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            {copied ? '✅ คัดลอกแล้ว!' : '📋 คัดลอกลิงก์ Referral'}
          </button>
        </div>

        <a href="/" style={{ display:'block', width:'100%', padding:'13px', borderRadius:12, background:`linear-gradient(135deg,${C.teal3},${C.teal2})`, color:'#fff', fontFamily:'inherit', fontSize:16, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
          🤖 เข้าใช้งาน P90+ Bot
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.bg0},#091622)`, fontFamily:"'Sarabun',sans-serif", color:C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${C.teal3},${C.teal2},${C.teal})`, padding:'40px 20px 60px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }}/>
        <div style={{ position:'absolute', bottom:-30, left:-20, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
        <div style={{ fontSize:60, marginBottom:12, position:'relative' }}>🌿</div>
        <div style={{ color:'#fff', fontWeight:700, fontSize:26, marginBottom:8, position:'relative' }}>OlyLife THZ Tera-P90+</div>
        <div style={{ color:'rgba(255,255,255,0.85)', fontSize:15, lineHeight:1.6, maxWidth:340, margin:'0 auto', position:'relative' }}>
          เทคโนโลยี PEMF & Terahertz<br/>เพื่อสุขภาวะที่ดีจากภายใน
        </div>
        {member && (
          <div style={{ marginTop:16, background:'rgba(0,0,0,0.25)', borderRadius:12, padding:'10px 20px', display:'inline-block', position:'relative' }}>
            <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>แนะนำโดย</div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:18 }}>👤 {member.username}</div>
          </div>
        )}
      </div>

      {/* Product Highlights */}
      <div style={{ padding:'30px 20px', maxWidth:480, margin:'0 auto' }}>
        <div style={{ color:C.teal, fontWeight:700, fontSize:18, marginBottom:16, textAlign:'center' }}>✨ ชุด P90+ ประกอบด้วย</div>
        {[
          { icon:'⚡', title:'Main Device', desc:'PEMF & Terahertz — กระตุ้นพลังงานเซลล์ ส่งเสริมการไหลเวียน' },
          { icon:'💆', title:'Frost Age Beauty Device', desc:'RF & EMS — ส่งเสริมความยืดหยุ่นผิว กระชับผิว' },
          { icon:'💪', title:'Revitaluxe Massager', desc:'3-in-1: Magnetic + EMS/TENS + Red Light — ผ่อนคลายกล้ามเนื้อ' },
        ].map((p,i) => (
          <div key={i} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.teal}`, borderRadius:12, padding:'14px 16px', marginBottom:10, display:'flex', gap:14 }}>
            <div style={{ fontSize:28, flexShrink:0 }}>{p.icon}</div>
            <div>
              <div style={{ color:C.text, fontWeight:600, fontSize:15 }}>{p.title}</div>
              <div style={{ color:C.muted, fontSize:13, marginTop:3, lineHeight:1.5 }}>{p.desc}</div>
            </div>
          </div>
        ))}

        {/* Zoom Meeting */}
        <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:'14px 16px', marginTop:16, marginBottom:24 }}>
          <div style={{ color:'#fcd34d', fontWeight:600, fontSize:14, marginBottom:6 }}>📅 ประชุมออนไลน์ทุกวัน</div>
          <div style={{ color:C.muted, fontSize:13, lineHeight:1.8 }}>
            รายการ "คนรักสุขภาพ"<br/>
            จันทร์–ศุกร์ เวลา 07:00–08:30 น.<br/>
            Zoom ID: <strong style={{color:C.text}}>568 239 4879</strong> | Pass: <strong style={{color:C.text}}>6666</strong>
          </div>
        </div>

        {/* Register Form */}
        <div style={{ background:C.bg1, border:`1px solid ${C.border2}`, borderRadius:20, padding:'28px 24px' }}>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ color:C.teal, fontWeight:700, fontSize:20, marginBottom:6 }}>🎁 ลงทะเบียนฟรี</div>
            <div style={{ color:C.muted, fontSize:13 }}>รับลิงก์ Referral และเข้าถึงข้อมูล P90+ ครบถ้วน</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ color:C.muted, fontSize:12, marginBottom:6 }}>ชื่อ-นามสกุล หรือ ชื่อเล่น *</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น สมชาย ใจดี"
              style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:`1px solid ${C.border2}`, background:'rgba(255,255,255,0.05)', color:C.text, fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ color:C.muted, fontSize:12, marginBottom:6 }}>เบอร์โทรศัพท์ (ไม่บังคับ)</div>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="08X-XXX-XXXX"
              style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:`1px solid ${C.border2}`, background:'rgba(255,255,255,0.05)', color:C.text, fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
          </div>
          {refCode && <div style={{ marginBottom:14, background:'rgba(109,191,184,0.08)', borderRadius:8, padding:'8px 12px', fontSize:12, color:C.teal }}>🎁 Referral Code: <strong>{refCode}</strong></div>}
          <button onClick={register} disabled={!name.trim()||loading}
            style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:name.trim()?`linear-gradient(135deg,${C.teal3},${C.teal2})`:'rgba(255,255,255,0.06)', color:name.trim()?'#fff':'#444', fontFamily:'inherit', fontSize:16, fontWeight:700, cursor:name.trim()?'pointer':'not-allowed' }}>
            {loading ? '⏳ กำลังลงทะเบียน...' : '🌿 ลงทะเบียนเข้าใช้งาน'}
          </button>
          <div style={{ textAlign:'center', marginTop:14 }}>
            <a href="/" style={{ color:C.muted, fontSize:13 }}>หรือ เข้าใช้งานบอทได้เลย →</a>
          </div>
        </div>

        {/* Links */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:20 }}>
          {[
            ['📘 Facebook','https://www.facebook.com/OlyLifeGlobalByVibeVerse/'],
            ['🎬 VTR สินค้า','https://youtu.be/UIv5jff0POo?si=LZ1zBTxhJ8M4DZXT'],
          ].map(([label,url],i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer"
              style={{ display:'block', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg1, color:C.teal, fontSize:13, textDecoration:'none', textAlign:'center' }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MemberPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#070e1a', display:'flex', alignItems:'center', justifyContent:'center', color:'#6dbfb8', fontFamily:'Sarabun,sans-serif', fontSize:18 }}>กำลังโหลด...</div>}>
      <MemberContent />
    </Suspense>
  );
}
