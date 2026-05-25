'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }
interface UserData { id: string; username: string; phone: string; refCode: string; referredBy?: string; ts: number; }

const C = {
  bg0:'#070e1a', bg1:'#0d1c2e', bg2:'#122336',
  teal:'#6dbfb8', teal2:'#14a085', teal3:'#0d7377',
  text:'#ddeef0', muted:'#5a8090', dim:'#3a5a6a',
  border:'rgba(109,191,184,0.15)', border2:'rgba(109,191,184,0.3)',
};

const FDA_KWS = ['รักษา','หาย','บำบัด','กำจัดโรค','ป้องกันโรค','cure','treat','heal','เบาหวาน','มะเร็ง','ความดัน','ไขมันในเลือด','ไต','หัวใจล้มเหลว'];

const MENU_CATS = [
  { id:'product', label:'🛍️ สินค้า', color:'#14a085',
    items:['P90+ คืออะไร?','P90+ ต่างจาก P90 อย่างไร?','มีอะไรในชุด P90+ บ้าง?','ราคา P90+ เท่าไหร่?','ใครเหมาะใช้ P90+?','วิธีใช้งาน P90+'] },
  { id:'pemf', label:'⚡ PEMF', color:'#6366f1',
    items:['PEMF คืออะไร?','ไมโตคอนเดรียและ ATP','PEMF ช่วยร่างกายอย่างไร?','มีงานวิจัยรองรับไหม?','Terahertz คืออะไร?','ปลอดภัยไหม?'] },
  { id:'schedule', label:'📅 ตาราง', color:'#f59e0b',
    items:['ตารางประชุม Zoom วันนี้','ลิงก์เข้า Zoom','Meeting ID และ Passcode','ประชุมกี่โมง?','Facebook Live','โปรโมชั่นตอนนี้'] },
  { id:'links', label:'🔗 ลิงก์', color:'#ec4899',
    items:['ลิงก์ Facebook OlyLife','วิดีโอ VTR ภาษาอังกฤษ','วิดีโอ VTR ภาษาจีน','สไลด์ Canva','งานวิจัย PubMed','ติดต่อทีม OlyLife'] },
  { id:'fda', label:'⚖️ อย.', color:'#ef4444',
    items:['พูดเรื่องอะไรได้บ้าง?','คำที่ห้ามใช้','แนะนำลูกค้าถูกกฎหมาย'] },
];

function fmt(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br/>');
}

// ── Register Modal ────────────────────────────────────────────────────────────
function RegisterModal({ refBy, onDone }: { refBy: string; onDone: (u: UserData) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleReg = async () => {
    if (!name.trim()) { setErr('กรุณาใส่ชื่อค่ะ'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name.trim(), phone: phone.trim(), referredBy: refBy || undefined }),
      });
      const user = await res.json();
      if (user.error) { setErr(user.error); setLoading(false); return; }
      localStorage.setItem('p90_user', JSON.stringify(user));
      onDone(user);
    } catch { setErr('เกิดข้อผิดพลาด กรุณาลองใหม่'); }
    setLoading(false);
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Sarabun',sans-serif" }}>
      <div style={{ background:'linear-gradient(160deg,#0d1c2e,#122336)',border:'1px solid rgba(109,191,184,0.3)',borderRadius:24,padding:'36px 32px',width:'min(95vw,420px)',boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ fontSize:52,marginBottom:12 }}>🌿</div>
          <div style={{ color:C.teal,fontWeight:700,fontSize:22,marginBottom:6 }}>ยินดีต้อนรับสู่</div>
          <div style={{ color:'#fff',fontWeight:700,fontSize:18 }}>OlyLife P90+ Bot</div>
          {refBy && <div style={{ marginTop:10,background:'rgba(109,191,184,0.1)',borderRadius:8,padding:'6px 14px',fontSize:13,color:C.teal }}>🎁 ได้รับคำเชิญจาก: <strong>{refBy}</strong></div>}
          <div style={{ color:C.muted,fontSize:13,marginTop:12,lineHeight:1.6 }}>ลงทะเบียนเพื่อรับลิงก์ Referral<br/>และรับข้อมูล P90+ ครบถ้วน</div>
        </div>

        <div style={{ marginBottom:14 }}>
          <div style={{ color:C.muted,fontSize:12,marginBottom:6 }}>ชื่อ-นามสกุล หรือ ชื่อเล่น *</div>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleReg()}
            placeholder="เช่น สมชาย ใจดี หรือ James"
            style={{ width:'100%',padding:'12px 16px',borderRadius:12,border:`1px solid ${C.border2}`,background:'rgba(255,255,255,0.06)',color:C.text,fontSize:15,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} />
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ color:C.muted,fontSize:12,marginBottom:6 }}>เบอร์โทรศัพท์ (ไม่บังคับ)</div>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="08X-XXX-XXXX"
            style={{ width:'100%',padding:'12px 16px',borderRadius:12,border:`1px solid ${C.border2}`,background:'rgba(255,255,255,0.06)',color:C.text,fontSize:15,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }} />
        </div>

        {err && <div style={{ color:'#ef4444',fontSize:13,marginBottom:12,textAlign:'center' }}>{err}</div>}

        <button onClick={handleReg} disabled={loading||!name.trim()} style={{ width:'100%',padding:'14px',borderRadius:14,border:'none',background:name.trim()?`linear-gradient(135deg,${C.teal3},${C.teal2})`:'rgba(255,255,255,0.06)',color:name.trim()?'#fff':'#444',fontFamily:'inherit',fontSize:16,fontWeight:700,cursor:name.trim()?'pointer':'not-allowed',transition:'all .2s' }}>
          {loading ? '⏳ กำลังลงทะเบียน...' : '🌿 ลงทะเบียนเข้าใช้งาน'}
        </button>

        <div style={{ textAlign:'center',marginTop:14,color:C.dim,fontSize:12 }}>
          ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย
        </div>
      </div>
    </div>
  );
}

