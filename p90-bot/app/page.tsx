'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
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
    items:['ตารางประชุม Zoom วันนี้','ลิงก์เข้า Zoom','Meeting ID และ Passcode','ประชุมกี่โมง?','Facebook Live มีเมื่อไหร่?','โปรโมชั่นตอนนี้'] },
  { id:'links', label:'🔗 ลิงก์', color:'#ec4899',
    items:['ลิงก์ Facebook OlyLife','วิดีโอ VTR ภาษาอังกฤษ','วิดีโอ VTR ภาษาจีน','สไลด์นำเสนอ Canva','งานวิจัย PubMed','ติดต่อทีม OlyLife'] },
  { id:'fda', label:'⚖️ อย.', color:'#ef4444',
    items:['พูดเรื่องอะไรได้บ้าง?','คำที่ห้ามใช้','แนะนำลูกค้าถูกกฎหมาย'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/`(.*?)`/g,"<code style='background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-size:0.9em'>$1</code>")
    .replace(/\n/g,'<br/>');
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [msgs, setMsgs] = useState<Message[]>([
    { role:'assistant', content:'สวัสดีค่ะ! ฉันชื่อ **โอลี่** 🌿\n\nผู้ช่วยข้อมูล **OlyLife THZ Tera-P90+** พร้อมตอบทุกคำถามเกี่ยวกับสินค้า, เทคโนโลยี PEMF, ตารางประชุม และช่องทางต่างๆ\n\nเลือกหมวดคำถาม หรือพิมพ์ได้เลยนะคะ 😊' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState('product');
  const [fdaWarn, setFdaWarn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, loading]);

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
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      const reply = data.content?.map((b: {text?:string}) => b.text||'').join('') || 'ขออภัยค่ะ ไม่สามารถตอบได้ในขณะนี้';
      setMsgs(p => [...p, { role:'assistant', content:reply }]);
    } catch {
      setMsgs(p => [...p, { role:'assistant', content:'ขออภัยค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่ 🙏' }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  }, [msgs, input, loading]);

  const cat = MENU_CATS.find(c => c.id === activeCat)!;

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.bg0} 0%,#091622 60%,#050e18 100%)`, display:'flex', flexDirection:'column', maxWidth:540, margin:'0 auto', height:'100dvh' }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal3},${C.teal2},${C.teal})`, padding:'14px 16px 12px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'2px solid rgba(255,255,255,0.4)' }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>โอลี่ — OlyLife P90+ Bot</div>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:12, marginTop:1 }}>ข้อมูลสินค้า • PEMF Science • ตารางประชุม 🟢</div>
          </div>
          <button onClick={() => setMsgs([{ role:'assistant', content:'เริ่มบทสนทนาใหม่แล้วนะคะ 😊' }])} title="เริ่มใหม่"
            style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, color:'#fff', fontSize:20, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>↺</button>
        </div>
        <div style={{ marginTop:10, background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'6px 11px', fontSize:11, color:'rgba(255,255,255,0.85)', display:'flex', gap:6, alignItems:'center' }}>
          ⚖️ ไม่อ้างสรรพคุณรักษาโรค — ปฏิบัติตาม อย. ไทย
        </div>
      </div>

      {/* FDA Warning */}
      {fdaWarn && (
        <div style={{ background:'#2d1b00', borderLeft:'4px solid #f59e0b', padding:'8px 14px', fontSize:12, color:'#fcd34d', flexShrink:0, display:'flex', gap:6, alignItems:'center' }}>
          ⚠️ พบคำเกี่ยวกับโรค — บอทจะตอบตามข้อกำหนด อย. เท่านั้น
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 14px', display:'flex', flexDirection:'column', gap:12 }}>
        {msgs.map((m, i) => (
          <div key={i} className="msg-in" style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', alignItems:'flex-end', gap:8 }}>
            {m.role === 'assistant' && (
              <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg,${C.teal3},${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>🤖</div>
            )}
            <div
              style={{ maxWidth:'80%', padding:'11px 14px', borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', background:m.role==='user'?`linear-gradient(135deg,${C.teal3},${C.teal2})`:C.bg2, color:'#fff', fontSize:14, lineHeight:1.65, border:m.role==='assistant'?`1px solid ${C.border}`:'none', boxShadow:'0 2px 10px rgba(0,0,0,0.25)', wordBreak:'break-word' }}
              dangerouslySetInnerHTML={{ __html: fmt(m.content) }}
            />
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg,${C.teal3},${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🤖</div>
            <div style={{ padding:'12px 16px', background:C.bg2, borderRadius:'18px 18px 18px 4px', border:`1px solid ${C.border}`, display:'flex', gap:5, alignItems:'center' }}>
              {[0,1,2].map(j => (
                <div key={j} style={{ width:7, height:7, borderRadius:'50%', background:C.teal, animation:'bop 1.2s infinite', animationDelay:`${j*0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Menu */}
      <div style={{ flexShrink:0, borderTop:`1px solid ${C.border}`, background:C.bg1 }}>
        <div style={{ display:'flex', gap:0, overflowX:'auto', padding:'8px 10px 0', scrollbarWidth:'none' }}>
          {MENU_CATS.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ flexShrink:0, padding:'5px 11px', borderRadius:'20px 20px 0 0', border:`1px solid ${activeCat===c.id?c.color+'44':C.border}`, borderBottom:'none', background:activeCat===c.id?c.color+'18':'transparent', color:activeCat===c.id?c.color:C.muted, fontSize:11.5, cursor:'pointer', fontFamily:'inherit', fontWeight:activeCat===c.id?600:400, transition:'all .15s', whiteSpace:'nowrap', marginRight:4 }}>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ padding:'8px 10px', display:'flex', flexWrap:'wrap', gap:6, borderTop:`1px solid ${cat.color}22` }}>
          {cat.items.map((q, i) => (
            <button key={i} onClick={() => sendMsg(q)} disabled={loading} style={{ padding:'6px 12px', borderRadius:20, border:`1px solid ${cat.color}44`, background:loading?'rgba(255,255,255,0.03)':`${cat.color}12`, color:loading?C.dim:cat.color, fontSize:12, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', whiteSpace:'nowrap', transition:'all .15s', opacity:loading?.5:1 }}>
              {q}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, padding:'8px 12px 14px', alignItems:'flex-end' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();} }}
            placeholder="พิมพ์คำถาม..." rows={1} disabled={loading}
            style={{ flex:1, padding:'10px 14px', borderRadius:20, border:`1px solid ${C.border2}`, background:C.bg2, color:C.text, fontSize:14, outline:'none', resize:'none', fontFamily:'inherit', lineHeight:1.5, maxHeight:90, overflowY:'auto' }} />
          <button onClick={() => sendMsg()} disabled={loading||!input.trim()} style={{ width:42, height:42, borderRadius:'50%', border:'none', background:loading||!input.trim()?'rgba(109,191,184,0.15)':`linear-gradient(135deg,${C.teal3},${C.teal2})`, color:'#fff', fontSize:18, cursor:loading||!input.trim()?'not-allowed':'pointer', flexShrink:0, transition:'all .2s' }}>
            {loading?'⏳':'➤'}
          </button>
        </div>
      </div>
    </div>
  );
}
