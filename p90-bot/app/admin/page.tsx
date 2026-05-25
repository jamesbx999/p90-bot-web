'use client';
import { useState, useEffect, useCallback } from 'react';

interface KBEntry { id: string; title: string; content: string; ts: number; }
interface ScheduleItem { id: string; type: 'promo'|'meeting'; week: number; day: number; category: string; title: string; desc: string; startTime: string; endTime: string; badge?: string; location?: string; note?: string; }

const DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WEEKS = ['สัปดาห์ที่ 1','สัปดาห์ที่ 2','สัปดาห์ที่ 3','สัปดาห์ที่ 4'];

const C = { bg0:'#070e1a', bg1:'#0d1c2e', bg2:'#122336', teal:'#6dbfb8', teal2:'#14a085', teal3:'#0d7377', text:'#ddeef0', muted:'#5a8090', dim:'#3a5a6a', border:'rgba(109,191,184,0.15)', border2:'rgba(109,191,184,0.3)' };
const ins: React.CSSProperties = { width:'100%', padding:'9px 13px', borderRadius:10, border:`1px solid ${C.border2}`, background:'rgba(255,255,255,0.05)', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };

function getAdminToken(): string { return document.cookie.split(';').find(c=>c.trim().startsWith('admin-token='))?.split('=')[1]?.trim()||''; }