// ── Welcome Popup ─────────────────────────────────────────────────────────────
function WelcomePopup({ user, onClose }: { user: UserData; onClose: () => void }) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const refLink = `${baseUrl}/?ref=${user.refCode}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(refLink).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:2100,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Sarabun',sans-serif" }}>
      <div style={{ background:'linear-gradient(160deg,#0d1c2e,#122336)',border:'1px solid rgba(109,191,184,0.4)',borderRadius:24,padding:'36px 28px',width:'min(95vw,440px)',textAlign:'center',boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ fontSize:60,marginBottom:8 }}>🎉</div>
        <div style={{ color:C.teal,fontWeight:700,fontSize:24,marginBottom:8 }}>ยินดีต้อนรับ!</div>
        <div style={{ color:'#fff',fontWeight:600,fontSize:19,marginBottom:16 }}>คุณ {user.username}</div>

        <div style={{ background:'rgba(109,191,184,0.08)',border:'1px solid rgba(109,191,184,0.25)',borderRadius:14,padding:'16px 18px',marginBottom:20,textAlign:'left' }}>
          <div style={{ color:C.teal,fontWeight:600,fontSize:14,marginBottom:8 }}>🌟 ขอให้ประสบความสำเร็จ</div>
          <div style={{ color:C.muted,fontSize:13,lineHeight:1.8 }}>
            ยินดีต้อนรับเข้าสู่ครอบครัว <strong style={{color:C.teal}}>OlyLife</strong> ค่ะ<br/>
            ขอให้ธุรกิจ P90+ เติบโต มีสุขภาพดี<br/>
            และประสบความสำเร็จในทุกก้าวค่ะ 💚
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)',border:`1px solid ${C.border}`,borderRadius:12,padding:'14px 16px',marginBottom:20 }}>
          <div style={{ color:C.muted,fontSize:12,marginBottom:8 }}>🔗 ลิงก์ Referral ของคุณ (แชร์ให้เพื่อน)</div>
          <div style={{ color:C.teal,fontSize:13,wordBreak:'break-all',marginBottom:10,fontFamily:'monospace',background:'rgba(0,0,0,0.3)',padding:'8px 12px',borderRadius:8 }}>{refLink}</div>
          <button onClick={copy} style={{ width:'100%',padding:'9px',borderRadius:9,border:`1px solid ${C.border2}`,background:copied?'rgba(16,185,129,0.2)':'rgba(109,191,184,0.1)',color:copied?'#10b981':C.teal,fontFamily:'inherit',fontSize:13,fontWeight:600,cursor:'pointer' }}>
            {copied ? '✅ คัดลอกแล้ว!' : '📋 คัดลอกลิงก์'}
          </button>
        </div>

        <button onClick={onClose} style={{ width:'100%',padding:'13px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${C.teal3},${C.teal2})`,color:'#fff',fontFamily:'inherit',fontSize:16,fontWeight:700,cursor:'pointer' }}>
          🤖 เริ่มใช้งานบอทได้เลย!
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [msgs, setMsgs] = useState<Message[]>([
    { role:'assistant', content:'สวัสดีค่ะ! ฉันชื่อ **โอลี่** 🌿\n\nผู้ช่วยข้อมูล **OlyLife THZ Tera-P90+** พร้อมตอบทุกคำถาม\n\nเลือกหมวดคำถาม หรือพิมพ์ได้เลยนะคะ 😊' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState('product');
  const [fdaWarn, setFdaWarn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [refBy, setRefBy] = useState('');
  const [showRefLink, setShowRefLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Get ref param from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || '';
    setRefBy(ref);
    // Check existing user
    const stored = localStorage.getItem('p90_user');
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); }
      catch { setShowRegister(true); }
    } else {
      setTimeout(() => setShowRegister(true), 800);
    }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, loading]);

  const handleRegistered = (user: UserData) => {
    setCurrentUser(user);
    setShowRegister(false);
    setShowWelcome(true);
  };

  const sendMsg = useCallback(async (text?: string) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');
    setFdaWarn(FDA_KWS.some(k => t.toLowerCase().includes(k.toLowerCase())));
    const newMsgs: Message[] = [...msgs, { role:'user', content:t }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      const reply = data.content?.map((b: {text?:string}) => b.text||'').join('')
        || (data.error ? `❌ ${data.error}${data.detail ? ': '+data.detail : ''}` : 'ขออภัยค่ะ ไม่สามารถตอบได้ในขณะนี้');
      setMsgs(p => [...p, { role:'assistant', content:reply }]);
    } catch (e) {
      setMsgs(p => [...p, { role:'assistant', content:`❌ เกิดข้อผิดพลาด: ${e}` }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  }, [msgs, input, loading]);

  const copyRefLink = () => {
    if (!currentUser) return;
    const link = `${window.location.origin}/?ref=${currentUser.refCode}`;
    navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  const cat = MENU_CATS.find(c => c.id === activeCat)!;

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.bg0} 0%,#091622 60%,#050e18 100%)`, display:'flex', flexDirection:'column', maxWidth:540, margin:'0 auto', height:'100dvh', fontFamily:"'Sarabun','Noto Sans Thai',sans-serif", color:C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {showRegister && <RegisterModal refBy={refBy} onDone={handleRegistered} />}
      {showWelcome && currentUser && <WelcomePopup user={currentUser} onClose={() => { setShowWelcome(false); setShowRefLink(true); }} />}

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal3},${C.teal2},${C.teal})`, padding:'12px 16px 10px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'2px solid rgba(255,255,255,0.4)', flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>โอลี่ — OlyLife P90+ Bot</div>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:11, marginTop:1 }}>
              {currentUser ? `👤 ${currentUser.username}` : 'ข้อมูลสินค้า • PEMF • ตาราง'} 🟢
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {currentUser && (
              <button onClick={() => setShowRefLink(v=>!v)} title="ลิงก์ Referral" style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, color:'#fff', fontSize:16, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>🔗</button>
            )}
            <button onClick={() => setMsgs([{ role:'assistant', content:'เริ่มบทสนทนาใหม่แล้วนะคะ 😊' }])} title="เริ่มใหม่" style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, color:'#fff', fontSize:18, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>↺</button>
          </div>
        </div>
        <div style={{ marginTop:8, background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'5px 10px', fontSize:11, color:'rgba(255,255,255,0.85)', display:'flex', gap:5 }}>
          ⚖️ ไม่อ้างสรรพคุณรักษาโรค — ปฏิบัติตาม อย. ไทย
        </div>
      </div>

      {/* Referral Link Banner */}
      {showRefLink && currentUser && (
        <div style={{ background:'rgba(13,115,119,0.15)', borderBottom:`1px solid ${C.border}`, padding:'10px 14px', flexShrink:0 }}>
          <div style={{ color:C.muted, fontSize:12, marginBottom:4 }}>🔗 ลิงก์ Referral ของคุณ</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ flex:1, color:C.teal, fontSize:12, fontFamily:'monospace', background:'rgba(0,0,0,0.3)', padding:'6px 10px', borderRadius:8, wordBreak:'break-all' }}>
              {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${currentUser.refCode}` : ''}
            </div>
            <button onClick={copyRefLink} style={{ padding:'6px 12px', borderRadius:8, border:`1px solid ${C.border2}`, background:copied?'rgba(16,185,129,0.2)':'rgba(109,191,184,0.1)', color:copied?'#10b981':C.teal, fontSize:12, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', fontWeight:600 }}>
              {copied ? '✅' : '📋 คัดลอก'}
            </button>
          </div>
        </div>
      )}

      {/* FDA Warning */}
      {fdaWarn && (
        <div style={{ background:'#2d1b00', borderLeft:'4px solid #f59e0b', padding:'7px 14px', fontSize:12, color:'#fcd34d', flexShrink:0, display:'flex', gap:6 }}>
          ⚠️ พบคำเกี่ยวกับโรค — บอทจะตอบตามข้อกำหนด อย. เท่านั้น
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 12px', display:'flex', flexDirection:'column', gap:10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', alignItems:'flex-end', gap:7 }}>
            {m.role === 'assistant' && (
              <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${C.teal3},${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🤖</div>
            )}
            <div style={{ maxWidth:'80%', padding:'10px 13px', borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', background:m.role==='user'?`linear-gradient(135deg,${C.teal3},${C.teal2})`:C.bg2, color:'#fff', fontSize:14, lineHeight:1.65, border:m.role==='assistant'?`1px solid ${C.border}`:'none', wordBreak:'break-word' }}
              dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', alignItems:'flex-end', gap:7 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${C.teal3},${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🤖</div>
            <div style={{ padding:'11px 15px', background:C.bg2, borderRadius:'18px 18px 18px 4px', border:`1px solid ${C.border}`, display:'flex', gap:5 }}>
              {[0,1,2].map(j => <div key={j} style={{ width:6, height:6, borderRadius:'50%', background:C.teal, animation:'bop 1.2s infinite', animationDelay:`${j*0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Menu */}
      <div style={{ flexShrink:0, borderTop:`1px solid ${C.border}`, background:C.bg1 }}>
        <div style={{ display:'flex', overflowX:'auto', padding:'7px 10px 0', scrollbarWidth:'none', gap:4 }}>
          {MENU_CATS.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ flexShrink:0, padding:'4px 10px', borderRadius:'18px 18px 0 0', border:`1px solid ${activeCat===c.id?c.color+'44':C.border}`, borderBottom:'none', background:activeCat===c.id?c.color+'18':'transparent', color:activeCat===c.id?c.color:C.muted, fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight:activeCat===c.id?600:400, whiteSpace:'nowrap' }}>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ padding:'7px 10px', display:'flex', flexWrap:'wrap', gap:5, borderTop:`1px solid ${cat.color}22` }}>
          {cat.items.map((q, i) => (
            <button key={i} onClick={() => sendMsg(q)} disabled={loading} style={{ padding:'5px 11px', borderRadius:18, border:`1px solid ${cat.color}44`, background:`${cat.color}12`, color:cat.color, fontSize:12, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', whiteSpace:'nowrap', opacity:loading?.5:1 }}>{q}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:7, padding:'7px 11px 13px', alignItems:'flex-end' }}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();} }}
            placeholder="พิมพ์คำถาม..." rows={1} disabled={loading}
            style={{ flex:1, padding:'9px 13px', borderRadius:20, border:`1px solid ${C.border2}`, background:C.bg2, color:C.text, fontSize:14, outline:'none', resize:'none', fontFamily:'inherit', lineHeight:1.5, maxHeight:80, overflowY:'auto' }} />
          <button onClick={() => sendMsg()} disabled={loading||!input.trim()} style={{ width:40, height:40, borderRadius:'50%', border:'none', background:loading||!input.trim()?'rgba(109,191,184,0.15)':`linear-gradient(135deg,${C.teal3},${C.teal2})`, color:'#fff', fontSize:18, cursor:loading||!input.trim()?'not-allowed':'pointer', flexShrink:0 }}>
            {loading?'⏳':'➤'}
          </button>
        </div>
      </div>
      <style>{`@keyframes bop{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1e3a4a;border-radius:4px}`}</style>
    </div>
  );
}
