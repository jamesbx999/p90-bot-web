'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserData { id: string; username: string; phone: string; refCode: string; referredBy?: string; lineUrl?: string; messengerUrl?: string; profileImg?: string; refBaseUrl?: string; heroTitle?: string; ts: number; }
interface SiteSettings { brandName: string; tagline: string; subTagline: string; welcomeMsg: string; phone: string; lineUrl: string; messengerUrl: string; facebookUrl: string; incomePlan: string; poster1: string; poster2: string; poster3: string; }

const GR = '#14a085'; const GR2 = '#0d7377'; const GLIGHT = '#f0fdf4'; const GBORDER = '#bbf7d0';

function MemberContent() {
  const params = useSearchParams();
  const refCode = params.get('ref') || '';
  const [member, setMember] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [regName, setRegName] = useState(''); const [regPhone, setRegPhone] = useState('');
  const [regLoading, setRegLoading] = useState(false); const [regDone, setRegDone] = useState(false); const [newUser, setNewUser] = useState<UserData | null>(null);
  const [leadName, setLeadName] = useState(''); const [leadPhone, setLeadPhone] = useState('');
  const [leadLoading, setLeadLoading] = useState(false); const [leadDone, setLeadDone] = useState(false);
  const [chatMsg, setChatMsg] = useState(''); const [chatReply, setChatReply] = useState(''); const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});
    if (!refCode) return;
    fetch('/api/users').then(r => r.json()).then((users: UserData[]) => {
      const found = users.find(u => u.refCode === refCode);
      if (found) setMember(found);
    }).catch(() => {});
  }, [refCode]);

  const register = async () => {
    if (!regName.trim()) return;
    setRegLoading(true);
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: regName.trim(), phone: regPhone.trim(), referredBy: refCode }) });
      const user = await res.json();
      if (!user.error) { localStorage.setItem('p90_user', JSON.stringify(user)); setNewUser(user); setRegDone(true); }
    } catch {}
    setRegLoading(false);
  };

  const sendLead = async () => {
    if (!leadName.trim() || !leadPhone.trim()) return;
    setLeadLoading(true);
    try {
      await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: leadName.trim(), phone: leadPhone.trim(), refCode, memberName: member?.username }) });
      setLeadDone(true); setLeadName(''); setLeadPhone('');
    } catch {}
    setLeadLoading(false);
  };

  const sendChat = async () => {
    if (!chatMsg.trim() || chatLoading) return;
    const q = chatMsg.trim(); setChatMsg(''); setChatLoading(true); setChatReply('');
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: q }] }) });
      const data = await res.json();
      setChatReply(data.content?.map((b: { text?: string }) => b.text || '').join('') || 'ขออภัยค่ะ ลองใหม่อีกครั้ง');
    } catch { setChatReply('ขออภัยค่ะ เกิดข้อผิดพลาด'); }
    setChatLoading(false);
  };

  const copyRef = (code: string) => {
    navigator.clipboard?.writeText(window.location.origin + '/m?ref=' + code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const brand = settings?.brandName || 'OlyLife THZ Tera-P90+';
  const tagline = settings?.tagline || 'ถามทุกเรื่องสินค้า ให้ AI ตอบแทนคุณ';
  const sub = settings?.subTagline || 'ผู้ช่วย AI 24 ชั่วโมง เทคโนโลยี PEMF & Terahertz พร้อมโอกาสสร้างรายได้';

  // Render hero title with *highlight* support
  const renderHero = (text: string) => text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*')
      ? <span key={i} style={{ color: '#fbbf24' }}>{part.slice(1, -1)}</span>
      : <span key={i}>{part}</span>
  );

  if (regDone && newUser) return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Sarabun,sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 36, width: 'min(95vw,440px)', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
        <div style={{ color: GR, fontWeight: 700, fontSize: 26, marginBottom: 6 }}>ลงทะเบียนสำเร็จ!</div>
        <div style={{ color: '#1f2937', fontWeight: 600, fontSize: 18, marginBottom: 20 }}>ยินดีต้อนรับ คุณ {newUser.username}</div>
        <div style={{ background: GLIGHT, border: '1.5px solid ' + GBORDER, borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left' }}>
          <div style={{ color: GR, fontWeight: 600, marginBottom: 8 }}>🌟 ขอให้ประสบความสำเร็จ</div>
          <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.8 }}>ยินดีต้อนรับเข้าสู่ครอบครัว <strong style={{ color: GR }}>OlyLife</strong> ค่ะ<br />ขอให้ธุรกิจ P90+ เติบโต มีสุขภาพดี และประสบความสำเร็จในทุกก้าวค่ะ 💚</div>
        </div>
        <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>🔗 ลิงก์ Referral ของคุณ</div>
          <div style={{ color: GR2, fontSize: 12, fontFamily: 'monospace', background: GLIGHT, padding: '8px 12px', borderRadius: 8, marginBottom: 10, wordBreak: 'break-all' }}>{typeof window !== 'undefined' ? window.location.origin + '/m?ref=' + newUser.refCode : ''}</div>
          <button onClick={() => copyRef(newUser.refCode)} style={{ width: '100%', padding: '9px', borderRadius: 10, border: '1.5px solid ' + GBORDER, background: copied ? '#d1fae5' : GLIGHT, color: '#16a34a', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{copied ? '✅ คัดลอกแล้ว!' : '📋 คัดลอกลิงก์ Referral'}</button>
        </div>
        <a href="/" style={{ display: 'block', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#0d7377,#14a085)', color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>🤖 เข้าใช้งาน P90+ Bot</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Sarabun,Noto Sans Thai,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0d7377,#14a085)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{brand}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="#steps" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>เริ่มต้น</a>
          <a href="#products" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>สินค้า</a>
          <a href="#register" style={{ padding: '8px 20px', borderRadius: 20, background: 'linear-gradient(135deg,#0d7377,#14a085)', color: '#fff', fontSize: 13, textDecoration: 'none', fontWeight: 600, boxShadow: '0 2px 8px rgba(20,160,133,0.3)' }}>สมัครสมาชิก</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg,#0d7377 0%,#14a085 60%,#22c55e 100%)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            {member?.heroTitle ? (
              <h1 style={{ color: '#fff', fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 800, lineHeight: 1.25, margin: '0 0 14px' }}>{renderHero(member.heroTitle)}</h1>
            ) : (
              <h1 style={{ color: '#fff', fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 800, lineHeight: 1.25, margin: '0 0 14px' }}>
                {tagline.split('AI').map((part, i) => i === 0 ? part : <span key={i}><span style={{ color: '#fbbf24' }}>AI</span>{part}</span>)}
              </h1>
            )}
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.7, margin: '0 0 24px' }}>{sub}</p>
            {member && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '10px 16px', display: 'inline-flex' }}>
                {member.profileImg ? (
                  <img src={member.profileImg} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 700 }}>{member.username.charAt(0)}</div>
                )}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>แนะนำโดย</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>👤 {member.username}</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#register" style={{ padding: '12px 28px', borderRadius: 25, background: '#fff', color: GR2, fontSize: 15, textDecoration: 'none', fontWeight: 700, boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>สมัครสมาชิก →</a>
              <a href="#products" style={{ padding: '12px 28px', borderRadius: 25, border: '2px solid rgba(255,255,255,0.6)', color: '#fff', fontSize: 15, textDecoration: 'none', fontWeight: 600 }}>ดูสินค้า</a>
            </div>
          </div>
          {/* CHAT PREVIEW */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0d7377,#14a085)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>โอลี่ AI</div><div style={{ fontSize: 11, color: '#16a34a' }}>● ออนไลน์</div></div>
            </div>
            {chatReply && <div style={{ background: GLIGHT, borderRadius: 12, padding: '10px 14px', marginBottom: 10, fontSize: 13, color: '#1f2937', lineHeight: 1.6 }}>{chatReply}</div>}
            {chatLoading && <div style={{ background: '#f9fafb', borderRadius: 12, padding: '10px 14px', marginBottom: 10, display: 'flex', gap: 4 }}>{[0,1,2].map(j=><div key={j} style={{ width:6,height:6,borderRadius:'50%',background:'#6b7280',animation:'bop 1.2s infinite',animationDelay:j*0.2+'s' }}/>)}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="สินค้าตัวไหนขายดี?" style={{ flex: 1, padding: '9px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={sendChat} disabled={chatLoading || !chatMsg.trim()} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg,#0d7377,#14a085)', color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>➤</button>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['P90+ คืออะไร?','ราคาเท่าไหร่?','PEMF คืออะไร?'].map(q => (
                <button key={q} onClick={() => { setChatMsg(q); }} style={{ padding: '3px 10px', borderRadius: 20, border: '1.5px solid ' + GBORDER, background: GLIGHT, color: GR, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>{q}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STEPS */}
      <div id="steps" style={{ background: '#f9fafb', padding: '64px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: GR, fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 32, height: 2, background: '#d97706' }}></span>เริ่มต้น<span style={{ display: 'inline-block', width: 32, height: 2, background: '#d97706' }}></span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#1f2937', margin: '0 0 40px' }}>เริ่มใน 3 ขั้นตอน</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { num: '1', color: GR, bg: '#f0fdf4', border: GBORDER, title: 'ทักถาม AI', desc: 'สอบถามสินค้า ราคา แผนรายได้ ให้ชัวร์ก่อนตัดสินใจ' },
              { num: '2', color: '#d97706', bg: '#fffbeb', border: '#fde68a', title: 'สมัครสมาชิก', desc: 'สมัครผ่านลิงก์แนะนำ เข้าสายงานผู้แนะนำอัตโนมัติ' },
              { num: '3', color: '#0891b2', bg: '#f0f9ff', border: '#bae6fd', title: 'เริ่มสร้างรายได้', desc: 'ใช้ AI ช่วยตอบลูกค้า ดูแลทีม และขยายสายงาน' },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, border: '1.5px solid ' + s.border, borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 auto 16px' }}>{s.num}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: s.color, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div id="products" style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: GR, fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 32, height: 2, background: '#d97706' }}></span>สินค้าของเรา<span style={{ display: 'inline-block', width: 32, height: 2, background: '#d97706' }}></span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#1f2937', margin: '0 0 10px' }}>นวัตกรรมสุขภาพและความงาม</h2>
          <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 500, margin: '0 auto 40px' }}>คัดสรรคุณภาพ พร้อมให้ AI ตอบทุกคำถามเรื่องสินค้าแทนคุณ</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { icon: '⚡', name: 'Main Device', cat: 'PEMF & Terahertz', desc: 'กระตุ้นพลังงานเซลล์จากภายใน ส่งเสริมการไหลเวียน 20 ระดับ' },
              { icon: '💆', name: 'Frost Age Beauty', cat: 'RF & EMS Technology', desc: 'ส่งเสริมความยืดหยุ่นผิว กระชับผิว ให้ความรู้สึกผ่อนคลาย' },
              { icon: '💪', name: 'Revitaluxe Massager', cat: '3-in-1 Magnetic + EMS + Red Light', desc: 'ผ่อนคลายกล้ามเนื้อ ส่งเสริมสุขภาพหนังศีรษะ' },
            ].map((p, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'left', border: '1px solid #f3f4f6' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: GLIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 14 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: GR, fontWeight: 600, marginBottom: 8 }}>{p.cat}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, background: 'linear-gradient(135deg,#0d7377,#14a085)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>ราคาชุดครบ 3 อุปกรณ์</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>OlyLife THZ Tera-P90+ <span style={{ color: '#fbbf24' }}>$1,500 USD</span></div>
            </div>
            <a href="#register" style={{ padding: '12px 28px', borderRadius: 20, background: '#fff', color: GR2, fontSize: 15, textDecoration: 'none', fontWeight: 700 }}>สั่งซื้อ / สมัครสมาชิก →</a>
          </div>
        </div>
      </div>

      {/* INCOME PLAN */}
      {settings?.incomePlan && (
        <div style={{ background: '#f9fafb', padding: '64px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', marginBottom: 32 }}>
            <div style={{ color: '#d97706', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>โอกาสทางธุรกิจ</div>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#1f2937', margin: 0 }}>แผนรายได้</h2>
          </div>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: (settings.poster1 || settings.poster2 || settings.poster3) ? '1fr 1fr' : '1fr', gap: 32 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', border: '1px solid #e5e7eb' }}>
              <pre style={{ fontFamily: 'Sarabun,sans-serif', fontSize: 14, color: '#374151', lineHeight: 2, whiteSpace: 'pre-wrap', margin: 0 }}>{settings.incomePlan}</pre>
            </div>
            {(settings.poster1 || settings.poster2 || settings.poster3) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[settings.poster1, settings.poster2, settings.poster3].filter(Boolean).map((url, i) => (
                  <img key={i} src={url} alt={'โปสเตอร์ ' + (i+1)} style={{ width: '100%', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} onError={e => (e.currentTarget.style.display = 'none')} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZOOM */}
      <div style={{ background: '#fffbeb', padding: '40px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#92400e', marginBottom: 16 }}>📅 ประชุมออนไลน์ทุกวัน — รายการคนรักสุขภาพ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[['🗓', 'วันจันทร์–ศุกร์', 'ทุกสัปดาห์'], ['⏰', '07:00–08:30 น.', 'เวลาประชุม'], ['💻', 'Zoom ID: 568 239 4879', 'Pass: 6666']].map(([icon, title, sub], i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1.5px solid #fde68a' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>{title}</div>
                <div style={{ color: '#78350f', fontSize: 12, marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
          <a href="https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 20, padding: '12px 32px', borderRadius: 25, background: '#d97706', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>เข้าร่วม Zoom →</a>
        </div>
      </div>

      {/* REGISTER */}
      <div id="register" style={{ padding: '64px 24px', background: 'linear-gradient(160deg,#0d7377,#14a085)' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 6 }}>เริ่มต้นได้เลย</div>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 26, margin: 0 }}>🎁 ลงทะเบียนฟรี</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8 }}>รับลิงก์ Referral ส่วนตัว + เข้าถึงข้อมูล P90+ ครบถ้วน</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px' }}>
            {member && (
              <div style={{ background: GLIGHT, border: '1.5px solid ' + GBORDER, borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#065f46' }}>
                🎁 คำเชิญจาก <strong>{member.username}</strong>
                <div style={{ marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {member.phone && <span>📞 {member.phone}</span>}
                  {member.lineUrl && <a href={member.lineUrl} target="_blank" rel="noreferrer" style={{ color: GR, fontWeight: 600 }}>💬 LINE</a>}
                  {member.messengerUrl && <a href={member.messengerUrl} target="_blank" rel="noreferrer" style={{ color: GR, fontWeight: 600 }}>💬 Messenger</a>}
                </div>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>ชื่อ-นามสกุล หรือ ชื่อเล่น *</div>
              <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="เช่น สมชาย ใจดี" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>เบอร์โทรศัพท์ (ไม่บังคับ)</div>
              <input value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="08X-XXX-XXXX" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={register} disabled={!regName.trim() || regLoading} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: regName.trim() ? 'linear-gradient(135deg,#0d7377,#14a085)' : '#d1d5db', color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: regName.trim() ? 'pointer' : 'not-allowed', boxShadow: regName.trim() ? '0 4px 20px rgba(20,160,133,0.4)' : 'none' }}>
              {regLoading ? '⏳ กำลังลงทะเบียน...' : '🌿 ลงทะเบียนเข้าใช้งาน'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/" style={{ color: GR, fontSize: 13 }}>🤖 ไปที่บอท</a>
              {settings?.lineUrl && <a href={settings.lineUrl} target="_blank" rel="noreferrer" style={{ color: GR, fontSize: 13 }}>💬 LINE</a>}
              {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" style={{ color: GR, fontSize: 13 }}>📘 Facebook</a>}
            </div>
          </div>
        </div>
      </div>

      {/* CALLBACK FORM */}
      <div style={{ padding: '0 24px 64px', background: '#f9fafb' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Left */}
            <div style={{ background: 'linear-gradient(135deg,#0d7377,#14a085)', padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 24, height: 2, background: '#fbbf24' }}></span>สนใจสอบถาม?
              </div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 26, margin: '0 0 14px', lineHeight: 1.3 }}>ให้ทีมงานติดต่อกลับ</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>ฝากชื่อและเบอร์ไว้ เราจะติดต่อกลับเพื่อตอบทุกข้อสงสัยแบบไม่กดดัน</p>
            </div>
            {/* Right */}
            <div style={{ padding: '36px 32px' }}>
              {leadDone ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: GR, marginBottom: 8 }}>ส่งข้อมูลแล้ว!</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>ทีมงานจะติดต่อกลับหาคุณเร็วๆ นี้ค่ะ</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>ชื่อ-นามสกุล</div>
                    <input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="เช่น สมหญิง ใจดี" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>เบอร์โทรศัพท์</div>
                    <input value={leadPhone} onChange={e => setLeadPhone(e.target.value)} placeholder="08x-xxx-xxxx" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={sendLead} disabled={!leadName.trim() || !leadPhone.trim() || leadLoading} style={{ width: '100%', padding: '14px', borderRadius: 25, border: 'none', background: leadName.trim() && leadPhone.trim() ? 'linear-gradient(135deg,#0d7377,#14a085)' : '#d1d5db', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: leadName.trim() && leadPhone.trim() ? 'pointer' : 'not-allowed', boxShadow: leadName.trim() ? '0 4px 15px rgba(20,160,133,0.3)' : 'none' }}>
                    {leadLoading ? '⏳ กำลังส่ง...' : 'ส่งข้อมูลให้ติดต่อกลับ →'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: '#1f2937', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0d7377,#14a085)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{brand}</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.8, marginBottom: 12 }}>
            <strong style={{ color: '#9ca3af' }}>คำชี้แจง:</strong> อุปกรณ์ P90+ เป็นอุปกรณ์ส่งเสริมสุขภาวะ ไม่ใช่อุปกรณ์ทางการแพทย์ ไม่อ้างสรรพคุณรักษาโรคตาม อย. ไทย · รายได้ขึ้นอยู่กับความตั้งใจและความพยายามของแต่ละบุคคล ไม่มีการรับประกันรายได้ · © 2026 {brand} · <a href="/" style={{ color: GR, textDecoration: 'none' }}>🤖 AI Bot</a>
          </div>
        </div>
      </div>

      <style>{`@keyframes bop{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}*{box-sizing:border-box}@media(max-width:768px){.hero-grid,.prod-grid,.steps-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export default function MemberPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14a085', fontFamily: 'Sarabun,sans-serif', fontSize: 18 }}>กำลังโหลด...</div>}>
      <MemberContent />
    </Suspense>
  );
}
