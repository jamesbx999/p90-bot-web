import { useState, useRef, useEffect, useCallback } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap";

// ─── BASE KNOWLEDGE (immutable seed) ────────────────────────────────────────
const BASE_KNOWLEDGE = `=== OlyLife THZ Tera-P90+ ข้อมูลสินค้า ===
ชื่อ: OlyLife THZ Tera-P90+ | รหัส: OLY-HCA002A | ราคา: $1,500 USD
เว็บไซต์: https://www.olylifeint.com/
ประกอบด้วย 3 อุปกรณ์:
1. Main Device – PEMF & Terahertz: กระตุ้นพลังงานเซลล์, ส่งเสริมการไหลเวียน, ปรับระดับ 20 ระดับ, รีโมตอินฟาเรด, รองรับไซส์รองเท้า 47
2. Frost Age Beauty Device – RF & EMS: ส่งเสริมความยืดหยุ่นผิว, กระชับผิว, ให้ความรู้สึกผ่อนคลาย
3. Revitaluxe Massager – 3-in-1 Magnetic Fusion + EMS & TENS + Red Light: ผ่อนคลายกล้ามเนื้อ, ส่งเสริมสุขภาพหนังศีรษะและเส้นผม
จุดเด่น: เทคโนโลยี PEMF Integrated Technology หนึ่งเดียวในโลก

=== ความแตกต่าง P90 vs P90+ ===
P90 (OLY-HCA002): อุปกรณ์หลักเท่านั้น PEMF+Terahertz ราคา $1,000
P90+ (OLY-HCA002A): ชุดครบ 3 อุปกรณ์ หลัก+ความงาม+Massager ราคา $1,500

=== ข้อมูลบริษัท OlyLife ===
ก่อตั้งปี 2022 สำนักงานไทย: Unit 2004 Level 2, The Street 139 ถ.รัชดาฯ ดินแดง กรุงเทพ
Facebook: https://www.facebook.com/OlyLifeGlobalByVibeVerse/
สาขา: HK, มาเลเซีย, สิงคโปร์, อินโดนีเซีย, UK

=== วิดีโอแนะนำสินค้า ===
YouTube VTR: https://youtu.be/UIv5jff0POo?si=LZ1zBTxhJ8M4DZXT
VTR ภาษาอังกฤษ (01-05-2026): https://drive.google.com/file/d/1b529g1CvlsPvPkwC7WcORDcH6X6GQIBp/view?usp=drive_link
VTR ภาษาจีน (02-05-2026): https://drive.google.com/file/d/1E0BkHshcY4T7kCxIEDy48JWZ0bIg5Iro/view?usp=sharing

=== ความรู้ PEMF (Pulsed Electromagnetic Field) ===
PEMF คือ: การใช้คลื่นสนามแม่เหล็กไฟฟ้าความถี่ต่ำ กระตุ้นการทำงานของเซลล์จากภายใน
หลักการ: สุขภาพเริ่มต้นจากระดับเซลล์ — ร่างกายมีเซลล์หลายสิบล้านล้านเซลล์ ทุกเซลล์ต้องการพลังงาน
ไมโตคอนเดรีย (Mitochondria): ผลิตพลังงานในรูป ATP — หัวใจของพลังงานเซลล์
PEMF ช่วยสนับสนุน:
  • การทำงานของไมโตคอนเดรีย
  • เพิ่มประสิทธิภาพการสร้าง ATP
  • เซลล์รับออกซิเจนและสารอาหารได้ดีขึ้น
  • กระบวนการฟื้นฟูตามธรรมชาติของร่างกาย
ผลที่หลายคนสังเกต: รู้สึกมีแรงมากขึ้น, ฟื้นตัวไว, อ่อนล้าน้อยลง, ระบบร่างกายสมดุลขึ้น
⚠️ PEMF ไม่ใช่การรักษา แต่คือ "การสนับสนุนให้ร่างกายทำงานได้ดีขึ้นเอง"
งานวิจัย PEMF: ค้นหาได้ที่ PubMed: https://pubmed.ncbi.nlm.nih.gov/
พื้นฐานสุขภาพยังสำคัญ: การนอน + อาหาร + การเคลื่อนไหว + การจัดการความเครียด

=== ตารางประชุม/Live ประจำสัปดาห์ ===
รายการ "คนรักสุขภาพ"
วัน: จันทร์–ศุกร์ เวลา 07:00–08:30 น.
แพลตฟอร์ม: Zoom
Meeting ID: 568 239 4879
Passcode: 6666
ลิงก์เข้า: https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1

=== สไลด์/สื่อการตลาด ===
Canva Presentation: https://www.canva.com/design/DAGYN12jV-k/LJBP_oYk_sN-rNFvg3WfDg/edit`;

