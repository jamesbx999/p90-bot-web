import { useState, useEffect, useCallback } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const DAYS_TH = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
const DAYS_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const WEEKS   = ["สัปดาห์ที่ 1","สัปดาห์ที่ 2","สัปดาห์ที่ 3","สัปดาห์ที่ 4"];
const PROMO_TYPES = [
  { id:"flash",  label:"Flash Sale",    color:"#ef4444", icon:"⚡" },
  { id:"bundle", label:"Bundle Deal",   color:"#f59e0b", icon:"🎁" },
  { id:"loyalty",label:"Member Only",   color:"#8b5cf6", icon:"👑" },
  { id:"event",  label:"Event/Demo",    color:"#3b82f6", icon:"🎪" },
  { id:"free",   label:"ฟรี/แถม",       color:"#10b981", icon:"🎀" },
];
const MEETING_TYPES = [
  { id:"team",    label:"ประชุมทีม",      color:"#6366f1", icon:"👥" },
  { id:"training",label:"อบรม/Training", color:"#0ea5e9", icon:"📚" },
  { id:"online",  label:"Live Online",   color:"#ec4899", icon:"🔴" },
  { id:"1on1",    label:"นัดลูกค้า",     color:"#14b8a6", icon:"🤝" },
];

const TODAY = new Date();
const CUR_WEEK = Math.floor((TODAY.getDate() - 1) / 7); // 0-based
const CUR_DAY  = TODAY.getDay(); // 0=Sun

// blank week×day grid
const blankGrid = () =>
  Array.from({length:4}, () => Array.from({length:7}, () => []));

// ── STORAGE HELPERS ────────────────────────────────────────────────────────
const STORE_KEY = "p90-admin-data";

