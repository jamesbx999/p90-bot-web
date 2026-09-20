'use client';
import { useState, useEffect, useCallback } from 'react';

interface KBEntry { id: string; title: string; content: string; ts: number; }
interface ScheduleItem { id: string; type: 'promo'|'meeting'; week: number; day: number; category: string; title: string; desc: string; startTime: string; endTime: string; location?: string; note?: string; }
interface UserData { id: string; username: string; phone: string; refCode: string; referredBy?: string; ts: number; }

const DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const WEEKS = ['สัปดาห์ที่ 1','สัปดาห์ที่ 2','สัปดาห์ที่ 3','สัปดาห์ที่ 4'];
const C = { bg0:'#070e1a', bg1:'#0d1c2e', bg2:'#122336', teal:'#6dbfb8', teal2:'#14a085', teal3:'#0d7377', text:'#ddeef0', muted:'#5a8090', dim:'#3a5a6a', border:'rgba(109,191,184,0.15)', border2:'rgba(109,191,184,0.3)' };
const ins: React.CSSProperties = { width:'100%', padding:'9px 13px', borderRadius:10, border:`1px solid ${C.border2}`, background:'rgba(255,255,255,0.05)', color:C.text, fontSize:13.5, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };

function getToken() { return document.cookie.split(';').find(c=>c.trim().startsWith('admin-token='))?.split('=')[1]?.trim()||''; }
async function api(url: string, method='GET', body?: object) {
  const res = await fetch(url, { method, headers:{'Content-Type':'application/json','x-admin-token':getToken()}, body:body?JSON.stringify(body):undefined });
  return res.json();
}

