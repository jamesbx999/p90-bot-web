'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserData { id: string; username: string; phone: string; refCode: string; referredBy?: string; ts: number; }
interface SiteSettings {
  brandName: string; tagline: string; subTagline: string; welcomeMsg: string;
  phone: string; lineUrl: string; messengerUrl: string; facebookUrl: string;
  incomePlan: string; poster1: string; poster2: string; poster3: string;
}

const G = { green:'#14a085', green2:'#0d7377', green3:'#d1fae5', amber:'#d97706', teal:'#0891b2' };

function MemberContent() {
  const params = useSearchParams();
  const refCode = params.get('ref') || '';
  const [member, setMember] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [newUser, setNewUser] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r=>r.json()).then(setSettings).catch(()=>{});
    if (!refCode) return;
    fetch('/api/users').then(r=>r.json()).then((users: UserData[]) => {
      const found = users.find(u => u.refCode === refCode);
      if (found) setMember(found);
    }).catch(()=>{});
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
      if (!user.error) { localStorage.setItem('p90_user', JSON.stringify(user)); setNewUser(user); setDone(true); }
    } catch {}
    setLoading(false);
  };

  const sendChat = async () => {
    if (!chatMsg.trim() || chatLoading) return;
    const q = chatMsg.trim(); setChatMsg(''); setChatLoading(true); setChatReply('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role:'user', content:q }] }),
      });
      const data = await res.json();
      setChatReply(data.content?.map((b:{text?:string})=>b.text||'').join('') || 'ขออภัยค่ะ ลองใหม่อีกครั้ง');
    } catch { setChatReply('ขออภัยค่ะ เกิดข้อผิดพลาด'); }
    setChatLoading(false);
  };

  const copyRef = (code: string) => {
    const link = `${window.location.origin}/m?ref=${code}`;
    navigator.clipboard?.writeText(link).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500); });
  };

  const brand = settings?.brandName || 'OlyLife THZ Tera-P90+';
  const tagline = settings?.tagline || 'ถามทุกเรื่องสินค้า ให้ AI ตอบแทนคุณ';
  const sub = settings?.subTagline || 'ผู้ช่วย AI 24 ชั่วโมง เทคโนโลยี PEMF & Terahertz พร้อมโอกาสสร้างรายได้';

  if (done && newUser) return (
    <div style={{ minHeight:'100vh', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'Sarabun',sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:24, padding:36, width:'min(95vw,440px)', textAlign:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
        <div style={{ color:G.green, fontWeight:700, fontSize:26, marginBottom:6 }}>ลงทะเบียนสำเร็จ!</div>
        <div style={{ color:'#1f2937', fontWeight:600, fontSize:18, marginBottom:20 }}>ยินดีต้อนรับ คุณ {newUser.username}</div>
        <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:14, padding:16, marginBottom:20, textAlign:'left' }}>
          <div style={{ color:G.green, fontWeight:600, marginBottom:8 }}>🌟 ขอให้ประสบความสำเร็จ</div>
          <div style={{ color:'#374151', fontSize:14, lineHeight:1.8 }}>
            ยินดีต้อนรับเข้าสู่ครอบครัว <strong style={{color:G.green}}>OlyLife</strong> ค่ะ<br/>
            ขอให้ธุรกิจ P90+ เติบโต มีสุขภาพดี<br/>
            และประสบความสำเร็จในทุกก้าวค่ะ 💚
          </div>
        </div>
        <div style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:12, padding:14, marginBottom:20 }}>
          <div style={{ color:'#6b7280', fontSize:13, marginBottom:8 }}>🔗 ลิงก์ Referral ของคุณ</div>
          <div style={{ color:G.green2, fontSize:12, fontFamily:'monospace', background:'#f0fdf4', padding:'8px 12px', borderRadius:8, marginBottom:10, wordBreak:'break-all' }}>
            {typeof window!=='undefined'?`${window.location.origin}/m?ref=${newUser.refCode}`:''}
          </div>
          <button onClick={()=>copyRef(newUser.refCode)} style={{ width:'100%', padding:'9px', borderRadius:10, border:`1.5px solid ${copied?'#bbf7d0':'#d1fae5'}`, background:copied?'#d1fae5':'#f0fdf4', color:G.green, fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            {copied?'✅ คัดลอกแล้ว!':'📋 คัดลอกลิงก์ Referral'}
          </button>
        </div>
        <a href="/" style={{ display:'block', padding:'13px', borderRadius:12, background:`linear-gradient(135deg,${G.green2},${G.green})`, color:'#fff', fontFamily:'inherit', fontSize:16, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
          🤖 เข้าใช้งาน P90+ Bot
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:"'Sarabun','Noto Sans Thai',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60, position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${G.green2},${G.green})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
          <span style={{ fontWeight:700, fontSize:15, color:'#1f2937' }}>{brand}</span>
        </div>
        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          <a href="#products" style={{ color:'#6b7280', fontSize:14, textDecoration:'none', fontWeight:500 }}>สินค้า</a>
          <a href="#income" style={{ color:'#6b7280', fontSize:14, textDecoration:'none', fontWeight:500 }}>แผนรายได้</a>
          <a href="#register" style={{ padding:'8px 20px', borderRadius:20, background:`linear-gradient(135deg,${G.green2},${G.green})`, color:'#fff', fontSize:14, textDecoration:'none', fontWeight:600, boxShadow:'0 2px 8px rgba(20,160,133,0.3)' }}>สมัครสมาชิก</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:`linear-gradient(135deg,${G.green2} 0%,${G.green} 60%,#22c55e 100%)`, padding:'60px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center', maxWidth:1100, margin:'0 auto' }}>
        <div>
          <div style={{ display:'inline-block', background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'4px 14px', fontSize:13, color:'rgba(255,255,255,0.9)', marginBottom:16 }}>ผู้ช่วย AI ทำงาน 24 ชั่วโมง</div>
          <h1 style={{ color:'#fff', fontSize:'clamp(28px,4vw,44px)', fontWeight:800, lineHeight:1.2, margin:'0 0 12px' }}>
            {tagline.split('AI').map((part, i) => i === 0 ? part : <span key={i}><span style={{color:'#fbbf24'}}>AI</span>{part}</span>)}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.85)', fontSize:16, lineHeight:1.7, margin:'0 0 24px' }}>{sub}</p>
          {member && (
            <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:12, padding:'10px 16px', marginBottom:20, display:'inline-block' }}>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>แนะนำโดย</div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>👤 {member.username}</div>
            </div>
          )}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <a href="#register" style={{ padding:'12px 28px', borderRadius:25, background:'#fff', color:G.green2, fontSize:15, textDecoration:'none', fontWeight:700, boxShadow:'0 4px 15px rgba(0,0,0,0.15)' }}>สมัครสมาชิก →</a>
            <a href="#products" style={{ padding:'12px 28px', borderRadius:25, border:'2px solid rgba(255,255,255,0.6)', color:'#fff', fontSize:15, textDecoration:'none', fontWeight:600 }}>ดูสินค้าทั้งหมด</a>
          </div>
          <div style={{ marginTop:16, color:'rgba(255,255,255,0.6)', fontSize:12 }}>* รายได้ขึ้นอยู่กับความตั้งใจและความพยายามของแต่ละบุคคล</div>
        </div>

        {/* CHAT PREVIEW */}
        <div style={{ background:'#fff', borderRadius:20, padding:20, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #f3f4f6' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${G.green2},${G.green})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#1f2937' }}>โอลี่ AI</div>
              <div style={{ fontSize:11, color:'#16a34a', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#16a34a', display:'inline-block' }}></span>ออนไลน์
              </div>
            </div>
          </div>
          {chatReply && (
            <div style={{ background:'#f0fdf4', borderRadius:12, padding:'10px 14px', marginBottom:12, fontSize:14, color:'#1f2937', lineHeight:1.6 }}>{chatReply}</div>
          )}
          {chatLoading && (
            <div style={{ background:'#f9fafb', borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', gap:4, alignItems:'center' }}>
              {[0,1,2].map(j=><div key={j} style={{ width:6,height:6,borderRadius:'50%',background:'#6b7280',animation:'bop 1.2s infinite',animationDelay:`${j*0.2}s` }}/>)}
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()}
              placeholder="สินค้าตัวไหนขายดี?"
              style={{ flex:1, padding:'10px 14px', borderRadius:20, border:'1.5px solid #e5e7eb', fontSize:13, fontFamily:'inherit', outline:'none' }} />
            <button onClick={sendChat} disabled={chatLoading||!chatMsg.trim()} style={{ width:40, height:40, borderRadius:'50%', border:'none', background:`linear-gradient(135deg,${G.green2},${G.green})`, color:'#fff', fontSize:18, cursor:chatMsg.trim()?'pointer':'not-allowed', flexShrink:0 }}>➤</button>
          </div>
          <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
            {['P90+ คืออะไร?','ราคาเท่าไหร่?','PEMF คืออะไร?'].map(q=>(
              <button key={q} onClick={()=>{setChatMsg(q);}} style={{ padding:'4px 12px', borderRadius:20, border:`1.5px solid ${G.green3}`, background:G.green3, color:G.green, fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>{q}</button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div id="products" style={{ background:'#f9fafb', padding:'64px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
          <div style={{ color:G.green, fontWeight:600, fontSize:14, marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <span style={{ display:'inline-block', width:32, height:2, background:G.amber }}></span>สินค้าของเรา<span style={{ display:'inline-block', width:32, height:2, background:G.amber }}></span>
          </div>
          <h2 style={{ fontSize:'clamp(22px,3vw,36px)', fontWeight:800, color:'#1f2937', margin:'0 0 10px' }}>นวัตกรรมสุขภาพและความงาม</h2>
          <p style={{ color:'#6b7280', fontSize:15, maxWidth:500, margin:'0 auto 48px' }}>คัดสรรคุณภาพ พร้อมให้ AI ตอบทุกคำถามเรื่องสินค้าแทนคุณ</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { icon:'⚡', name:'Main Device', cat:'PEMF & Terahertz Technology', desc:'กระตุ้นพลังงานเซลล์จากภายใน ส่งเสริมการไหลเวียน 20 ระดับ', price:'รวมในชุด P90+' },
              { icon:'💆', name:'Frost Age Beauty Device', cat:'RF & EMS Technology', desc:'ส่งเสริมความยืดหยุ่นผิว กระชับผิว ให้ความรู้สึกผ่อนคลาย', price:'รวมในชุด P90+' },
              { icon:'💪', name:'Revitaluxe Massager', cat:'3-in-1 Magnetic + EMS + Red Light', desc:'ผ่อนคลายกล้ามเนื้อ ส่งเสริมสุขภาพหนังศีรษะ', price:'รวมในชุด P90+' },
            ].map((p,i)=>(
              <div key={i} style={{ background:'#fff', borderRadius:16, padding:'24px 20px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', textAlign:'left', border:'1px solid #f3f4f6' }}>
                <div style={{ width:56, height:56, borderRadius:14, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:14 }}>{p.icon}</div>
                <div style={{ fontWeight:700, fontSize:15, color:'#1f2937', marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:12, color:G.green, fontWeight:600, marginBottom:8 }}>{p.cat}</div>
                <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.6, marginBottom:12 }}>{p.desc}</div>
                <div style={{ fontSize:14, fontWeight:700, color:G.green2 }}>{p.price}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:24, background:`linear-gradient(135deg,${G.green2},${G.green})`, borderRadius:14, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ textAlign:'left' }}>
              <div style={{ color:'rgba(255,255,255,0.8)', fontSize:13 }}>ราคาชุดครบ 3 อุปกรณ์</div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:24 }}>OlyLife THZ Tera-P90+ <span style={{color:'#fbbf24'}}>$1,500 USD</span></div>
            </div>
            <a href="#register" style={{ padding:'12px 28px', borderRadius:20, background:'#fff', color:G.green2, fontSize:15, textDecoration:'none', fontWeight:700 }}>สั่งซื้อ / สมัครสมาชิก →</a>
          </div>
        </div>
      </div>

      {/* INCOME PLAN */}
      {settings?.incomePlan && (
        <div id="income" style={{ padding:'64px 24px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ color:G.amber, fontWeight:600, fontSize:14, marginBottom:8 }}>โอกาสทางธุรกิจ</div>
            <h2 style={{ fontSize:'clamp(22px,3vw,34px)', fontWeight:800, color:'#1f2937', margin:0 }}>แผนรายได้</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:settings.poster1||settings.poster2||settings.poster3?'1fr 1fr':'1fr', gap:32, alignItems:'start' }}>
            <div style={{ background:'#f9fafb', borderRadius:16, padding:'24px 28px', border:'1px solid #e5e7eb' }}>
              <pre style={{ fontFamily:'Sarabun,sans-serif', fontSize:14, color:'#374151', lineHeight:1.9, whiteSpace:'pre-wrap', margin:0 }}>{settings.incomePlan}</pre>
            </div>
            {(settings.poster1||settings.poster2||settings.poster3) && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[settings.poster1,settings.poster2,settings.poster3].filter(Boolean).map((url,i)=>(
                  <img key={i} src={url} alt={`โปสเตอร์ ${i+1}`} style={{ width:'100%', borderRadius:14, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }} onError={e=>(e.currentTarget.style.display='none')} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ZOOM SCHEDULE */}
      <div style={{ background:'#fffbeb', padding:'40px 24px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontWeight:700, fontSize:20, color:'#92400e', marginBottom:16 }}>📅 ประชุมออนไลน์ทุกวัน — รายการคนรักสุขภาพ</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[['🗓','วันจันทร์–ศุกร์','ทุกสัปดาห์'],['⏰','07:00–08:30 น.','เวลาประชุม'],['💻','Zoom ID: 568 239 4879','Pass: 6666']].map(([icon,title,sub],i)=>(
              <div key={i} style={{ background:'#fff', borderRadius:12, padding:'16px', border:'1.5px solid #fde68a' }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
                <div style={{ fontWeight:700, color:'#92400e', fontSize:14 }}>{title}</div>
                <div style={{ color:'#78350f', fontSize:12, marginTop:2 }}>{sub}</div>
              </div>
            ))}
          </div>
          <a href="https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1" target="_blank" rel="noreferrer"
            style={{ display:'inline-block', marginTop:20, padding:'12px 32px', borderRadius:25, background:'#d97706', color:'#fff', textDecoration:'none', fontWeight:700, fontSize:15 }}>
            เข้าร่วม Zoom →
          </a>
        </div>
      </div>

      {/* REGISTER */}
      <div id="register" style={{ padding:'64px 24px', background:`linear-gradient(160deg,${G.green2},${G.green})` }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:14, marginBottom:8 }}>เริ่มต้นได้เลย</div>
            <h2 style={{ color:'#fff', fontWeight:800, fontSize:28, margin:0 }}>🎁 ลงทะเบียนฟรี</h2>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:14, marginTop:8 }}>รับลิงก์ Referral ส่วนตัว + เข้าถึงข้อมูล P90+ ครบถ้วน</p>
          </div>
          <div style={{ background:'#fff', borderRadius:20, padding:'32px 28px' }}>
            {member && (
              <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:10, padding:'10px 16px', marginBottom:18, fontSize:13, color:'#065f46' }}>
                🎁 คำเชิญจาก <strong>{member.username}</strong>{member.phone ? ` · 📞 ${member.phone}` : ''}
                {settings?.lineUrl && member.phone && <><br/><a href={settings.lineUrl} target="_blank" rel="noreferrer" style={{color:G.green,fontWeight:600}}>💬 ติดต่อผ่าน LINE</a></>}
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>ชื่อ-นามสกุล หรือ ชื่อเล่น *</div>
              <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&register()} placeholder="เช่น สมชาย ใจดี"
                style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:'1.5px solid #e5e7eb', fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>เบอร์โทรศัพท์ (ไม่บังคับ)</div>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="08X-XXX-XXXX"
                style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:'1.5px solid #e5e7eb', fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            </div>
            <button onClick={register} disabled={!name.trim()||loading} style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:name.trim()?`linear-gradient(135deg,${G.green2},${G.green})`:'#d1d5db', color:'#fff', fontFamily:'inherit', fontSize:16, fontWeight:700, cursor:name.trim()?'pointer':'not-allowed', boxShadow:name.trim()?'0 4px 20px rgba(20,160,133,0.4)':'none' }}>
              {loading?'⏳ กำลังลงทะเบียน...':'🌿 ลงทะเบียนเข้าใช้งาน'}
            </button>
            <div style={{ textAlign:'center', marginTop:14, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <a href="/" style={{ color:G.green, fontSize:13, fontWeight:600 }}>🤖 ไปที่บอท</a>
              {settings?.lineUrl && <a href={settings.lineUrl} target="_blank" rel="noreferrer" style={{ color:G.green, fontSize:13, fontWeight:600 }}>💬 LINE</a>}
              {settings?.messengerUrl && <a href={settings.messengerUrl} target="_blank" rel="noreferrer" style={{ color:G.green, fontSize:13, fontWeight:600 }}>💬 Messenger</a>}
              {settings?.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" style={{ color:G.green, fontSize:13, fontWeight:600 }}>📘 Facebook</a>}
            </div>
            <div style={{ textAlign:'center', marginTop:10, color:'#9ca3af', fontSize:12 }}>ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background:'#1f2937', padding:'24px', textAlign:'center' }}>
        <div style={{ color:'#9ca3af', fontSize:13 }}>© 2026 {brand} · <a href="/" style={{color:G.green,textDecoration:'none'}}>🤖 AI Bot</a> · <a href={settings?.facebookUrl||'#'} target="_blank" rel="noreferrer" style={{color:G.green,textDecoration:'none'}}>📘 Facebook</a></div>
      </div>

      <style>{`@keyframes bop{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}*{box-sizing:border-box}@media(max-width:768px){.hero-grid{grid-template-columns:1fr!important}.prod-grid{grid-template-columns:1fr!important}.zoom-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export default function MemberPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', color:'#14a085', fontFamily:'Sarabun,sans-serif', fontSize:18 }}>กำลังโหลด...</div>}>
      <MemberContent />
    </Suspense>
  );
}
