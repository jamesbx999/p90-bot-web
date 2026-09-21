'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserData { id: string; username: string; phone: string; refCode: string; referredBy?: string; lineUrl?: string; messengerUrl?: string; facebookUrl?: string; profileImg?: string; refBaseUrl?: string; heroTitle?: string; ts: number; }
interface SiteSettings { brandName: string; tagline: string; subTagline: string; welcomeMsg: string; phone: string; lineUrl: string; messengerUrl: string; facebookUrl: string; incomePlan: string; poster1: string; poster2: string; poster3: string; }

const GR = '#14a085'; const GR2 = '#0d7377'; const GLIGHT = '#f0fdf4'; const GBORDER = '#bbf7d0';

const CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  @keyframes bop { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }

  .m-nav { background:#fff; border-bottom:1px solid #e5e7eb; padding:0 20px; display:flex; align-items:center; justify-content:space-between; height:56px; position:sticky; top:0; z-index:100; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
  .m-nav-links { display:flex; gap:12px; align-items:center; }
  .m-nav-link { color:#6b7280; font-size:13px; text-decoration:none; font-weight:500; }
  .m-nav-btn { padding:8px 16px; border-radius:20px; background:linear-gradient(135deg,#0d7377,#14a085); color:#fff; font-size:13px; text-decoration:none; font-weight:600; }

  .m-hero { background:linear-gradient(135deg,#0d7377 0%,#14a085 60%,#22c55e 100%); padding:40px 20px 48px; }
  .m-hero-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; align-items:center; max-width:1100px; margin:0 auto; }
  .m-hero h1 { color:#fff; font-size:clamp(24px,4vw,44px); font-weight:800; line-height:1.25; margin:0 0 12px; }
  .m-hero p { color:rgba(255,255,255,0.85); font-size:15px; line-height:1.7; margin:0 0 20px; }
  .m-hero-btns { display:flex; gap:12px; flex-wrap:wrap; }
  .m-hero-btn1 { padding:12px 24px; border-radius:25px; background:#fff; color:#0d7377; font-size:14px; text-decoration:none; font-weight:700; box-shadow:0 4px 15px rgba(0,0,0,0.15); }
  .m-hero-btn2 { padding:12px 24px; border-radius:25px; border:2px solid rgba(255,255,255,0.6); color:#fff; font-size:14px; text-decoration:none; font-weight:600; }
  .m-chat-box { background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 24px 64px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.4), 0 0 40px rgba(109,219,180,0.25); animation:floatCard 3s ease-in-out infinite; }
  .m-chat-label { background:rgba(255,255,255,0.18); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.3); border-radius:30px; padding:6px 16px; font-size:12px; color:#fff; font-weight:600; display:inline-flex; align-items:center; gap:6px; margin-bottom:12px; }
  @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.4)} }
  .m-member-badge { display:inline-flex; align-items:center; gap:10px; background:rgba(0,0,0,0.2); border-radius:12px; padding:10px 16px; margin-bottom:18px; }

  .m-steps { background:#f9fafb; padding:52px 20px; text-align:center; }
  .m-steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; max-width:900px; margin:32px auto 0; }

  .m-products { padding:52px 20px; text-align:center; }
  .m-prod-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; max-width:1100px; margin:32px auto 0; }

  .m-income { background:#f9fafb; padding:52px 20px; }
  .m-income-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; max-width:1000px; margin:0 auto; }

  .m-zoom { background:#fffbeb; padding:36px 20px; text-align:center; }
  .m-zoom-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; max-width:700px; margin:14px auto 0; }

  .m-register { padding:52px 20px; background:linear-gradient(160deg,#0d7377,#14a085); }
  .m-register-box { max-width:480px; margin:0 auto; background:#fff; border-radius:20px; padding:24px 22px; }

  .m-callback { padding:0 20px 52px; background:#f9fafb; }
  .m-callback-card { max-width:900px; margin:0 auto; background:#fff; border-radius:20px; overflow:hidden; display:grid; grid-template-columns:1fr 1fr; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .m-callback-left { background:linear-gradient(135deg,#0d7377,#14a085); padding:36px 28px; display:flex; flex-direction:column; justify-content:center; }
  .m-callback-right { padding:32px 28px; }

  .m-footer { background:#1f2937; padding:24px 20px; }

  .m-section-label { color:#14a085; font-weight:600; font-size:13px; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px; }
  .m-section-line { display:inline-block; width:28px; height:2px; background:#d97706; }
  .m-section-h2 { font-size:clamp(20px,3vw,34px); font-weight:800; color:#1f2937; margin:0 0 10px; }

  @media (max-width: 768px) {
    .m-hero { padding:28px 16px 36px; }
    .m-hero-grid { grid-template-columns:1fr; gap:24px; }
    .m-hero h1 { font-size:26px; }
    .m-nav-links .m-nav-link { display:none; }
    .m-chat-box { animation:none; } /* disable float on mobile for performance */
    .m-chat-label { font-size:13px; padding:7px 18px; }

    .m-steps { padding:36px 16px; }
    .m-steps-grid { grid-template-columns:1fr; gap:12px; }

    .m-products { padding:36px 16px; }
    .m-prod-grid { grid-template-columns:1fr; gap:12px; }

    .m-income { padding:36px 16px; }
    .m-income-grid { grid-template-columns:1fr; }

    .m-zoom { padding:28px 16px; }
    .m-zoom-grid { grid-template-columns:1fr; gap:10px; }

    .m-register { padding:36px 16px; }
    .m-register-box { padding:20px 16px; }

    .m-callback { padding:0 16px 36px; }
    .m-callback-card { grid-template-columns:1fr; }
    .m-callback-left { padding:24px 20px; }
    .m-callback-right { padding:24px 20px; }

    .m-footer { padding:20px 16px; }
  }
`;

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
      setMember(users.find(u => u.refCode === refCode) || null);
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
      setLeadDone(true);
    } catch {}
    setLeadLoading(false);
  };

  const sendChat = async () => {
    if (!chatMsg.trim() || chatLoading) return;
    const q = chatMsg.trim(); setChatMsg(''); setChatLoading(true); setChatReply('');
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: q }] }) });
      const data = await res.json();
      setChatReply(data.content?.map((b: { text?: string }) => b.text || '').join('') || 'ขออภัยค่ะ ลองใหม่');
    } catch { setChatReply('ขออภัยค่ะ'); }
    setChatLoading(false);
  };

  const copyRef = (code: string) => {
    navigator.clipboard?.writeText(window.location.origin + '/m?ref=' + code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const renderHero = (text: string) => text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*')
      ? <span key={i} style={{ color: '#fbbf24' }}>{part.slice(1, -1)}</span>
      : <span key={i}>{part}</span>
  );

  const brand = settings?.brandName || 'OlyLife THZ Tera-P90+';

  if (regDone && newUser) return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Sarabun,sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 28, width: 'min(95vw,420px)', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🎉</div>
        <div style={{ color: GR, fontWeight: 700, fontSize: 22, marginBottom: 6 }}>ลงทะเบียนสำเร็จ!</div>
        <div style={{ color: '#1f2937', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>ยินดีต้อนรับ คุณ {newUser.username}</div>
        <div style={{ background: GLIGHT, border: '1.5px solid ' + GBORDER, borderRadius: 14, padding: 14, marginBottom: 16, textAlign: 'left', fontSize: 13, color: '#065f46', lineHeight: 1.8 }}>
          🌟 ยินดีต้อนรับเข้าสู่ครอบครัว <strong>OlyLife</strong> ค่ะ<br />ขอให้ธุรกิจ P90+ เติบโต มีสุขภาพดี 💚
        </div>
        <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>🔗 ลิงก์ Referral ของคุณ</div>
          <div style={{ color: GR2, fontSize: 11, fontFamily: 'monospace', background: GLIGHT, padding: '6px 10px', borderRadius: 8, marginBottom: 8, wordBreak: 'break-all' }}>{typeof window !== 'undefined' ? window.location.origin + '/m?ref=' + newUser.refCode : ''}</div>
          <button onClick={() => copyRef(newUser.refCode)} style={{ width: '100%', padding: '9px', borderRadius: 10, border: '1.5px solid ' + GBORDER, background: copied ? '#d1fae5' : GLIGHT, color: '#16a34a', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{copied ? '✅ คัดลอกแล้ว!' : '📋 คัดลอกลิงก์'}</button>
        </div>
        <a href="/" style={{ display: 'block', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#0d7377,#14a085)', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>🤖 เข้าใช้งาน P90+ Bot</a>
      </div>
    </div>
  );

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

  return (
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="m-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#0d7377,#14a085)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🌿</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{brand}</span>
        </div>
        <div className="m-nav-links">
          <a href="#steps" className="m-nav-link">เริ่มต้น</a>
          <a href="#products" className="m-nav-link">สินค้า</a>
          <a href="#register" className="m-nav-btn">สมัครสมาชิก</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="m-hero">
        <div className="m-hero-grid">
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 12px', fontSize: 12, color: 'rgba(255,255,255,0.9)', marginBottom: 12 }}>ผู้ช่วย AI ทำงาน 24 ชั่วโมง</div>
            <h1 className="m-hero h1">
              {member?.heroTitle ? renderHero(member.heroTitle) : (settings?.tagline || 'ถามทุกเรื่องสินค้า ให้ AI ตอบแทนคุณ')}
            </h1>
            <p>{settings?.subTagline || 'ผู้ช่วย AI 24 ชั่วโมง เทคโนโลยี PEMF & Terahertz พร้อมโอกาสสร้างรายได้'}</p>
            {member && (
              <div className="m-member-badge">
                {member.profileImg
                  ? <img src={member.profileImg} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }} />
                  : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700 }}>{member.username.charAt(0)}</div>}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>แนะนำโดย</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>👤 {member.username}</div>
                </div>
              </div>
            )}
            <div className="m-hero-btns">
              <a href="#register" className="m-hero-btn1">สมัครสมาชิก →</a>
              <a href="#products" className="m-hero-btn2">ดูสินค้า</a>
            </div>
          </div>

          {/* CHAT BOX */}
          <div>
            <div className="m-chat-label">
              <span style={{ width:8,height:8,borderRadius:'50%',background:'#4ade80',display:'inline-block',animation:'pulse 1.5s infinite' }}></span>
              🤖 ลองถาม AI Bot ได้เลย!
            </div>
            <div className="m-chat-box">
            {/* Chat Header */}
            <div style={{ background:'linear-gradient(135deg,#0d7377,#14a085)', padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'2px solid rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🤖</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:16, color:'#fff' }}>โอลี่ AI</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.9)', display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 1.5s infinite', boxShadow:'0 0 8px #4ade80' }}></span>
                    ออนไลน์ตลอด 24 ชั่วโมง
                  </div>
                </div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'6px 14px', fontSize:11, color:'#fff', fontWeight:700, border:'1px solid rgba(255,255,255,0.3)' }}>
                ⚡ ตอบทันที
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ padding:'16px 16px 0' }}>
              {/* Default bot message */}
              {!chatReply && !chatLoading && (
                <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#0d7377,#14a085)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🤖</div>
                  <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'18px 18px 18px 4px', padding:'10px 14px', fontSize:13, color:'#1f2937', lineHeight:1.6, maxWidth:'85%' }}>
                    สวัสดีค่ะ! ฉันชื่อ <strong style={{color:'#0d7377'}}>โอลี่</strong> 🌿<br/>
                    มีคำถามเรื่อง P90+ ถามได้เลยนะคะ
                  </div>
                </div>
              )}
              {chatReply && (
                <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#0d7377,#14a085)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🤖</div>
                  <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'18px 18px 18px 4px', padding:'10px 14px', fontSize:13, color:'#1f2937', lineHeight:1.65, maxWidth:'85%' }}>{chatReply}</div>
                </div>
              )}
              {chatLoading && (
                <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#0d7377,#14a085)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🤖</div>
                  <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'18px 18px 18px 4px', padding:'12px 16px', display:'flex', gap:5, alignItems:'center' }}>
                    {[0,1,2].map(j=><div key={j} style={{ width:7,height:7,borderRadius:'50%',background:'#14a085',animation:'bop 1.2s infinite',animationDelay:j*0.2+'s' }}/>)}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <div style={{ padding:'8px 16px', display:'flex', gap:6, flexWrap:'wrap' }}>
              {['P90+ คืออะไร?','ราคาเท่าไหร่?','PEMF คืออะไร?','ตารางประชุม'].map(q => (
                <button key={q} onClick={() => { setChatMsg(q); }} style={{ padding:'7px 14px', borderRadius:20, border:'1.5px solid #bbf7d0', background:'linear-gradient(135deg,rgba(13,115,119,0.08),rgba(20,160,133,0.08))', color:'#0d7377', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600, transition:'all .15s' }}>{q}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding:'10px 16px 16px', display:'flex', gap:8, alignItems:'center' }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="พิมพ์คำถามได้เลยค่ะ..." style={{ flex:1, padding:'11px 16px', borderRadius:25, border:'1.5px solid #d1fae5', fontSize:13, fontFamily:'inherit', outline:'none', background:'#f9fafb' }} />
              <button onClick={sendChat} disabled={chatLoading || !chatMsg.trim()} style={{ width:42, height:42, borderRadius:'50%', border:'none', background:chatMsg.trim()?'linear-gradient(135deg,#0d7377,#14a085)':'#d1d5db', color:'#fff', fontSize:18, cursor:chatMsg.trim()?'pointer':'not-allowed', flexShrink:0, boxShadow:chatMsg.trim()?'0 4px 14px rgba(13,115,119,0.4)':'none', transition:'all .2s' }}>➤</button>
            </div>
          </div>
          </div>{/* end m-chat-box */}
        </div>{/* end wrapper */}
      </div>

      {/* STEPS */}
      <div className="m-steps">
        <div className="m-section-label"><span className="m-section-line"></span>เริ่มต้น<span className="m-section-line"></span></div>
        <h2 className="m-section-h2">เริ่มใน 3 ขั้นตอน</h2>
        <div className="m-steps-grid">
          {[
            { num:'1', color:GR, bg:'#f0fdf4', border:GBORDER, title:'ทักถาม AI', desc:'สอบถามสินค้า ราคา แผนรายได้ ให้ชัวร์ก่อนตัดสินใจ' },
            { num:'2', color:'#d97706', bg:'#fffbeb', border:'#fde68a', title:'สมัครสมาชิก', desc:'สมัครผ่านลิงก์แนะนำ เข้าสายงานผู้แนะนำอัตโนมัติ' },
            { num:'3', color:'#0891b2', bg:'#f0f9ff', border:'#bae6fd', title:'เริ่มสร้างรายได้', desc:'ใช้ AI ช่วยตอบลูกค้า ดูแลทีม และขยายสายงาน' },
          ].map((s,i) => (
            <div key={i} style={{ background:s.bg, border:'1.5px solid '+s.border, borderRadius:16, padding:'24px 18px', textAlign:'center' }}>
              <div style={{ width:44,height:44,borderRadius:12,background:s.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff',margin:'0 auto 12px' }}>{s.num}</div>
              <div style={{ fontWeight:700,fontSize:15,color:s.color,marginBottom:6 }}>{s.title}</div>
              <div style={{ fontSize:13,color:'#6b7280',lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div id="products" className="m-products">
        <div className="m-section-label"><span className="m-section-line"></span>สินค้าของเรา<span className="m-section-line"></span></div>
        <h2 className="m-section-h2">นวัตกรรมสุขภาพและความงาม</h2>
        <p style={{ color:'#6b7280',fontSize:14,maxWidth:480,margin:'0 auto 0' }}>คัดสรรคุณภาพ พร้อมให้ AI ตอบทุกคำถาม</p>
        <div className="m-prod-grid">
          {[
            { icon:'⚡', name:'Main Device', cat:'PEMF & Terahertz', desc:'กระตุ้นพลังงานเซลล์จากภายใน ส่งเสริมการไหลเวียน' },
            { icon:'💆', name:'Frost Age Beauty', cat:'RF & EMS Technology', desc:'ส่งเสริมความยืดหยุ่นผิว กระชับผิว' },
            { icon:'💪', name:'Revitaluxe Massager', cat:'3-in-1 Magnetic + EMS + Red Light', desc:'ผ่อนคลายกล้ามเนื้อ ส่งเสริมสุขภาพหนังศีรษะ' },
          ].map((p,i) => (
            <div key={i} style={{ background:'#fff',borderRadius:14,padding:'20px 16px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',textAlign:'left',border:'1px solid #f3f4f6' }}>
              <div style={{ width:48,height:48,borderRadius:12,background:GLIGHT,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:12 }}>{p.icon}</div>
              <div style={{ fontWeight:700,fontSize:14,color:'#1f2937',marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:11,color:GR,fontWeight:600,marginBottom:6 }}>{p.cat}</div>
              <div style={{ fontSize:13,color:'#6b7280',lineHeight:1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth:1100,margin:'20px auto 0',background:'linear-gradient(135deg,#0d7377,#14a085)',borderRadius:14,padding:'18px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
          <div style={{ textAlign:'left' }}>
            <div style={{ color:'rgba(255,255,255,0.8)',fontSize:12 }}>ราคาชุดครบ 3 อุปกรณ์</div>
            <div style={{ color:'#fff',fontWeight:800,fontSize:18 }}>OlyLife THZ Tera-P90+ <span style={{color:'#fbbf24'}}>$1,500 USD</span></div>
          </div>
          <a href="#register" style={{ padding:'11px 22px',borderRadius:20,background:'#fff',color:GR2,fontSize:14,textDecoration:'none',fontWeight:700 }}>สั่งซื้อ / สมัคร →</a>
        </div>
      </div>

      {/* INCOME */}
      {settings?.incomePlan && (
        <div className="m-income">
          <div style={{ textAlign:'center',marginBottom:28 }}>
            <div style={{ color:'#d97706',fontWeight:600,fontSize:13,marginBottom:6 }}>โอกาสทางธุรกิจ</div>
            <h2 className="m-section-h2">แผนรายได้</h2>
          </div>
          <div className="m-income-grid">
            <div style={{ background:'#fff',borderRadius:14,padding:'20px 22px',border:'1px solid #e5e7eb' }}>
              <pre style={{ fontFamily:'Sarabun,sans-serif',fontSize:14,color:'#374151',lineHeight:2,whiteSpace:'pre-wrap',margin:0 }}>{settings.incomePlan}</pre>
            </div>
            {(settings.poster1||settings.poster2||settings.poster3) && (
              <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                {[settings.poster1,settings.poster2,settings.poster3].filter(Boolean).map((url,i) => (
                  <img key={i} src={url} alt={'โปสเตอร์ '+(i+1)} style={{ width:'100%',borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }} onError={e=>(e.currentTarget.style.display='none')} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZOOM */}
      <div className="m-zoom">
        <div style={{ fontWeight:700,fontSize:17,color:'#92400e',marginBottom:14 }}>📅 ประชุมออนไลน์ทุกวัน</div>
        <div style={{ color:'#78350f',fontSize:13,marginBottom:14 }}>รายการ "คนรักสุขภาพ" ทุกวันจันทร์–ศุกร์</div>
        <div className="m-zoom-grid" style={{ maxWidth:600,margin:'0 auto' }}>
          {[['⏰','07:00–08:30 น.'],['💻','Zoom ID: 568 239 4879'],['🔑','Passcode: 6666']].map(([icon,text],i) => (
            <div key={i} style={{ background:'#fff',borderRadius:10,padding:'12px 14px',border:'1.5px solid #fde68a',fontSize:13,color:'#92400e',fontWeight:500 }}>{icon} {text}</div>
          ))}
        </div>
        <a href="https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1" target="_blank" rel="noreferrer" style={{ display:'inline-block',marginTop:16,padding:'11px 28px',borderRadius:25,background:'#d97706',color:'#fff',textDecoration:'none',fontWeight:700,fontSize:14 }}>เข้าร่วม Zoom →</a>
      </div>

      {/* REGISTER */}
      <div id="register" className="m-register">
        <div style={{ textAlign:'center',marginBottom:22 }}>
          <div style={{ color:'rgba(255,255,255,0.8)',fontSize:13,marginBottom:6 }}>เริ่มต้นได้เลย</div>
          <h2 style={{ color:'#fff',fontWeight:800,fontSize:24,margin:0 }}>🎁 ลงทะเบียนฟรี</h2>
          <p style={{ color:'rgba(255,255,255,0.8)',fontSize:13,marginTop:6 }}>รับลิงก์ Referral ส่วนตัว + เข้าถึงข้อมูล P90+ ครบถ้วน</p>
        </div>
        <div className="m-register-box">
          {member && (
            <div style={{ background:GLIGHT,border:'1.5px solid '+GBORDER,borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:13,color:'#065f46' }}>
              🎁 คำเชิญจาก <strong>{member.username}</strong>
              <div style={{ marginTop:6,display:'flex',gap:10,flexWrap:'wrap' }}>
                {member.phone && <span>📞 {member.phone}</span>}
                {member.lineUrl && <a href={member.lineUrl} target="_blank" rel="noreferrer" style={{color:GR,fontWeight:600}}>💬 LINE</a>}
                {member.messengerUrl && <a href={member.messengerUrl} target="_blank" rel="noreferrer" style={{color:GR,fontWeight:600}}>💬 Messenger</a>}
                {member.facebookUrl && <a href={member.facebookUrl} target="_blank" rel="noreferrer" style={{color:GR,fontWeight:600}}>📘 Facebook</a>}
              </div>
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>ชื่อ-นามสกุล หรือ ชื่อเล่น *</div>
            <input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="เช่น สมชาย ใจดี" style={inp} />
          </div>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>เบอร์โทรศัพท์ (ไม่บังคับ)</div>
            <input value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="08X-XXX-XXXX" style={inp} />
          </div>
          <button onClick={register} disabled={!regName.trim()||regLoading} style={{ width:'100%',padding:'13px',borderRadius:14,border:'none',background:regName.trim()?'linear-gradient(135deg,#0d7377,#14a085)':'#d1d5db',color:'#fff',fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:regName.trim()?'pointer':'not-allowed' }}>
            {regLoading?'⏳ กำลังลงทะเบียน...':'🌿 ลงทะเบียนเข้าใช้งาน'}
          </button>
          <div style={{ textAlign:'center',marginTop:12,display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
            <a href="/" style={{color:GR,fontSize:13}}>🤖 ไปที่บอท</a>
            {settings?.lineUrl && <a href={settings.lineUrl} target="_blank" rel="noreferrer" style={{color:GR,fontSize:13}}>💬 LINE</a>}
            {member?.facebookUrl
              ? <a href={member.facebookUrl} target="_blank" rel="noreferrer" style={{color:GR,fontSize:13}}>📘 Facebook</a>
              : settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" style={{color:GR,fontSize:13}}>📘 Facebook</a>
            }
          </div>
        </div>
      </div>

      {/* CALLBACK */}
      <div className="m-callback" style={{ paddingTop: 40 }}>
        <div className="m-callback-card">
          <div className="m-callback-left">
            <div style={{ color:'#fbbf24',fontWeight:600,fontSize:12,marginBottom:8,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ display:'inline-block',width:20,height:2,background:'#fbbf24' }}></span>สนใจสอบถาม?
            </div>
            <h3 style={{ color:'#fff',fontWeight:800,fontSize:22,margin:'0 0 12px',lineHeight:1.3 }}>ให้ทีมงานติดต่อกลับ</h3>
            <p style={{ color:'rgba(255,255,255,0.8)',fontSize:13,lineHeight:1.7,margin:0 }}>ฝากชื่อและเบอร์ไว้ เราจะติดต่อกลับเพื่อตอบทุกข้อสงสัยแบบไม่กดดัน</p>
          </div>
          <div className="m-callback-right">
            {leadDone ? (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <div style={{ fontSize:44,marginBottom:10 }}>✅</div>
                <div style={{ fontWeight:700,fontSize:17,color:GR,marginBottom:6 }}>ส่งข้อมูลแล้ว!</div>
                <div style={{ color:'#6b7280',fontSize:13 }}>ทีมงานจะติดต่อกลับหาคุณเร็วๆ นี้ค่ะ</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>ชื่อ-นามสกุล</div>
                  <input value={leadName} onChange={e=>setLeadName(e.target.value)} placeholder="เช่น สมหญิง ใจดี" style={inp} />
                </div>
                <div style={{ marginBottom:18 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>เบอร์โทรศัพท์</div>
                  <input value={leadPhone} onChange={e=>setLeadPhone(e.target.value)} placeholder="08x-xxx-xxxx" style={inp} />
                </div>
                <button onClick={sendLead} disabled={!leadName.trim()||!leadPhone.trim()||leadLoading} style={{ width:'100%',padding:'13px',borderRadius:25,border:'none',background:leadName.trim()&&leadPhone.trim()?'linear-gradient(135deg,#0d7377,#14a085)':'#d1d5db',color:'#fff',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:leadName.trim()&&leadPhone.trim()?'pointer':'not-allowed' }}>
                  {leadLoading?'⏳ กำลังส่ง...':'ส่งข้อมูลให้ติดต่อกลับ →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="m-footer">
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#0d7377,#14a085)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🌿</div>
          <span style={{ fontWeight:700,fontSize:14,color:'#fff' }}>{brand}</span>
        </div>
        <div style={{ color:'#6b7280',fontSize:12,lineHeight:1.8 }}>
          <strong style={{color:'#9ca3af'}}>คำชี้แจง:</strong> อุปกรณ์ P90+ เป็นอุปกรณ์ส่งเสริมสุขภาวะ ไม่ใช่อุปกรณ์ทางการแพทย์ ไม่อ้างสรรพคุณรักษาโรคตาม อย. ไทย · รายได้ขึ้นอยู่กับความตั้งใจของแต่ละบุคคล · © 2026 {brand} · <a href="/" style={{color:GR,textDecoration:'none'}}>🤖 AI Bot</a>
        </div>
      </div>
    </>
  );
}

export default function MemberPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',color:'#14a085',fontFamily:'Sarabun,sans-serif',fontSize:18 }}>กำลังโหลด...</div>}>
      <MemberContent />
    </Suspense>
  );
}