export default function AdminPage() {
  const [tab, setTab] = useState<'members'|'kb'|'schedule'|'info'>('members');
  const [kb, setKb] = useState<KBEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [kbTitle, setKbTitle] = useState(''); const [kbContent, setKbContent] = useState('');
  const [schForm, setSchForm] = useState({ type:'promo', week:0, day:1, category:'flash', title:'', desc:'', startTime:'09:00', endTime:'18:00', location:'', note:'' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [copiedRef, setCopiedRef] = useState('');

  const notify = (m: string) => { setMsg(m); setTimeout(()=>setMsg(''),3000); };

  useEffect(() => {
    api('/api/kb').then(setKb).catch(()=>{});
    api('/api/schedule').then(setSchedule).catch(()=>{});
    api('/api/users').then(setUsers).catch(()=>{});
  },[]);

  const addKB = async () => {
    if (!kbTitle.trim()||!kbContent.trim()) return;
    setSaving(true);
    const e = await api('/api/kb','POST',{title:kbTitle.trim(),content:kbContent.trim()});
    setKb(p=>[e,...p]); setKbTitle(''); setKbContent(''); notify('✅ เพิ่มความรู้แล้ว!');
    setSaving(false);
  };

  const delKB = async (id: string) => {
    await api(`/api/kb?id=${id}`,'DELETE');
    setKb(p=>p.filter(e=>e.id!==id)); notify('🗑 ลบแล้ว');
  };

  const addSch = async () => {
    if (!schForm.title.trim()) return;
    setSaving(true);
    const item = await api('/api/schedule','POST',schForm);
    setSchedule(p=>[item,...p]);
    setSchForm(s=>({...s,title:'',desc:'',location:'',note:''}));
    notify('✅ เพิ่มตารางแล้ว!');
    setSaving(false);
  };

  const delSch = async (id: string) => {
    await api(`/api/schedule?id=${id}`,'DELETE');
    setSchedule(p=>p.filter(i=>i.id!==id)); notify('🗑 ลบแล้ว');
  };

  const delUser = async (id: string) => {
    await api(`/api/users?id=${id}`,'DELETE');
    setUsers(p=>p.filter(u=>u.id!==id)); notify('🗑 ลบสมาชิกแล้ว');
  };

  const copyRef = (code: string) => {
    const link = `${window.location.origin}/m?ref=${code}`;
    navigator.clipboard?.writeText(link).then(()=>{ setCopiedRef(code); setTimeout(()=>setCopiedRef(''),2000); });
  };

  const logout = async () => { await fetch('/api/auth',{method:'DELETE'}); window.location.href='/admin/login'; };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.refCode.toLowerCase().includes(search.toLowerCase())
  );

  const schUp = (k: string) => (v: string|number) => setSchForm((p: typeof schForm) => ({...p,[k]:v}));

  return (
    <div style={{ minHeight:'100vh', background:C.bg0, fontFamily:"'Sarabun','Noto Sans Thai',sans-serif", color:C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.teal3},${C.teal2})`, padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:22 }}>🛠️</span>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>OlyLife P90+ Admin</div>
            <div style={{ color:'rgba(255,255,255,0.75)', fontSize:11 }}>ระบบจัดการบอท & สมาชิก</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {msg && <div style={{ background:'rgba(0,0,0,0.3)', padding:'4px 12px', borderRadius:20, fontSize:13, color:'#fff' }}>{msg}</div>}
          <a href="/" style={{ color:'rgba(255,255,255,0.8)', fontSize:13, textDecoration:'none', padding:'6px 12px', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8 }}>💬 บอท</a>
          <a href="/m" style={{ color:'rgba(255,255,255,0.8)', fontSize:13, textDecoration:'none', padding:'6px 12px', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8 }}>👥 Member</a>
          <button onClick={logout} style={{ padding:'6px 12px', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, background:'rgba(255,255,255,0.1)', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>ออก</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'16px 20px 0' }}>
        {[
          { icon:'👥', label:'สมาชิก', val:users.length, color:'#6dbfb8' },
          { icon:'📝', label:'ฐานความรู้', val:kb.length, color:'#6366f1' },
          { icon:'⚡', label:'โปรโมชั่น', val:schedule.filter(s=>s.type==='promo').length, color:'#f59e0b' },
          { icon:'📅', label:'ประชุม', val:schedule.filter(s=>s.type==='meeting').length, color:'#10b981' },
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
        {([['members','👥 สมาชิก'],['kb','📝 ฐานความรู้'],['schedule','📅 ตาราง/โปร'],['info','ℹ️ ข้อมูล']] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'8px 16px', borderRadius:'10px 10px 0 0', border:`1px solid ${C.border}`, borderBottom:'none', background:tab===id?'rgba(13,115,119,0.2)':'transparent', color:tab===id?C.teal:C.muted, fontFamily:'inherit', fontSize:13, cursor:'pointer', fontWeight:tab===id?600:400 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:'20px', maxWidth:1000, margin:'0 auto' }}>

        {/* ── MEMBERS TAB ── */}
        {tab==='members' && (
          <div>
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 ค้นหาชื่อ, เบอร์, รหัส Ref..."
                style={{...ins, flex:1, maxWidth:360}} />
              <div style={{ color:C.muted, fontSize:13 }}>ทั้งหมด {filteredUsers.length} คน</div>
            </div>

            {filteredUsers.length===0 && (
              <div style={{ color:C.dim, fontSize:14, textAlign:'center', padding:'40px 0' }}>
                {search ? 'ไม่พบสมาชิกที่ค้นหา' : 'ยังไม่มีสมาชิกลงทะเบียน'}
              </div>
            )}

            <div style={{ display:'grid', gap:10 }}>
              {filteredUsers.map((u, i) => (
                <div key={u.id} style={{ background:C.bg2, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.teal3}`, borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ display:'flex', gap:12, alignItems:'flex-start', flexWrap:'wrap' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${C.teal3},${C.teal2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, fontWeight:700, color:'#fff' }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ color:C.text, fontWeight:700, fontSize:16 }}>{u.username}</div>
                      <div style={{ display:'flex', gap:16, marginTop:4, flexWrap:'wrap' }}>
                        {u.phone && <span style={{ color:C.muted, fontSize:12 }}>📞 {u.phone}</span>}
                        <span style={{ color:C.muted, fontSize:12 }}>🔑 {u.refCode}</span>
                        {u.referredBy && <span style={{ color:'#f59e0b', fontSize:12 }}>🎁 แนะนำโดย: {u.referredBy}</span>}
                        <span style={{ color:C.dim, fontSize:12 }}>📅 {new Date(u.ts).toLocaleDateString('th-TH')}</span>
                      </div>
                      <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                        <div style={{ color:C.teal, fontSize:11, fontFamily:'monospace', background:'rgba(0,0,0,0.3)', padding:'4px 10px', borderRadius:6 }}>
                          {typeof window!=='undefined' ? `${window.location.origin}/m?ref=${u.refCode}` : `/m?ref=${u.refCode}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                      <button onClick={()=>copyRef(u.refCode)} style={{ padding:'6px 12px', borderRadius:8, border:`1px solid ${C.border2}`, background:copiedRef===u.refCode?'rgba(16,185,129,0.2)':'rgba(109,191,184,0.1)', color:copiedRef===u.refCode?'#10b981':C.teal, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                        {copiedRef===u.refCode ? '✅' : '🔗 คัดลอก'}
                      </button>
                      <button onClick={()=>{ if(confirm(`ลบ ${u.username}?`)) delUser(u.id); }} style={{ padding:'6px 12px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                        🗑 ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── KB TAB ── */}
        {tab==='kb' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
            <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <div style={{ color:C.teal, fontWeight:700, fontSize:15, marginBottom:14 }}>➕ เพิ่มความรู้ใหม่</div>
              <div style={{ marginBottom:10 }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>หัวข้อ *</div>
                <input style={ins} value={kbTitle} onChange={e=>setKbTitle(e.target.value)} placeholder="เช่น โปรโมชั่นเดือนนี้" />
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>เนื้อหา *</div>
                <textarea style={{...ins,height:130,resize:'vertical',lineHeight:1.6}} value={kbContent} onChange={e=>setKbContent(e.target.value)} placeholder="ข้อมูลที่ต้องการให้บอทรู้..." />
              </div>
              <button onClick={addKB} disabled={!kbTitle.trim()||!kbContent.trim()||saving} style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background:kbTitle.trim()&&kbContent.trim()?`linear-gradient(135deg,${C.teal3},${C.teal2})`:'rgba(255,255,255,0.06)', color:kbTitle.trim()&&kbContent.trim()?'#fff':'#444', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                {saving?'⏳':'💾 เพิ่มในฐานความรู้'}
              </button>
            </div>
            <div>
              <div style={{ color:C.muted, fontSize:12, marginBottom:10 }}>รายการ ({kb.length})</div>
              {kb.map(e => (
                <div key={e.id} style={{ background:C.bg2, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.teal3}`, borderRadius:10, padding:'12px 14px', marginBottom:8 }}>
                  <div style={{ color:C.text, fontWeight:600, fontSize:13, marginBottom:4 }}>{e.title}</div>
                  <div style={{ color:C.muted, fontSize:12, lineHeight:1.5, maxHeight:60, overflow:'hidden', marginBottom:8 }}>{e.content}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:C.dim, fontSize:11 }}>{new Date(e.ts).toLocaleDateString('th-TH')}</span>
                    <button onClick={()=>delKB(e.id)} style={{ padding:'3px 10px', borderRadius:6, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>🗑 ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab==='schedule' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:20, alignItems:'start' }}>
            <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <div style={{ color:C.teal, fontWeight:700, fontSize:15, marginBottom:14 }}>➕ เพิ่มโปรโมชั่น / ประชุม</div>
              <div style={{ marginBottom:10 }}>
                <div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>ประเภท</div>
                <div style={{ display:'flex', gap:8 }}>
                  {(['promo','meeting'] as const).map(t => (
                    <button key={t} onClick={()=>schUp('type')(t)} style={{ flex:1, padding:'7px', borderRadius:8, border:`1px solid ${schForm.type===t?C.teal:C.border}`, background:schForm.type===t?`${C.teal3}33`:'transparent', color:schForm.type===t?C.teal:C.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                      {t==='promo'?'⚡ โปรโมชั่น':'📅 ประชุม'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div><div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>สัปดาห์</div>
                  <select style={ins} value={schForm.week} onChange={e=>schUp('week')(Number(e.target.value))}>
                    {WEEKS.map((w,i) => <option key={i} value={i}>{w}</option>)}
                  </select>
                </div>
                <div><div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>วัน</div>
                  <select style={ins} value={schForm.day} onChange={e=>schUp('day')(Number(e.target.value))}>
                    {DAYS.map((d,i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:10 }}><div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>ชื่อ *</div>
                <input style={ins} value={schForm.title} onChange={e=>schUp('title')(e.target.value)} placeholder="ชื่อโปรโมชั่นหรือประชุม" />
              </div>
              <div style={{ marginBottom:10 }}><div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>{schForm.type==='promo'?'รายละเอียด':'สถานที่/ลิงก์'}</div>
                <input style={ins} value={schForm.type==='promo'?schForm.desc:schForm.location} onChange={e=>schUp(schForm.type==='promo'?'desc':'location')(e.target.value)} placeholder={schForm.type==='promo'?'เงื่อนไข...':'Zoom link...'} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                <div><div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>เวลาเริ่ม</div><input type="time" style={ins} value={schForm.startTime} onChange={e=>schUp('startTime')(e.target.value)} /></div>
                <div><div style={{ color:C.muted, fontSize:12, marginBottom:5 }}>เวลาสิ้นสุด</div><input type="time" style={ins} value={schForm.endTime} onChange={e=>schUp('endTime')(e.target.value)} /></div>
              </div>
              <button onClick={addSch} disabled={!schForm.title.trim()||saving} style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background:schForm.title.trim()?`linear-gradient(135deg,${C.teal3},${C.teal2})`:'rgba(255,255,255,0.06)', color:schForm.title.trim()?'#fff':'#444', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                {saving?'⏳':'💾 เพิ่มตาราง'}
              </button>
            </div>
            <div>
              <div style={{ color:C.muted, fontSize:12, marginBottom:10 }}>รายการทั้งหมด ({schedule.length})</div>
              {schedule.map(s => (
                <div key={s.id} style={{ background:C.bg2, border:`1px solid ${C.border}`, borderLeft:`3px solid ${s.type==='promo'?'#f59e0b':'#6366f1'}`, borderRadius:10, padding:'10px 14px', marginBottom:8 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <span>{s.type==='promo'?'⚡':'📅'}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:C.text, fontWeight:600, fontSize:13 }}>{s.title}</div>
                      <div style={{ color:C.muted, fontSize:12 }}>{WEEKS[s.week]} {DAYS[s.day]} {s.startTime}–{s.endTime}</div>
                    </div>
                    <button onClick={()=>delSch(s.id)} style={{ padding:'3px 8px', borderRadius:6, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INFO TAB ── */}
        {tab==='info' && (
          <div style={{ maxWidth:600 }}>
            <div style={{ color:C.teal, fontWeight:700, fontSize:16, marginBottom:14 }}>🔗 ลิงก์ระบบทั้งหมด</div>
            {[
              ['🤖 หน้าบอท','/'],
              ['👥 Member Page','/m'],
              ['🔍 Diagnostic','/api/test'],
              ['🎬 YouTube VTR','https://youtu.be/UIv5jff0POo'],
              ['📘 Facebook','https://www.facebook.com/OlyLifeGlobalByVibeVerse/'],
              ['💻 Zoom Meeting','https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1'],
            ].map(([label,url],i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display:'block', padding:'11px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.bg2, color:C.teal, fontSize:13, textDecoration:'none', marginBottom:8 }}>{label}: <span style={{color:C.muted}}>{url}</span></a>
            ))}
            <div style={{ color:C.teal, fontWeight:700, fontSize:16, margin:'20px 0 14px' }}>📅 ตาราง Zoom ประจำสัปดาห์</div>
            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ color:'#fcd34d', fontWeight:600 }}>✍️ รายการคนรักสุขภาพ</div>
              <div style={{ color:C.muted, fontSize:13, marginTop:6, lineHeight:2 }}>
                🗓 ทุกวันจันทร์–ศุกร์ 07:00–08:30 น.<br/>
                🔹 Meeting ID: <strong style={{color:C.text}}>568 239 4879</strong><br/>
                🔹 Passcode: <strong style={{color:C.text}}>6666</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