async function loadData() {
  try {
    const r = await window.storage.get(STORE_KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function saveData(data) {
  try { await window.storage.set(STORE_KEY, JSON.stringify(data)); } catch {}
}

// ── DEFAULT SEED DATA ──────────────────────────────────────────────────────
function seedData() {
  const promos = blankGrid();
  const meetings = blankGrid();

  promos[0][1].push({ id:"p1", type:"flash",  title:"ลด 10% P90+",       desc:"เฉพาะสมาชิกใหม่", startTime:"09:00", endTime:"12:00", badge:"HOT" });
  promos[0][3].push({ id:"p2", type:"bundle", title:"ซื้อ 1 แถม Massager", desc:"Stock จำกัด 5 ชุด", startTime:"10:00", endTime:"18:00", badge:"" });
  promos[1][5].push({ id:"p3", type:"free",   title:"ฟรีค่าส่งทั่วไทย",   desc:"สั่งขั้นต่ำ 3000฿", startTime:"00:00", endTime:"23:59", badge:"NEW" });
  promos[2][2].push({ id:"p4", type:"loyalty",title:"VIP Early Access",    desc:"เปิดตัว Accessory ใหม่", startTime:"14:00", endTime:"16:00", badge:"VIP" });

  meetings[0][1].push({ id:"m1", type:"team",     title:"ประชุมทีมขาย",         location:"ออนไลน์ Zoom", startTime:"09:00", endTime:"10:00", note:"เตรียมรายงานยอด" });
  meetings[0][4].push({ id:"m2", type:"training",  title:"อบรมวิธีสาธิต P90+",  location:"สนง.กรุงเทพ",  startTime:"13:00", endTime:"16:00", note:"" });
  meetings[1][6].push({ id:"m3", type:"online",    title:"Facebook Live Demo",   location:"FB: OlyLifeTH", startTime:"20:00", endTime:"21:30", note:"เตรียม P90+ 2 เครื่อง" });
  meetings[2][3].push({ id:"m4", type:"1on1",      title:"นัดลูกค้า VIP",        location:"Emporium BKK",  startTime:"15:00", endTime:"16:00", note:"คุณสมศรี 089-xxx" });

  return { promos, meetings, lastUpdated: new Date().toISOString() };
}

// ── MODAL COMPONENT ────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#0f1e2e",border:"1px solid rgba(109,191,184,0.25)",borderRadius:20,padding:28,width:"min(96vw,500px)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
          <span style={{ color:"#6dbfb8",fontWeight:700,fontSize:17 }}>{title}</span>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,color:"#aaa",fontSize:18,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── FORM FIELD HELPER ──────────────────────────────────────────────────────
const inputStyle = { width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(109,191,184,0.25)",background:"rgba(255,255,255,0.05)",color:"#e8f4f3",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box" };
const labelStyle = { color:"#9ab8c4",fontSize:13,marginBottom:5,display:"block" };

function Field({ label, children }) {
  return <div style={{ marginBottom:16 }}><label style={labelStyle}>{label}</label>{children}</div>;
}

// ── BADGE ──────────────────────────────────────────────────────────────────
function Badge({ text, color }) {
  if (!text) return null;
  return <span style={{ fontSize:10,fontWeight:700,letterSpacing:1,background:color||"#6dbfb8",color:"#000",padding:"2px 7px",borderRadius:20 }}>{text}</span>;
}

// ── CARD (promo or meeting) ────────────────────────────────────────────────
function ItemCard({ item, types, onEdit, onDelete }) {
  const t = types.find(x => x.id === item.type) || types[0];
  return (
    <div style={{ background:"rgba(255,255,255,0.04)",border:`1px solid ${t.color}33`,borderLeft:`3px solid ${t.color}`,borderRadius:10,padding:"10px 12px",marginBottom:8,cursor:"pointer",transition:"all .15s" }}
      onClick={() => onEdit(item)}>
      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
        <span style={{ fontSize:15 }}>{t.icon}</span>
        <span style={{ color:"#e8f4f3",fontWeight:600,fontSize:13,flex:1 }}>{item.title}</span>
        {"badge" in item && <Badge text={item.badge} color={t.color} />}
      </div>
      <div style={{ color:"#7a9fb0",fontSize:12 }}>{item.startTime}–{item.endTime}</div>
      {(item.desc||item.note) && <div style={{ color:"#5a7f90",fontSize:12,marginTop:3 }}>{item.desc||item.note}</div>}
      {item.location && <div style={{ color:"#5a7f90",fontSize:12 }}>📍 {item.location}</div>}
      <button onClick={e=>{e.stopPropagation();onDelete(item.id)}} style={{ marginTop:6,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:6,color:"#ef4444",fontSize:11,padding:"2px 8px",cursor:"pointer" }}>ลบ</button>
    </div>
  );
}

// ── PROMO FORM ─────────────────────────────────────────────────────────────
function PromoForm({ init, onSave, onClose }) {
  const [f,setF] = useState(init || { type:"flash",title:"",desc:"",startTime:"09:00",endTime:"18:00",badge:"" });
  const up = k => v => setF(p=>({...p,[k]:v}));
  return (
    <div>
      <Field label="ประเภทโปรโมชั่น">
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {PROMO_TYPES.map(t=>(
            <button key={t.id} onClick={()=>up("type")(t.id)} style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${t.color}`,background:f.type===t.id?t.color+"33":"transparent",color:f.type===t.id?t.color:"#aaa",fontSize:12,cursor:"pointer",transition:"all .15s" }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </Field>
      <Field label="ชื่อโปรโมชั่น *">
        <input style={inputStyle} value={f.title} onChange={e=>up("title")(e.target.value)} placeholder="เช่น ลด 15% เฉพาะวันนี้" />
      </Field>
      <Field label="รายละเอียด">
        <textarea style={{...inputStyle,height:72,resize:"vertical"}} value={f.desc} onChange={e=>up("desc")(e.target.value)} placeholder="เงื่อนไข, stock, ข้อจำกัด..." />
      </Field>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        <Field label="เวลาเริ่ม"><input type="time" style={inputStyle} value={f.startTime} onChange={e=>up("startTime")(e.target.value)} /></Field>
        <Field label="เวลาสิ้นสุด"><input type="time" style={inputStyle} value={f.endTime} onChange={e=>up("endTime")(e.target.value)} /></Field>
      </div>
      <Field label="Badge (เช่น HOT, NEW, VIP)">
        <input style={inputStyle} value={f.badge} onChange={e=>up("badge")(e.target.value)} maxLength={6} placeholder="เว้นว่างถ้าไม่ต้องการ" />
      </Field>
      <button disabled={!f.title.trim()} onClick={()=>onSave(f)} style={{ width:"100%",padding:"12px",borderRadius:12,border:"none",background:f.title.trim()?"linear-gradient(135deg,#0d7377,#14a085)":"rgba(255,255,255,0.08)",color:f.title.trim()?"#fff":"#555",fontFamily:"inherit",fontSize:15,fontWeight:600,cursor:f.title.trim()?"pointer":"not-allowed",transition:"all .2s" }}>
        💾 บันทึกโปรโมชั่น
      </button>
    </div>
  );
}

// ── MEETING FORM ───────────────────────────────────────────────────────────
function MeetingForm({ init, onSave, onClose }) {
  const [f,setF] = useState(init || { type:"team",title:"",location:"",startTime:"09:00",endTime:"10:00",note:"" });
  const up = k => v => setF(p=>({...p,[k]:v}));
  return (
    <div>
      <Field label="ประเภทการประชุม">
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {MEETING_TYPES.map(t=>(
            <button key={t.id} onClick={()=>up("type")(t.id)} style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${t.color}`,background:f.type===t.id?t.color+"33":"transparent",color:f.type===t.id?t.color:"#aaa",fontSize:12,cursor:"pointer",transition:"all .15s" }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </Field>
      <Field label="ชื่อการประชุม *">
        <input style={inputStyle} value={f.title} onChange={e=>up("title")(e.target.value)} placeholder="เช่น ประชุมทีมขายประจำสัปดาห์" />
      </Field>
      <Field label="สถานที่ / ลิงก์">
        <input style={inputStyle} value={f.location} onChange={e=>up("location")(e.target.value)} placeholder="Zoom link, สถานที่, หรือ FB Page" />
      </Field>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        <Field label="เวลาเริ่ม"><input type="time" style={inputStyle} value={f.startTime} onChange={e=>up("startTime")(e.target.value)} /></Field>
        <Field label="เวลาสิ้นสุด"><input type="time" style={inputStyle} value={f.endTime} onChange={e=>up("endTime")(e.target.value)} /></Field>
      </div>
      <Field label="หมายเหตุ">
        <textarea style={{...inputStyle,height:64,resize:"vertical"}} value={f.note} onChange={e=>up("note")(e.target.value)} placeholder="เตรียมอะไร? ใครเข้าร่วม?" />
      </Field>
      <button disabled={!f.title.trim()} onClick={()=>onSave(f)} style={{ width:"100%",padding:"12px",borderRadius:12,border:"none",background:f.title.trim()?"linear-gradient(135deg,#3b82f6,#6366f1)":"rgba(255,255,255,0.08)",color:f.title.trim()?"#fff":"#555",fontFamily:"inherit",fontSize:15,fontWeight:600,cursor:f.title.trim()?"pointer":"not-allowed",transition:"all .2s" }}>
        💾 บันทึกการประชุม
      </button>
    </div>
  );
}

// ── EXPORT PROMPT MODAL ────────────────────────────────────────────────────
function ExportPrompt({ promos, meetings, onClose }) {
  const lines = [];
  WEEKS.forEach((wLabel,wi) => {
    const hasP = promos[wi].some(d=>d.length>0);
    const hasM = meetings[wi].some(d=>d.length>0);
    if (!hasP && !hasM) return;
    lines.push(`\n=== ${wLabel} ===`);
    DAYS_TH.forEach((day,di) => {
      const ps = promos[wi][di];
      const ms = meetings[wi][di];
      if (!ps.length && !ms.length) return;
      lines.push(`\n【${day}】`);
      ps.forEach(p => {
        const t = PROMO_TYPES.find(x=>x.id===p.type);
        lines.push(`  ${t?.icon||"🎯"} [โปรโมชั่น] ${p.title} (${p.startTime}–${p.endTime})${p.desc?` — ${p.desc}`:""}`);
      });
      ms.forEach(m => {
        const t = MEETING_TYPES.find(x=>x.id===m.type);
        lines.push(`  ${t?.icon||"📅"} [ประชุม] ${m.title} (${m.startTime}–${m.endTime})${m.location?` @ ${m.location}`:""}${m.note?` — ${m.note}`:""}`);
      });
    });
  });
  const text = lines.length>1 ? lines.join("\n") : "(ยังไม่มีข้อมูล)";
  return (
    <Modal title="📋 Export ข้อมูลสำหรับบอท" onClose={onClose}>
      <p style={{ color:"#7a9fb0",fontSize:13,marginBottom:12 }}>คัดลอก text ด้านล่างไปวางใน System Prompt ของบอท P90+ เพื่ออัปเดตโปรโมชั่น/ตารางประชุม</p>
      <textarea readOnly value={text} style={{...inputStyle,height:260,fontSize:12,lineHeight:1.6,fontFamily:"monospace"}} />
      <button onClick={()=>{navigator.clipboard?.writeText(text);}} style={{ marginTop:12,width:"100%",padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#14a085,#0d7377)",color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer" }}>
        📋 คัดลอกทั้งหมด
      </button>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]       = useState("promos"); // "promos" | "meetings" | "overview"
  const [week, setWeek]     = useState(CUR_WEEK);
  const [promos, setPromos]     = useState(blankGrid());
  const [meetings, setMeetings] = useState(blankGrid());
  const [modal, setModal]   = useState(null); // { kind, wi, di, item? }
  const [showExport, setShowExport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load
  useEffect(()=>{
    (async()=>{
      const d = await loadData();
      if (d) { setPromos(d.promos); setMeetings(d.meetings); }
      else { const s=seedData(); setPromos(s.promos); setMeetings(s.meetings); }
      setLoaded(true);
    })();
  },[]);

  // Auto-save
  const persist = useCallback(async(p,m)=>{
    setSaving(true);
    await saveData({ promos:p, meetings:m, lastUpdated:new Date().toISOString() });
    setTimeout(()=>setSaving(false),600);
  },[]);

  // ── PROMO CRUD ──
  const addPromo = (wi,di,data) => {
    const id = "p"+Date.now();
    const np = promos.map((w,wi2)=>wi2!==wi?w:w.map((d,di2)=>di2!==di?d:[...d,{...data,id}]));
    setPromos(np); persist(np,meetings); setModal(null);
  };
  const editPromo = (wi,di,data) => {
    const np = promos.map((w,wi2)=>wi2!==wi?w:w.map((d,di2)=>di2!==di?d:d.map(x=>x.id===data.id?data:x)));
    setPromos(np); persist(np,meetings); setModal(null);
  };
  const delPromo = (wi,di,id) => {
    const np = promos.map((w,wi2)=>wi2!==wi?w:w.map((d,di2)=>di2!==di?d:d.filter(x=>x.id!==id)));
    setPromos(np); persist(np,meetings);
  };

  // ── MEETING CRUD ──
  const addMeeting = (wi,di,data) => {
    const id = "m"+Date.now();
    const nm = meetings.map((w,wi2)=>wi2!==wi?w:w.map((d,di2)=>di2!==di?d:[...d,{...data,id}]));
    setMeetings(nm); persist(promos,nm); setModal(null);
  };
  const editMeeting = (wi,di,data) => {
    const nm = meetings.map((w,wi2)=>wi2!==wi?w:w.map((d,di2)=>di2!==di?d:d.map(x=>x.id===data.id?data:x)));
    setMeetings(nm); persist(promos,nm); setModal(null);
  };
  const delMeeting = (wi,di,id) => {
    const nm = meetings.map((w,wi2)=>wi2!==wi?w:w.map((d,di2)=>di2!==di?d:d.filter(x=>x.id!==id)));
    setMeetings(nm); persist(promos,nm);
  };

  // totals
  const totalPromos   = promos.flat(2).length;
  const totalMeetings = meetings.flat(2).length;
  const weekPromos    = promos[week].flat().length;
  const weekMeetings  = meetings[week].flat().length;

  if (!loaded) return (
    <div style={{ minHeight:"100vh",background:"#0a1628",display:"flex",alignItems:"center",justifyContent:"center",color:"#6dbfb8",fontFamily:"Sarabun,sans-serif",fontSize:18 }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      กำลังโหลดข้อมูล...
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"linear-gradient(135deg,#07111f 0%,#0a1a2e 50%,#061520 100%)",fontFamily:"Sarabun,'Noto Sans Thai',sans-serif",color:"#e8f4f3" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── TOP BAR ── */}
      <div style={{ background:"rgba(13,115,119,0.12)",borderBottom:"1px solid rgba(109,191,184,0.15)",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0d7377,#14a085)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🛠️</div>
          <div>
            <div style={{ fontWeight:700,fontSize:16,color:"#6dbfb8" }}>OlyLife P90+ Admin</div>
            <div style={{ fontSize:12,color:"#4a7a8a" }}>ระบบจัดการโปรโมชั่น & ตารางประชุม</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          {saving && <span style={{ fontSize:12,color:"#14a085",animation:"pulse 1s infinite" }}>💾 กำลังบันทึก...</span>}
          <button onClick={()=>setShowExport(true)} style={{ padding:"8px 16px",borderRadius:10,border:"1px solid rgba(109,191,184,0.35)",background:"rgba(109,191,184,0.08)",color:"#6dbfb8",fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight:600 }}>
            📋 Export สำหรับบอท
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,padding:"16px 20px 0" }}>
        {[
          { label:"โปรโมชั่นทั้งหมด", val:totalPromos,   icon:"⚡", color:"#ef4444" },
          { label:"ประชุมทั้งหมด",    val:totalMeetings, icon:"📅", color:"#6366f1" },
          { label:"โปรสัปดาห์นี้",   val:weekPromos,    icon:"🎯", color:"#f59e0b" },
          { label:"ประชุมสัปดาห์นี้", val:weekMeetings, icon:"🤝", color:"#14b8a6" },
        ].map((s,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,0.04)",border:`1px solid ${s.color}22`,borderTop:`3px solid ${s.color}`,borderRadius:14,padding:"14px 16px" }}>
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div style={{ fontSize:26,fontWeight:700,color:s.color,lineHeight:1.1,marginTop:4 }}>{s.val}</div>
            <div style={{ fontSize:12,color:"#5a8090",marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── TAB NAV ── */}
      <div style={{ display:"flex",gap:4,padding:"16px 20px 0",borderBottom:"1px solid rgba(109,191,184,0.1)",marginBottom:0 }}>
        {[["promos","⚡ โปรโมชั่น"],["meetings","📅 ตารางประชุม"],["overview","🗓️ ภาพรวม"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:"9px 18px",borderRadius:"10px 10px 0 0",border:"1px solid rgba(109,191,184,0.15)",borderBottom:"none",background:tab===id?"rgba(13,115,119,0.2)":"transparent",color:tab===id?"#6dbfb8":"#5a8090",fontFamily:"inherit",fontSize:14,cursor:"pointer",fontWeight:tab===id?600:400,transition:"all .15s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── WEEK SELECTOR ── */}
      {tab!=="overview" && (
        <div style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 20px",background:"rgba(0,0,0,0.2)" }}>
          <span style={{ color:"#4a7a8a",fontSize:13 }}>เลือกสัปดาห์:</span>
          {WEEKS.map((w,i)=>(
            <button key={i} onClick={()=>setWeek(i)} style={{ padding:"6px 14px",borderRadius:20,border:`1px solid ${week===i?"#6dbfb8":"rgba(109,191,184,0.2)"}`,background:week===i?"rgba(109,191,184,0.15)":"transparent",color:week===i?"#6dbfb8":"#5a8090",fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",fontWeight:week===i?600:400,position:"relative" }}>
              {w} {i===CUR_WEEK && <span style={{ position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#10b981",border:"1.5px solid #0a1628" }}/>}
            </button>
          ))}
        </div>
      )}

      {/* ══ PROMOTIONS TAB ══ */}
      {tab==="promos" && (
        <div style={{ padding:"0 20px 24px",overflowX:"auto" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,minmax(150px,1fr))",gap:12,minWidth:1060,marginTop:16 }}>
            {DAYS_TH.map((day,di)=>{
              const items = promos[week][di];
              const isToday = week===CUR_WEEK && di===CUR_DAY;
              return (
                <div key={di} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${isToday?"rgba(109,191,184,0.4)":"rgba(255,255,255,0.06)"}`,borderTop:`3px solid ${isToday?"#6dbfb8":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:14,minHeight:180 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:700,color:isToday?"#6dbfb8":"#e8f4f3",fontSize:14 }}>{DAYS_EN[di]}</div>
                      <div style={{ color:"#4a7a8a",fontSize:11 }}>{day}</div>
                    </div>
                    {isToday && <span style={{ fontSize:10,background:"#6dbfb8",color:"#000",padding:"2px 7px",borderRadius:20,fontWeight:700 }}>TODAY</span>}
                  </div>
                  {items.map(item=>(
                    <ItemCard key={item.id} item={item} types={PROMO_TYPES}
                      onEdit={it=>setModal({kind:"editPromo",wi:week,di,item:it})}
                      onDelete={id=>delPromo(week,di,id)} />
                  ))}
                  <button onClick={()=>setModal({kind:"addPromo",wi:week,di})} style={{ width:"100%",padding:"7px",borderRadius:9,border:"1px dashed rgba(109,191,184,0.3)",background:"transparent",color:"#4a7a8a",fontSize:12,cursor:"pointer",marginTop:items.length?6:0,transition:"all .15s",fontFamily:"inherit" }}>
                    + เพิ่มโปรโมชั่น
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ MEETINGS TAB ══ */}
      {tab==="meetings" && (
        <div style={{ padding:"0 20px 24px",overflowX:"auto" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,minmax(150px,1fr))",gap:12,minWidth:1060,marginTop:16 }}>
            {DAYS_TH.map((day,di)=>{
              const items = meetings[week][di];
              const isToday = week===CUR_WEEK && di===CUR_DAY;
              return (
                <div key={di} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${isToday?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.06)"}`,borderTop:`3px solid ${isToday?"#6366f1":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:14,minHeight:180 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:700,color:isToday?"#a5b4fc":"#e8f4f3",fontSize:14 }}>{DAYS_EN[di]}</div>
                      <div style={{ color:"#4a7a8a",fontSize:11 }}>{day}</div>
                    </div>
                    {isToday && <span style={{ fontSize:10,background:"#6366f1",color:"#fff",padding:"2px 7px",borderRadius:20,fontWeight:700 }}>TODAY</span>}
                  </div>
                  {items.map(item=>(
                    <ItemCard key={item.id} item={item} types={MEETING_TYPES}
                      onEdit={it=>setModal({kind:"editMeeting",wi:week,di,item:it})}
                      onDelete={id=>delMeeting(week,di,id)} />
                  ))}
                  <button onClick={()=>setModal({kind:"addMeeting",wi:week,di})} style={{ width:"100%",padding:"7px",borderRadius:9,border:"1px dashed rgba(99,102,241,0.3)",background:"transparent",color:"#4a7a8a",fontSize:12,cursor:"pointer",marginTop:items.length?6:0,transition:"all .15s",fontFamily:"inherit" }}>
                    + เพิ่มการประชุม
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ OVERVIEW TAB ══ */}
      {tab==="overview" && (
        <div style={{ padding:"16px 20px 24px" }}>
          {WEEKS.map((wLabel,wi)=>{
            const hasAny = promos[wi].some(d=>d.length>0)||meetings[wi].some(d=>d.length>0);
            return (
              <div key={wi} style={{ marginBottom:20 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                  <div style={{ flex:1,height:1,background:"rgba(109,191,184,0.15)" }}/>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ color:wi===CUR_WEEK?"#6dbfb8":"#4a7a8a",fontWeight:700,fontSize:15 }}>{wLabel}</span>
                    {wi===CUR_WEEK && <span style={{ fontSize:10,background:"#10b981",color:"#000",padding:"2px 8px",borderRadius:20,fontWeight:700 }}>สัปดาห์ปัจจุบัน</span>}
                  </div>
                  <div style={{ flex:1,height:1,background:"rgba(109,191,184,0.15)" }}/>
                </div>
                {!hasAny && <div style={{ color:"#3a5a6a",fontSize:13,textAlign:"center",padding:"12px 0" }}>ยังไม่มีข้อมูลในสัปดาห์นี้</div>}
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10 }}>
                  {DAYS_TH.map((day,di)=>{
                    const ps=promos[wi][di], ms=meetings[wi][di];
                    if (!ps.length && !ms.length) return null;
                    const isToday = wi===CUR_WEEK && di===CUR_DAY;
                    return (
                      <div key={di} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${isToday?"rgba(109,191,184,0.3)":"rgba(255,255,255,0.06)"}`,borderRadius:12,padding:14 }}>
                        <div style={{ color:isToday?"#6dbfb8":"#e8f4f3",fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:8 }}>
                          {day} ({DAYS_EN[di]}) {isToday && <span style={{ fontSize:10,background:"#6dbfb8",color:"#000",padding:"2px 7px",borderRadius:20 }}>วันนี้</span>}
                        </div>
                        {ps.map(p=>{const t=PROMO_TYPES.find(x=>x.id===p.type);return(
                          <div key={p.id} style={{ display:"flex",gap:8,alignItems:"flex-start",marginBottom:7 }}>
                            <span style={{ fontSize:16 }}>{t?.icon}</span>
                            <div>
                              <div style={{ color:"#e8f4f3",fontSize:13,fontWeight:600 }}>{p.title}</div>
                              <div style={{ color:"#5a8090",fontSize:11 }}>{p.startTime}–{p.endTime} {p.desc&&`• ${p.desc}`}</div>
                            </div>
                          </div>
                        );})}
                        {ms.map(m=>{const t=MEETING_TYPES.find(x=>x.id===m.type);return(
                          <div key={m.id} style={{ display:"flex",gap:8,alignItems:"flex-start",marginBottom:7 }}>
                            <span style={{ fontSize:16 }}>{t?.icon}</span>
                            <div>
                              <div style={{ color:"#a5b4fc",fontSize:13,fontWeight:600 }}>{m.title}</div>
                              <div style={{ color:"#5a8090",fontSize:11 }}>{m.startTime}–{m.endTime} {m.location&&`• ${m.location}`}</div>
                            </div>
                          </div>
                        );})}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODALS ── */}
      {modal?.kind==="addPromo" && (
        <Modal title={`➕ เพิ่มโปรโมชั่น — ${DAYS_TH[modal.di]} ${WEEKS[modal.wi]}`} onClose={()=>setModal(null)}>
          <PromoForm onSave={d=>addPromo(modal.wi,modal.di,d)} onClose={()=>setModal(null)} />
        </Modal>
      )}
      {modal?.kind==="editPromo" && (
        <Modal title={`✏️ แก้ไขโปรโมชั่น`} onClose={()=>setModal(null)}>
          <PromoForm init={modal.item} onSave={d=>editPromo(modal.wi,modal.di,d)} onClose={()=>setModal(null)} />
        </Modal>
      )}
      {modal?.kind==="addMeeting" && (
        <Modal title={`➕ เพิ่มการประชุม — ${DAYS_TH[modal.di]} ${WEEKS[modal.wi]}`} onClose={()=>setModal(null)}>
          <MeetingForm onSave={d=>addMeeting(modal.wi,modal.di,d)} onClose={()=>setModal(null)} />
        </Modal>
      )}
      {modal?.kind==="editMeeting" && (
        <Modal title={`✏️ แก้ไขการประชุม`} onClose={()=>setModal(null)}>
          <MeetingForm init={modal.item} onSave={d=>editMeeting(modal.wi,modal.di,d)} onClose={()=>setModal(null)} />
        </Modal>
      )}
      {showExport && <ExportPrompt promos={promos} meetings={meetings} onClose={()=>setShowExport(false)} />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e3a4a;border-radius:4px}
      `}</style>
    </div>
  );
}