async function apiFetch(url: string, method = 'GET', body?: object) {
  const token = getAdminToken();
  const res = await fetch(url, {
    method, headers: { 'Content-Type':'application/json', 'x-admin-token': token },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminPage() {
  const [tab, setTab] = useState<'kb'|'schedule'|'info'>('kb');
  const [kb, setKb] = useState<KBEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Schedule form
  const [schForm, setSchForm] = useState({ type:'promo', week:0, day:1, category:'flash', title:'', desc:'', startTime:'09:00', endTime:'18:00', badge:'', location:'', note:'' });
  const schUp = (k: string) => (v: string|number) => setSchForm((p:typeof schForm) => ({...p,[k]:v}));

  const notify = (m: string) => { setMsg(m); setTimeout(()=>setMsg(''), 3000); };

  useEffect(() => {
    apiFetch('/api/kb').then(setKb).catch(()=>{});
    apiFetch('/api/schedule').then(setSchedule).catch(()=>{});
  }, []);

  const addKB = async () => {
    if (!kbTitle.trim() || !kbContent.trim()) return;
    setSaving(true);
    try {
      const e = await apiFetch('/api/kb', 'POST', { title: kbTitle.trim(), content: kbContent.trim() });
      setKb(p => [e, ...p]);
      setKbTitle(''); setKbContent('');
      notify('✅ เพิ่มความรู้แล้ว!');
    } catch { notify('❌ เกิดข้อผิดพลาด'); }
    setSaving(false);
  };

  const delKB = async (id: string) => {
    await apiFetch(`/api/kb?id=${id}`, 'DELETE');
    setKb(p => p.filter(e => e.id !== id));
    notify('🗑 ลบแล้ว');
  };

  const addSchedule = async () => {
    if (!schForm.title.trim()) return;
    setSaving(true);
    try {
      const item = await apiFetch('/api/schedule', 'POST', schForm);
      setSchedule(p => [item, ...p]);
      setSchForm(s => ({...s, title:'', desc:'', badge:'', location:'', note:''}));
      notify('✅ เพิ่มตารางแล้ว!');
    } catch { notify('❌ เกิดข้อผิดพลาด'); }
    setSaving(false);
  };

  const delSchedule = async (id: string) => {
    await apiFetch(`/api/schedule?id=${id}`, 'DELETE');
    setSchedule(p => p.filter(i => i.id !== id));
    notify('🗑 ลบแล้ว');
  };

  const logout = async () => { await fetch('/api/auth', {method:'DELETE'}); window.location.href = '/admin/login'; };

  return (
    <div style={{ minHeight:'100vh', background:C.bg0, fontFamily:"'Sarabun','Noto Sans Thai',sans-serif", color:C.text }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal3},${C.teal2})`, padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:22 }}>🛠️</span>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>OlyLife P90+ Admin</div>
            <div style={{ color:'rgba(255,255,255,0.75)', fontSize:11 }}>ระบบจัดการบอท</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {msg && <div style={{ background:'rgba(0,0,0,0.3)', padding:'4px 12px', borderRadius:20, fontSize:13, color:'#fff' }}>{msg}</div>}
          <a href="/" style={{ color:'rgba(255,255,255,0.8)', fontSize:13, textDecoration:'none', padding:'6px 12px', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8 }}>💬 ดูบอท</a>
          <button onClick={logout} style={{ padding:'6px 12px', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, background:'rgba(255,255,255,0.1)', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>ออกจากระบบ</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, padding:'16px 20px 0' }}>
        {[
          {icon:'📝', label:'ฐานความรู้', val:kb.length, color:'#6dbfb8'},
          {icon:'⚡', label:'โปรโมชั่น', val:schedule.filter(s=>s.type==='promo').length, color:'#f59e0b'},
          {icon:'📅', label:'การประชุม', val:schedule.filter(s=>s.type==='meeting').length, color:'#6366f1'},
        ].map((s,i) => (
          <div key={i} style={{ background:C.bg2, border:`1px solid ${s.color}22`, borderTop:`3px solid ${s.color}`, borderRadius:12, padding:'12px 14px' }}>
            <div style={{ fontSize:20 }}>{s.icon}</div>
            <div style={{ fontSize:24, fontWeight:700, color:s.color, lineHeight:1.1, marginTop:4 }}>{s.val}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, padding:'16px 20px 0', borderBottom:`1px solid ${C.border}` }}>
        {([['kb','📝 ฐานความรู้'],['schedule','📅 ตาราง/โปรโมชั่น'],['info','ℹ️ ข้อมูลระบบ']] as const).map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding:'8px 16px', borderRadius:'10px 10px 0 0', border:`1px solid ${C.border}`, borderBottom:'none', background:tab===id?'rgba(13,115,119,0.2)':'transparent', color:tab===id?C.teal:C.muted, fontFamily:'inherit', fontSize:13, cursor:'pointer', fontWeight:tab===id?600:400 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:'20px', maxWidth:900, margin:'0 auto' }}>

        {/* ── KB TAB ── */}
        {tab === 'kb' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
            <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <div style={{ color:C.teal, fontWeight:700, fontSize:15, marginBottom:14 }}>➕ เพิ่มความรู้ใหม่</div>
              <div style={{ marginBottom:10 }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>หัวข้อ *</div>
                <input style={ins} value={kbTitle} onChange={e=>setKbTitle(e.target.value)} placeholder="เช่น โปรโมชั่นเดือนมิถุนา, ขั้นตอนสั่งซื้อ" />
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>เนื้อหา *</div>
                <textarea style={{...ins, height:130, resize:'vertical', lineHeight:1.6}} value={kbContent} onChange={e=>setKbContent(e.target.value)} placeholder="พิมพ์ข้อมูลที่ต้องการให้บอทรู้..." />
              </div>
              <button onClick={addKB} disabled={!kbTitle.trim()||!kbContent.trim()||saving} style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background:kbTitle.trim()&&kbContent.trim()?`linear-gradient(135deg,${C.teal3},${C.teal2})`:'rgba(255,255,255,0.06)', color:kbTitle.trim()&&kbContent.trim()?'#fff':'#444', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:kbTitle.trim()&&kbContent.trim()?'pointer':'not-allowed' }}>
                {saving?'⏳ กำลังบันทึก...':'💾 เพิ่มในฐานความรู้'}
              </button>
            </div>
            <div>
              <div style={{ color:C.muted, fontSize:12, marginBottom:10 }}>รายการฐานความรู้ ({kb.length})</div>
              {kb.length===0 && <div style={{ color:C.dim, fontSize:13, textAlign:'center', padding:20 }}>ยังไม่มีข้อมูล</div>}
              {kb.map(e => (
                <div key={e.id} style={{ background:C.bg2, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.teal3}`, borderRadius:10, padding:'12px 14px', marginBottom:8 }}>
                  <div style={{ color:C.text, fontWeight:600, fontSize:13, marginBottom:4 }}>{e.title}</div>
                  <div style={{ color:C.muted, fontSize:12, lineHeight:1.5, marginBottom:8, whiteSpace:'pre-wrap', maxHeight:80, overflow:'hidden' }}>{e.content}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:C.dim, fontSize:11 }}>{new Date(e.ts).toLocaleDateString('th-TH')}</span>
                    <button onClick={() => delKB(e.id)} style={{ padding:'3px 10px', borderRadius:6, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>🗑 ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === 'schedule' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:20, alignItems:'start' }}>
            <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <div style={{ color:C.teal, fontWeight:700, fontSize:15, marginBottom:14 }}>➕ เพิ่มโปรโมชั่น / ประชุม</div>
              
              <div style={{ marginBottom:10 }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>ประเภท</div>
                <div style={{ display:'flex', gap:8 }}>
                  {(['promo','meeting'] as const).map(t => (
                    <button key={t} onClick={() => schUp('type')(t)} style={{ flex:1, padding:'7px', borderRadius:8, border:`1px solid ${schForm.type===t?C.teal:C.border}`, background:schForm.type===t?`${C.teal3}33`:'transparent', color:schForm.type===t?C.teal:C.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                      {t==='promo'?'⚡ โปรโมชั่น':'📅 การประชุม'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div>
                  <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>สัปดาห์</div>
                  <select style={{...ins}} value={schForm.week} onChange={e=>schUp('week')(Number(e.target.value))}>
                    {WEEKS.map((w,i) => <option key={i} value={i}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>วัน</div>
                  <select style={{...ins}} value={schForm.day} onChange={e=>schUp('day')(Number(e.target.value))}>
                    {DAYS.map((d,i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:10 }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>ชื่อ *</div>
                <input style={ins} value={schForm.title} onChange={e=>schUp('title')(e.target.value)} placeholder={schForm.type==='promo'?'เช่น Flash Sale ลด 15%':'เช่น ประชุมทีมขาย'} />
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>{schForm.type==='promo'?'รายละเอียด':'สถานที่/ลิงก์'}</div>
                <input style={ins} value={schForm.type==='promo'?schForm.desc:schForm.location} onChange={e=>schUp(schForm.type==='promo'?'desc':'location')(e.target.value)} placeholder={schForm.type==='promo'?'เงื่อนไข, stock...':'Zoom link, สถานที่...'} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                <div>
                  <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>เวลาเริ่ม</div>
                  <input type="time" style={ins} value={schForm.startTime} onChange={e=>schUp('startTime')(e.target.value)} />
                </div>
                <div>
                  <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>เวลาสิ้นสุด</div>
                  <input type="time" style={ins} value={schForm.endTime} onChange={e=>schUp('endTime')(e.target.value)} />
                </div>
              </div>
              <button onClick={addSchedule} disabled={!schForm.title.trim()||saving} style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background:schForm.title.trim()?`linear-gradient(135deg,${C.teal3},${C.teal2})`:'rgba(255,255,255,0.06)', color:schForm.title.trim()?'#fff':'#444', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:schForm.title.trim()?'pointer':'not-allowed' }}>
                {saving?'⏳ บันทึก...':'💾 เพิ่มตาราง'}
              </button>
            </div>

            <div>
              <div style={{ color:C.muted, fontSize:12, marginBottom:10 }}>รายการทั้งหมด ({schedule.length})</div>
              {schedule.length===0 && <div style={{ color:C.dim, fontSize:13, textAlign:'center', padding:20 }}>ยังไม่มีข้อมูล</div>}
              {schedule.map(s => (
                <div key={s.id} style={{ background:C.bg2, border:`1px solid ${C.border}`, borderLeft:`3px solid ${s.type==='promo'?'#f59e0b':'#6366f1'}`, borderRadius:10, padding:'10px 14px', marginBottom:8 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <span style={{ fontSize:16 }}>{s.type==='promo'?'⚡':'📅'}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:C.text, fontWeight:600, fontSize:13 }}>{s.title}</div>
                      <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>{WEEKS[s.week]} — {DAYS[s.day]} {s.startTime}–{s.endTime}</div>
                      {(s.desc||s.location) && <div style={{ color:C.dim, fontSize:12 }}>{s.desc||s.location}</div>}
                    </div>
                    <button onClick={() => delSchedule(s.id)} style={{ padding:'3px 8px', borderRadius:6, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', fontSize:11, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INFO TAB ── */}
        {tab === 'info' && (
          <div style={{ maxWidth:600 }}>
            <div style={{ color:C.teal, fontWeight:700, fontSize:16, marginBottom:14 }}>📅 ตารางประชุมประจำสัปดาห์</div>
            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:'14px 16px', marginBottom:20 }}>
              <div style={{ color:'#fcd34d', fontWeight:600 }}>✍️ รายการคนรักสุขภาพ</div>
              <div style={{ color:C.muted, fontSize:13, marginTop:8, lineHeight:2 }}>
                🗓 ทุกวันจันทร์–ศุกร์ เวลา 07:00–08:30 น.<br/>
                🔹 Meeting ID: <strong style={{color:C.text}}>568 239 4879</strong><br/>
                🔹 Passcode: <strong style={{color:C.text}}>6666</strong><br/>
                💻 <a href="https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1" target="_blank" style={{color:C.teal}}>เข้าร่วม Zoom</a>
              </div>
            </div>
            <div style={{ color:C.teal, fontWeight:700, fontSize:16, marginBottom:14 }}>🔗 ลิงก์ทรัพยากรทั้งหมด</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                ['🎬 YouTube VTR','https://youtu.be/UIv5jff0POo?si=LZ1zBTxhJ8M4DZXT'],
                ['📄 VTR ENG','https://drive.google.com/file/d/1b529g1CvlsPvPkwC7WcORDcH6X6GQIBp/view'],
                ['📄 VTR CHN','https://drive.google.com/file/d/1E0BkHshcY4T7kCxIEDy48JWZ0bIg5Iro/view'],
                ['📘 Facebook','https://www.facebook.com/OlyLifeGlobalByVibeVerse/'],
                ['🔬 PubMed','https://pubmed.ncbi.nlm.nih.gov/'],
                ['🎨 Canva Slides','https://www.canva.com/design/DAGYN12jV-k/LJBP_oYk_sN-rNFvg3WfDg/edit'],
                ['🌐 OlyLife Web','https://www.olylifeint.com/'],
                ['💻 Zoom Meeting','https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1'],
              ].map(([label,url],i) => (
                <a key={i} href={url} target="_blank" style={{ display:'block', padding:'10px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.bg2, color:C.teal, fontSize:13, textDecoration:'none' }}>{label}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