// ─── FDA GUARD ───────────────────────────────────────────────────────────────
const FDA_RULE = `
=== กฎเหล็ก อย. ไทย — ห้ามอ้างสรรพคุณดังนี้ ===
ห้ามพูด: รักษา / บำบัด / แก้โรค / ป้องกันโรค / หายขาด / ลดน้ำตาล / ลดความดัน / รักษามะเร็ง / ทดแทนยา / 100% รับประกัน
ให้ใช้แทน: "ช่วยส่งเสริม..." / "ให้ความรู้สึก..." / "สนับสนุนการทำงานของ..." / "ช่วยผ่อนคลาย..."
หากถูกถามเรื่องโรค ให้แนะนำ: "สำหรับปัญหาสุขภาพเฉพาะ แนะนำปรึกษาแพทย์ผู้เชี่ยวชาญโดยตรงนะคะ P90+ เป็นอุปกรณ์ส่งเสริมสุขภาวะ ไม่ใช่อุปกรณ์ทางการแพทย์"`;

// ─── QUICK MENU CATEGORIES ───────────────────────────────────────────────────
const MENU_CATS = [
  {
    id: "product", label: "🛍️ สินค้า", color: "#14a085",
    items: [
      "P90+ คืออะไร?", "P90+ ต่างจาก P90 ธรรมดาอย่างไร?",
      "มีอะไรในชุด P90+ บ้าง?", "ราคา P90+ เท่าไหร่?",
      "ใครเหมาะใช้ P90+?", "วิธีใช้งาน P90+ เบื้องต้น",
    ],
  },
  {
    id: "pemf", label: "⚡ PEMF Science", color: "#6366f1",
    items: [
      "PEMF คืออะไร?", "ไมโตคอนเดรียและ ATP คืออะไร?",
      "PEMF ช่วยร่างกายอย่างไร?", "มีงานวิจัยรองรับไหม?",
      "Terahertz Technology คืออะไร?", "PEMF ปลอดภัยไหม?",
    ],
  },
  {
    id: "schedule", label: "📅 ตารางประชุม", color: "#f59e0b",
    items: [
      "ตารางประชุม Zoom วันนี้", "ลิงก์เข้า Zoom",
      "Meeting ID และ Passcode", "ประชุมทุกวันไหม?",
      "Facebook Live มีเมื่อไหร่?", "ดูวิดีโอแนะนำสินค้าได้ที่ไหน?",
    ],
  },
  {
    id: "links", label: "🔗 ลิงก์ทรัพยากร", color: "#ec4899",
    items: [
      "ลิงก์ Facebook OlyLife", "วิดีโอ VTR ภาษาอังกฤษ",
      "วิดีโอ VTR ภาษาจีน", "สไลด์นำเสนอ Canva",
      "งานวิจัย PubMed PEMF", "ติดต่อทีม OlyLife ไทย",
    ],
  },
  {
    id: "fda", label: "⚖️ อย. & กฎหมาย", color: "#ef4444",
    items: [
      "พูดเรื่องอะไรได้บ้าง?", "คำที่ห้ามใช้มีอะไรบ้าง?",
      "จะแนะนำลูกค้าอย่างถูกต้องได้อย่างไร?",
    ],
  },
];

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const SK_KB  = "p90-kb-entries";
const SK_MSG = "p90-chat-history";

async function storeGet(k)    { try { const r=await window.storage.get(k); return r?JSON.parse(r.value):null; } catch { return null; } }
async function storeSet(k,v)  { try { await window.storage.set(k,JSON.stringify(v)); } catch {} }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2,9); }
function fmt(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
    .replace(/\*(.*?)\*/g,"<em>$1</em>")
    .replace(/`(.*?)`/g,"<code style='background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:13px'>$1</code>")
    .replace(/\n/g,"<br/>");
}

const FDA_KWS = ["รักษา","หาย","บำบัด","กำจัดโรค","ป้องกันโรค","cure","treat","heal","เบาหวาน","มะเร็ง","ความดัน","ไขมัน","ไต","หัวใจล้มเหลว"];

// ─── STYLE TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg0: "#070e1a", bg1: "#0d1c2e", bg2: "#122336",
  teal: "#6dbfb8", teal2: "#14a085", teal3: "#0d7377",
  text: "#ddeef0", muted: "#5a8090", dim: "#3a5a6a",
  border: "rgba(109,191,184,0.15)", border2: "rgba(109,191,184,0.3)",
};
const ins = { width:"100%", padding:"9px 13px", borderRadius:10, border:`1px solid ${C.border2}`, background:"rgba(255,255,255,0.05)", color:C.text, fontSize:13.5, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, background:C.bg1 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onChange(t.id)} style={{
          flex:1, padding:"13px 4px", border:"none", borderBottom:`2px solid ${active===t.id?C.teal:"transparent"}`,
          background:"transparent", color:active===t.id?C.teal:C.muted, fontSize:13, fontFamily:"inherit",
          cursor:"pointer", fontWeight:active===t.id?600:400, transition:"all .15s",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function KBEntry({ entry, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.teal3}`, borderRadius:10, marginBottom:8, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", padding:"10px 14px", cursor:"pointer", gap:8 }} onClick={()=>setOpen(o=>!o)}>
        <span style={{ fontSize:12, flex:1, color:C.text, fontWeight:500 }}>{entry.title}</span>
        <span style={{ fontSize:10, color:C.muted }}>{new Date(entry.ts).toLocaleDateString("th-TH")}</span>
        <span style={{ color:C.muted, fontSize:14 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 14px 12px" }}>
          <pre style={{ color:C.muted, fontSize:12, whiteSpace:"pre-wrap", wordBreak:"break-word", margin:"0 0 10px", fontFamily:"inherit", lineHeight:1.6 }}>{entry.content}</pre>
          <button onClick={()=>onDelete(entry.id)} style={{ padding:"4px 12px", borderRadius:6, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)", color:"#ef4444", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>🗑 ลบ</button>
        </div>
      )}
    </div>
  );
}

// ─── KNOWLEDGE BASE TAB ───────────────────────────────────────────────────────
function KBTab({ entries, onAdd, onDelete }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) return;
    onAdd({ id:uid(), title:title.trim(), content:content.trim(), ts:Date.now() });
    setTitle(""); setContent(""); setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  return (
    <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12, height:"100%", overflowY:"auto" }}>
      <div style={{ background:"rgba(109,191,184,0.06)", border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
        <div style={{ color:C.teal, fontWeight:600, fontSize:14, marginBottom:10 }}>➕ เพิ่มความรู้ใหม่</div>
        <div style={{ marginBottom:8 }}>
          <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>หัวข้อ *</div>
          <input style={ins} value={title} onChange={e=>setTitle(e.target.value)} placeholder="เช่น โปรโมชั่นเดือนมิถุนายน, ขั้นตอนการสั่งซื้อ" />
        </div>
        <div style={{ marginBottom:10 }}>
          <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>เนื้อหา / ข้อมูล *</div>
          <textarea style={{...ins, height:110, resize:"vertical", lineHeight:1.6}} value={content} onChange={e=>setContent(e.target.value)} placeholder={`พิมพ์ข้อมูลที่ต้องการให้บอทรู้\nเช่น ราคาโปรโมชั่น, เงื่อนไข, รายละเอียดสินค้าใหม่...`} />
        </div>
        <button onClick={handleAdd} disabled={!title.trim()||!content.trim()} style={{
          width:"100%", padding:"10px", borderRadius:10, border:"none",
          background:title.trim()&&content.trim()?`linear-gradient(135deg,${C.teal3},${C.teal2})`:"rgba(255,255,255,0.06)",
          color:title.trim()&&content.trim()?"#fff":"#444", fontFamily:"inherit", fontSize:14,
          fontWeight:600, cursor:title.trim()&&content.trim()?"pointer":"not-allowed", transition:"all .2s",
        }}>
          {saved?"✅ บันทึกแล้ว!":"💾 เพิ่มในฐานความรู้บอท"}
        </button>
      </div>

      <div>
        <div style={{ color:C.muted, fontSize:12, marginBottom:8, display:"flex", justifyContent:"space-between" }}>
          <span>ฐานความรู้ที่เพิ่ม ({entries.length} รายการ)</span>
          {entries.length>0 && <span style={{ color:C.teal, fontSize:11 }}>คลิกเพื่อดู/ลบ</span>}
        </div>
        {entries.length===0 && (
          <div style={{ color:C.dim, fontSize:13, textAlign:"center", padding:"20px 0" }}>ยังไม่มีความรู้เพิ่มเติม</div>
        )}
        {entries.map(e=><KBEntry key={e.id} entry={e} onDelete={onDelete}/>)}
      </div>

      <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:10, padding:12 }}>
        <div style={{ color:C.muted, fontSize:11, lineHeight:1.7 }}>
          📌 ข้อมูลที่เพิ่มจะถูกรวมเป็นส่วนหนึ่งของ System Prompt โดยอัตโนมัติ — บอทจะ "รู้" ข้อมูลใหม่ทันทีในการสนทนาถัดไป
        </div>
      </div>
    </div>
  );
}

// ─── SYSTEM INFO TAB ──────────────────────────────────────────────────────────
function SystemTab() {
  const caps = [
    { icon:"🧠", title:"ฐานความรู้ครอบคลุม", desc:"ข้อมูลสินค้า P90+, วิทยาศาสตร์ PEMF, Terahertz, ไมโตคอนเดรีย/ATP, ลิงก์ทรัพยากร, ตารางประชุม Zoom" },
    { icon:"⚖️", title:"Guardrail อย. อัตโนมัติ 2 ชั้น", desc:"ตรวจ Keyword ต้องห้ามในคำถาม + System Prompt สั่งบอทใช้ภาษาถูกกฎหมายเสมอ" },
    { icon:"📋", title:"เมนูคำถาม 5 หมวด", desc:"สินค้า, PEMF Science, ตารางประชุม, ลิงก์ทรัพยากร, อย.&กฎหมาย — รวม 26 คำถาม" },
    { icon:"📝", title:"Knowledge Base แก้ไขได้", desc:"Admin พิมพ์เพิ่มข้อมูลโปรโมชั่น/ข่าวสาร/ขั้นตอน ได้ทุกเวลา บอทรับรู้ทันที" },
    { icon:"💾", title:"บันทึกถาวร (Persistent)", desc:"ข้อมูล KB และประวัติสนทนาเก็บใน Storage ไม่หายเมื่อรีเฟรช" },
    { icon:"🔗", title:"ลิงก์ครบทุกช่องทาง", desc:"YouTube VTR, Google Drive (ENG/CHN), Facebook, PubMed, Zoom, Canva" },
  ];
  const links = [
    { label:"🎬 YouTube VTR", url:"https://youtu.be/UIv5jff0POo?si=LZ1zBTxhJ8M4DZXT" },
    { label:"📄 VTR ENG (01-05-26)", url:"https://drive.google.com/file/d/1b529g1CvlsPvPkwC7WcORDcH6X6GQIBp/view" },
    { label:"📄 VTR CHN (02-05-26)", url:"https://drive.google.com/file/d/1E0BkHshcY4T7kCxIEDy48JWZ0bIg5Iro/view" },
    { label:"📘 Facebook OlyLife", url:"https://www.facebook.com/OlyLifeGlobalByVibeVerse/" },
    { label:"🔬 PubMed Research", url:"https://pubmed.ncbi.nlm.nih.gov/" },
    { label:"🎨 Canva Slides", url:"https://www.canva.com/design/DAGYN12jV-k/LJBP_oYk_sN-rNFvg3WfDg/edit" },
    { label:"💻 Zoom Meeting", url:"https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1" },
    { label:"🌐 OlyLife Website", url:"https://www.olylifeint.com/" },
  ];
  return (
    <div style={{ padding:16, overflowY:"auto", height:"100%" }}>
      <div style={{ color:C.teal, fontWeight:700, fontSize:15, marginBottom:12 }}>ความสามารถของระบบทั้งหมด</div>
      <div style={{ display:"grid", gap:8, marginBottom:18 }}>
        {caps.map((c,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", display:"flex", gap:12 }}>
            <span style={{ fontSize:22 }}>{c.icon}</span>
            <div>
              <div style={{ color:C.text, fontWeight:600, fontSize:13 }}>{c.title}</div>
              <div style={{ color:C.muted, fontSize:12, marginTop:3, lineHeight:1.6 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ color:C.teal, fontWeight:700, fontSize:14, marginBottom:10 }}>วิธีใช้งาน AI Bot</div>
      {[
        ["1️⃣","พิมพ์คำถามในกล่องข้อความ หรือกดเมนูคำถามสำเร็จรูปตามหมวด"],
        ["2️⃣","บอทจะตอบโดยอิงจากฐานความรู้ P90+ และข้อมูลที่ Admin เพิ่ม"],
        ["3️⃣","หากต้องการอัปเดตโปรโมชั่น/ข่าวสาร ไปที่แท็บ 📝 ฐานความรู้"],
        ["4️⃣","บอทกรองคำต้องห้าม อย. อัตโนมัติ — ไม่ต้องกังวลเรื่องภาษา"],
        ["5️⃣","กดลิงก์ทรัพยากรด้านล่างเพื่อแชร์ให้ลูกค้าได้โดยตรง"],
      ].map(([n,t],i)=>(
        <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
          <span style={{ fontSize:18 }}>{n}</span>
          <span style={{ color:C.muted, fontSize:13, lineHeight:1.6 }}>{t}</span>
        </div>
      ))}

      <div style={{ color:C.teal, fontWeight:700, fontSize:14, margin:"14px 0 10px" }}>📅 ตารางประชุมประจำสัปดาห์</div>
      <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
        <div style={{ color:"#fcd34d", fontWeight:600, fontSize:13 }}>✍️ รายการคนรักสุขภาพ</div>
        <div style={{ color:C.muted, fontSize:12, marginTop:6, lineHeight:1.9 }}>
          🗓 ทุกวันจันทร์–ศุกร์ เวลา 07:00–08:30 น.<br/>
          🔹 Meeting ID: 568 239 4879<br/>
          🔹 Passcode: 6666<br/>
          💻 แพลตฟอร์ม: Zoom
        </div>
      </div>

      <div style={{ color:C.teal, fontWeight:700, fontSize:14, marginBottom:10 }}>🔗 ลิงก์ทั้งหมด</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
        {links.map((l,i)=>(
          <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{
            display:"block", padding:"9px 12px", borderRadius:8,
            border:`1px solid ${C.border}`, background:"rgba(255,255,255,0.03)",
            color:C.teal, fontSize:12, textDecoration:"none", transition:"all .15s",
          }}>{l.label}</a>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]       = useState("chat");
  const [msgs, setMsgs]     = useState([]);
  const [kb, setKb]         = useState([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [fdaWarn, setFdaWarn] = useState(false);
  const [activeCat, setActiveCat] = useState("product");
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Load from storage
  useEffect(()=>{
    (async()=>{
      const k = await storeGet(SK_KB);
      const h = await storeGet(SK_MSG);
      if (k) setKb(k);
      if (h) setMsgs(h);
      else setMsgs([{
        role:"assistant",
        content:"สวัสดีค่ะ! ฉันชื่อ **โอลี่** 🌿\n\nผู้ช่วยข้อมูล **OlyLife THZ Tera-P90+** พร้อมตอบทุกคำถามเกี่ยวกับสินค้า, เทคโนโลยี PEMF, ตารางประชุม และช่องทางต่างๆ\n\nเลือกหมวดคำถามด้านล่าง หรือพิมพ์ได้เลยนะคะ 😊",
      }]);
      setLoaded(true);
    })();
  },[]);

  // ── Persist KB
  useEffect(()=>{ if(loaded) storeSet(SK_KB,kb); },[kb,loaded]);

  // ── Persist msgs (keep last 30)
  useEffect(()=>{
    if(loaded && msgs.length>0) storeSet(SK_MSG, msgs.slice(-30));
  },[msgs,loaded]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  // ── Build full system prompt
  const buildSysPrompt = useCallback(()=>{
    let extra = "";
    if (kb.length>0) {
      extra = "\n\n=== ข้อมูลเพิ่มเติมจาก Admin ===\n";
      kb.forEach(e=>{ extra += `\n【${e.title}】\n${e.content}\n`; });
    }
    return `คุณคือ "โอลี่" ผู้ช่วยขายและให้ข้อมูลผลิตภัณฑ์ OlyLife THZ Tera-P90+ อย่างมืออาชีพ
ตอบเป็นภาษาไทยเสมอ กระชับ อบอุ่น น่าเชื่อถือ ใช้ emoji พอประมาณ

${BASE_KNOWLEDGE}${extra}

${FDA_RULE}

คำแนะนำการตอบ:
- ตอบตรงประเด็น ไม่เยิ่นเย้อ
- ถามกลับเมื่อต้องการข้อมูลเพิ่ม
- หากไม่แน่ใจ แนะนำติดต่อทีม OlyLife Thailand โดยตรง
- เมื่อมีลิงก์ที่เกี่ยวข้อง ให้แนบด้วยเสมอ
- ห้ามสร้างข้อมูลที่ไม่มีในฐานความรู้`;
  },[kb]);

  // ── Send message
  const sendMsg = useCallback(async(text)=>{
    const t = (text||input).trim();
    if (!t || loading) return;
    setInput(""); setFdaWarn(false);
    if (FDA_KWS.some(k=>t.toLowerCase().includes(k.toLowerCase()))) setFdaWarn(true);

    const newMsgs = [...msgs, {role:"user", content:t}];
    setMsgs(newMsgs); setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:buildSysPrompt(),
          messages:newMsgs.map(m=>({role:m.role,content:m.content})),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b=>b.text||"").join("") || "ขออภัยค่ะ ไม่สามารถตอบได้ในขณะนี้";
      setMsgs(p=>[...p,{role:"assistant",content:reply}]);
    } catch {
      setMsgs(p=>[...p,{role:"assistant",content:"ขออภัยค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่ 🙏"}]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  },[msgs,input,loading,buildSysPrompt]);

  const clearChat = () => { setMsgs([{ role:"assistant", content:"เริ่มบทสนทนาใหม่แล้วนะคะ 😊 มีอะไรให้ช่วยไหมคะ?" }]); };

  const addKB  = (e) => setKb(p=>[e,...p]);
  const delKB  = (id) => setKb(p=>p.filter(e=>e.id!==id));

  if(!loaded) return (
    <div style={{minHeight:"100vh",background:C.bg0,display:"flex",alignItems:"center",justifyContent:"center",color:C.teal,fontFamily:"Sarabun,sans-serif",fontSize:18}}>
      <link href={FONT_LINK} rel="stylesheet"/>กำลังโหลด...
    </div>
  );

  const cat = MENU_CATS.find(c=>c.id===activeCat);

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.bg0} 0%,#091622 60%,#050e18 100%)`,fontFamily:"Sarabun,'Noto Sans Thai',sans-serif",color:C.text,display:"flex",flexDirection:"column",maxWidth:540,margin:"0 auto",height:"100vh"}}>
      <link href={FONT_LINK} rel="stylesheet"/>

      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(135deg,${C.teal3} 0%,${C.teal2} 60%,${C.teal} 100%)`,padding:"14px 16px 12px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:46,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:"2px solid rgba(255,255,255,0.4)",flexShrink:0}}>🤖</div>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontWeight:700,fontSize:17}}>โอลี่ — OlyLife P90+ Bot</div>
            <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginTop:1}}>ข้อมูลสินค้า • PEMF Science • ตารางประชุม 🟢</div>
          </div>
          <button onClick={clearChat} title="เริ่มใหม่" style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,color:"#fff",fontSize:18,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>↺</button>
        </div>
        <div style={{marginTop:10,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"6px 11px",fontSize:11,color:"rgba(255,255,255,0.85)",display:"flex",gap:6,alignItems:"center"}}>
          <span>⚖️</span><span>ไม่อ้างสรรพคุณรักษาโรค — ปฏิบัติตาม อย. ไทย</span>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <TabBar
        tabs={[{id:"chat",label:"💬 แชท"},{id:"kb",label:"📝 ฐานความรู้"},{id:"sys",label:"ℹ️ ระบบ"}]}
        active={tab} onChange={setTab}
      />

      {/* ── CHAT TAB ── */}
      {tab==="chat" && (
        <>
          {/* FDA Warning */}
          {fdaWarn && (
            <div style={{background:"#2d1b00",borderLeft:"4px solid #f59e0b",padding:"8px 14px",fontSize:12,color:"#fcd34d",flexShrink:0,display:"flex",gap:6,alignItems:"center"}}>
              <span>⚠️</span><span>พบคำเกี่ยวกับโรค — บอทจะตอบตามข้อกำหนด อย. เท่านั้น</span>
            </div>
          )}

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"16px 14px",display:"flex",flexDirection:"column",gap:12}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end",gap:8}}>
                {m.role==="assistant" && (
                  <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal3},${C.teal2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>🤖</div>
                )}
                <div
                  style={{maxWidth:"80%",padding:"11px 14px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.role==="user"?`linear-gradient(135deg,${C.teal3},${C.teal2})`:`${C.bg2}`,color:"#fff",fontSize:14,lineHeight:1.65,border:m.role==="assistant"?`1px solid ${C.border}`:"none",boxShadow:"0 2px 10px rgba(0,0,0,0.25)"}}
                  dangerouslySetInnerHTML={{__html:fmt(m.content)}}
                />
              </div>
            ))}
            {loading && (
              <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal3},${C.teal2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🤖</div>
                <div style={{padding:"12px 16px",background:C.bg2,borderRadius:"18px 18px 18px 4px",border:`1px solid ${C.border}`,display:"flex",gap:5,alignItems:"center"}}>
                  {[0,1,2].map(j=>(
                    <div key={j} style={{width:7,height:7,borderRadius:"50%",background:C.teal,animation:"bop 1.2s infinite",animationDelay:`${j*0.2}s`}}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick Menu */}
          <div style={{flexShrink:0,borderTop:`1px solid ${C.border}`,background:C.bg1}}>
            {/* Category Tabs */}
            <div style={{display:"flex",gap:0,overflowX:"auto",padding:"8px 10px 0",scrollbarWidth:"none"}}>
              {MENU_CATS.map(c=>(
                <button key={c.id} onClick={()=>setActiveCat(c.id)} style={{
                  flexShrink:0,padding:"5px 11px",borderRadius:"20px 20px 0 0",border:`1px solid ${activeCat===c.id?c.color+"44":C.border}`,borderBottom:"none",
                  background:activeCat===c.id?c.color+"18":"transparent",
                  color:activeCat===c.id?c.color:C.muted,fontSize:11.5,cursor:"pointer",fontFamily:"inherit",
                  fontWeight:activeCat===c.id?600:400,transition:"all .15s",whiteSpace:"nowrap",marginRight:4,
                }}>{c.label}</button>
              ))}
            </div>
            {/* Question Buttons */}
            <div style={{padding:"8px 10px",display:"flex",flexWrap:"wrap",gap:6,borderTop:`1px solid ${cat.color}22`}}>
              {cat.items.map((q,i)=>(
                <button key={i} onClick={()=>sendMsg(q)} disabled={loading} style={{
                  padding:"6px 12px",borderRadius:20,border:`1px solid ${cat.color}44`,
                  background:loading?"rgba(255,255,255,0.03)":`${cat.color}12`,
                  color:loading?C.dim:cat.color,fontSize:12,cursor:loading?"not-allowed":"pointer",
                  fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .15s",opacity:loading?.5:1,
                }}>{q}</button>
              ))}
            </div>

            {/* Input Row */}
            <div style={{display:"flex",gap:8,padding:"8px 12px 14px",alignItems:"flex-end"}}>
              <textarea
                ref={inputRef} value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}
                placeholder="พิมพ์คำถาม หรือข้อมูลเพิ่มเติม..." rows={1} disabled={loading}
                style={{flex:1,padding:"10px 14px",borderRadius:20,border:`1px solid ${C.border2}`,background:C.bg2,color:C.text,fontSize:14,outline:"none",resize:"none",fontFamily:"inherit",lineHeight:1.5,maxHeight:90,overflowY:"auto"}}
              />
              <button onClick={()=>sendMsg()} disabled={loading||!input.trim()} style={{
                width:42,height:42,borderRadius:"50%",border:"none",
                background:loading||!input.trim()?"rgba(109,191,184,0.15)":`linear-gradient(135deg,${C.teal3},${C.teal2})`,
                color:"#fff",fontSize:18,cursor:loading||!input.trim()?"not-allowed":"pointer",flexShrink:0,
                transition:"all .2s",boxShadow:loading||!input.trim()?"none":`0 4px 14px ${C.teal3}55`,
              }}>
                {loading?"⏳":"➤"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── KB TAB ── */}
      {tab==="kb" && (
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <KBTab entries={kb} onAdd={addKB} onDelete={delKB}/>
        </div>
      )}

      {/* ── SYSTEM TAB ── */}
      {tab==="sys" && (
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <SystemTab/>
        </div>
      )}

      <style>{`
        @keyframes bop { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e3a4a;border-radius:4px}
        textarea{scrollbar-width:thin}
      `}</style>
    </div>
  );
}
