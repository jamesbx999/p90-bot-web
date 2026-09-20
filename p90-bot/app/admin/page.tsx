'use client';
import { useState, useEffect } from 'react';

interface KBEntry { id: string; title: string; content: string; ts: number; }
interface ScheduleItem { id: string; type: 'promo'|'meeting'; week: number; day: number; category: string; title: string; desc: string; startTime: string; endTime: string; location?: string; note?: string; }
interface UserData { id: string; username: string; phone: string; refCode: string; referredBy?: string; ts: number; }

const DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const WEEKS = ['สัปดาห์ที่ 1','สัปดาห์ที่ 2','สัปดาห์ที่ 3','สัปดาห์ที่ 4'];

function getToken() { return document.cookie.split(';').find(c=>c.trim().startsWith('admin-token='))?.split('=')[1]?.trim()||''; }
async function api(url: string, method='GET', body?: object) {
  const res = await fetch(url, { method, headers:{'Content-Type':'application/json','x-admin-token':getToken()}, body:body?JSON.stringify(body):undefined });
  return res.json();
}

const ins: React.CSSProperties = { width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#1f2937', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };

export default function AdminPage() {
  const [tab, setTab] = useState<'members'|'kb'|'schedule'|'settings'>('members');
  const [kb, setKb] = useState<KBEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [copiedRef, setCopiedRef] = useState('');
  const [schForm, setSchForm] = useState({ type:'promo', week:0, day:1, title:'', desc:'', startTime:'09:00', endTime:'18:00', location:'', note:'' });
  const [showAddKB, setShowAddKB] = useState(false);
  const [showAddSch, setShowAddSch] = useState(false);

  const notify = (m: string) => { setMsg(m); setTimeout(()=>setMsg(''),3000); };
  const schUp = (k: string) => (v: string|number) => setSchForm((p: typeof schForm) => ({...p,[k]:v}));

  useEffect(() => {
    api('/api/kb').then(setKb).catch(()=>{});
    api('/api/schedule').then(setSchedule).catch(()=>{});
    api('/api/users').then(setUsers).catch(()=>{});
  },[]);

  const addKB = async () => {
    if (!kbTitle.trim()||!kbContent.trim()) return;
    setSaving(true);
    const e = await api('/api/kb','POST',{title:kbTitle.trim(),content:kbContent.trim()});
    setKb(p=>[e,...p]); setKbTitle(''); setKbContent(''); setShowAddKB(false); notify('✅ เพิ่มความรู้แล้ว!');
    setSaving(false);
  };

  const delKB = async (id: string) => {
    if (!confirm('ลบรายการนี้?')) return;
    await api(`/api/kb?id=${id}`,'DELETE');
    setKb(p=>p.filter(e=>e.id!==id)); notify('ลบแล้ว');
  };

  const addSch = async () => {
    if (!schForm.title.trim()) return;
    setSaving(true);
    const item = await api('/api/schedule','POST',schForm);
    setSchedule(p=>[item,...p]);
    setSchForm(s=>({...s,title:'',desc:'',location:'',note:''}));
    setShowAddSch(false); notify('✅ เพิ่มตารางแล้ว!');
    setSaving(false);
  };

  const delSch = async (id: string) => {
    if (!confirm('ลบรายการนี้?')) return;
    await api(`/api/schedule?id=${id}`,'DELETE');
    setSchedule(p=>p.filter(i=>i.id!==id)); notify('ลบแล้ว');
  };

  const delUser = async (id: string, name: string) => {
    if (!confirm(`ลบสมาชิก "${name}"?`)) return;
    await api(`/api/users?id=${id}`,'DELETE');
    setUsers(p=>p.filter(u=>u.id!==id)); notify('ลบสมาชิกแล้ว');
  };

  const copyRef = (code: string) => {
    const link = `${window.location.origin}/m?ref=${code}`;
    navigator.clipboard?.writeText(link).then(()=>{ setCopiedRef(code); setTimeout(()=>setCopiedRef(''),2000); });
  };

  const logout = async () => { await fetch('/api/auth',{method:'DELETE'}); window.location.href='/admin/login'; };
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search) || u.refCode.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', fontFamily:"'Sarabun','Noto Sans Thai',sans-serif", color:'#1f2937' }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#0d7377,#14a085)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🌿</div>
          <div>
            <div style={{ fontWeight:700, fontSize:17, color:'#1f2937' }}>OlyLife P90+ Admin</div>
            <div style={{ fontSize:12, color:'#6b7280' }}>ระบบจัดการบอทและสมาชิก</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {msg && <div style={{ background:'#d1fae5', color:'#065f46', padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:500 }}>{msg}</div>}
          <a href="/" style={{ color:'#6b7280', fontSize:13, textDecoration:'none', padding:'7px 16px', border:'1.5px solid #e5e7eb', borderRadius:20, fontWeight:500 }}>💬 บอท</a>
          <a href="/m" style={{ color:'#6b7280', fontSize:13, textDecoration:'none', padding:'7px 16px', border:'1.5px solid #e5e7eb', borderRadius:20, fontWeight:500 }}>👥 Member</a>
          <button onClick={logout} style={{ padding:'7px 18px', border:'1.5px solid #fee2e2', borderRadius:20, background:'#fff', color:'#ef4444', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>ออกจากระบบ</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px' }}>

        {/* Stats Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
          <div style={{ background:'linear-gradient(135deg,#14a085,#0d7377)', borderRadius:16, padding:'22px 24px', color:'#fff', boxShadow:'0 4px 15px rgba(13,115,119,0.3)' }}>
            <div style={{ fontSize:36, fontWeight:700, lineHeight:1 }}>{users.length}</div>
            <div style={{ fontSize:14, marginTop:6, opacity:0.9 }}>สมาชิกทั้งหมด</div>
          </div>
          <div style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius:16, padding:'22px 24px', color:'#fff', boxShadow:'0 4px 15px rgba(245,158,11,0.3)' }}>
            <div style={{ fontSize:36, fontWeight:700, lineHeight:1 }}>{kb.length}</div>
            <div style={{ fontSize:14, marginTop:6, opacity:0.9 }}>ฐานความรู้</div>
          </div>
          <div style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius:16, padding:'22px 24px', color:'#fff', boxShadow:'0 4px 15px rgba(99,102,241,0.3)' }}>
            <div style={{ fontSize:36, fontWeight:700, lineHeight:1 }}>{schedule.length}</div>
            <div style={{ fontSize:14, marginTop:6, opacity:0.9 }}>โปรโมชั่น & ประชุม</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {([
            ['members','👥 สมาชิก', users.length],
            ['kb','📝 ฐานความรู้', kb.length],
            ['schedule','📅 ตาราง/โปร', schedule.length],
            ['settings','⚙️ ตั้งค่าบอท', null],
          ] as [string,string,number|null][]).map(([id,label,count]) => (
            <button key={id} onClick={()=>setTab(id as typeof tab)} style={{
              padding:'9px 20px', borderRadius:30, border:'1.5px solid', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600, transition:'all .15s',
              borderColor: tab===id ? '#14a085' : '#e5e7eb',
              background: tab===id ? '#14a085' : '#fff',
              color: tab===id ? '#fff' : '#6b7280',
              boxShadow: tab===id ? '0 2px 8px rgba(20,160,133,0.3)' : 'none',
            }}>
              {label} {count !== null && <span style={{ background: tab===id?'rgba(255,255,255,0.25)':'#f3f4f6', borderRadius:12, padding:'1px 8px', fontSize:12, marginLeft:4 }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* ── MEMBERS TAB ── */}
        {tab==='members' && (
          <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div style={{ fontWeight:700, fontSize:17 }}>รายการสมาชิก</div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 ค้นหาชื่อ, เบอร์, รหัส..."
                style={{...ins, width:260, padding:'8px 14px'}} />
            </div>
            {filteredUsers.length===0 ? (
              <div style={{ padding:'48px', textAlign:'center', color:'#9ca3af' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
                <div>{search ? 'ไม่พบสมาชิกที่ค้นหา' : 'ยังไม่มีสมาชิกลงทะเบียน'}</div>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f9fafb' }}>
                    {['#','ชื่อ','เบอร์โทร','รหัส Ref','แนะนำโดย','วันที่','ลิงก์ Ref','จัดการ'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:13, fontWeight:600, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u,i) => (
                    <tr key={u.id} style={{ borderBottom:'1px solid #f9fafb', transition:'background .1s' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='#f9fafb')}
                      onMouseLeave={e=>(e.currentTarget.style.background='#fff')}>
                      <td style={{ padding:'14px 16px', color:'#9ca3af', fontSize:13 }}>{i+1}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#0d7377,#14a085)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#fff', fontWeight:700, flexShrink:0 }}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:14 }}>{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280' }}>{u.phone || '-'}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ background:'#f0fdf4', color:'#16a34a', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{u.refCode}</span>
                      </td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280' }}>{u.referredBy || '-'}</td>
                      <td style={{ padding:'14px 16px', fontSize:12, color:'#9ca3af' }}>{new Date(u.ts).toLocaleDateString('th-TH')}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <button onClick={()=>copyRef(u.refCode)} style={{ padding:'5px 12px', borderRadius:20, border:'1.5px solid #d1fae5', background:copiedRef===u.refCode?'#d1fae5':'#f0fdf4', color:'#16a34a', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                          {copiedRef===u.refCode ? '✅ คัดลอก' : '🔗 คัดลอก'}
                        </button>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <button onClick={()=>delUser(u.id,u.username)} style={{ padding:'5px 14px', borderRadius:20, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#ef4444', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── KB TAB ── */}
        {tab==='kb' && (
          <div>
            <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden', marginBottom:16 }}>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontWeight:700, fontSize:17 }}>ฐานความรู้บอท</div>
                <button onClick={()=>setShowAddKB(v=>!v)} style={{ padding:'9px 20px', borderRadius:20, border:'none', background:'#14a085', color:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                  {showAddKB ? '✕ ปิด' : '+ เพิ่มความรู้'}
                </button>
              </div>

              {showAddKB && (
                <div style={{ padding:'20px 24px', background:'#f9fafb', borderBottom:'1px solid #f3f4f6' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:14, alignItems:'start' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>หัวข้อ *</div>
                      <input style={ins} value={kbTitle} onChange={e=>setKbTitle(e.target.value)} placeholder="เช่น โปรโมชั่นเดือนนี้" />
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>เนื้อหา *</div>
                      <textarea style={{...ins,height:88,resize:'vertical',lineHeight:1.6}} value={kbContent} onChange={e=>setKbContent(e.target.value)} placeholder="ข้อมูลที่ต้องการให้บอทรู้..." />
                    </div>
                  </div>
                  <div style={{ marginTop:12, display:'flex', gap:8 }}>
                    <button onClick={addKB} disabled={!kbTitle.trim()||!kbContent.trim()||saving} style={{ padding:'10px 24px', borderRadius:20, border:'none', background:kbTitle.trim()&&kbContent.trim()?'#14a085':'#d1d5db', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:kbTitle.trim()?'pointer':'not-allowed' }}>
                      {saving?'⏳ กำลังบันทึก...':'💾 บันทึก'}
                    </button>
                    <button onClick={()=>setShowAddKB(false)} style={{ padding:'10px 20px', borderRadius:20, border:'1.5px solid #e5e7eb', background:'#fff', color:'#6b7280', fontFamily:'inherit', fontSize:14, cursor:'pointer' }}>ยกเลิก</button>
                  </div>
                </div>
              )}

              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f9fafb' }}>
                    {['#','หัวข้อ','เนื้อหา','วันที่เพิ่ม','จัดการ'].map(h=>(
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:13, fontWeight:600, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kb.length===0 && <tr><td colSpan={5} style={{ padding:'32px', textAlign:'center', color:'#9ca3af' }}>ยังไม่มีฐานความรู้</td></tr>}
                  {kb.map((e,i) => (
                    <tr key={e.id} style={{ borderBottom:'1px solid #f9fafb' }}
                      onMouseEnter={ev=>(ev.currentTarget.style.background='#f9fafb')}
                      onMouseLeave={ev=>(ev.currentTarget.style.background='#fff')}>
                      <td style={{ padding:'14px 16px', color:'#9ca3af', fontSize:13 }}>{i+1}</td>
                      <td style={{ padding:'14px 16px', fontWeight:600, fontSize:14, maxWidth:160 }}>{e.title}</td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280', maxWidth:300 }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.content}</div>
                      </td>
                      <td style={{ padding:'14px 16px', fontSize:12, color:'#9ca3af' }}>{new Date(e.ts).toLocaleDateString('th-TH')}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <button onClick={()=>delKB(e.id)} style={{ padding:'5px 14px', borderRadius:20, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#ef4444', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab==='schedule' && (
          <div>
            <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontWeight:700, fontSize:17 }}>โปรโมชั่น & ตารางประชุม</div>
                <button onClick={()=>setShowAddSch(v=>!v)} style={{ padding:'9px 20px', borderRadius:20, border:'none', background:'#6366f1', color:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                  {showAddSch ? '✕ ปิด' : '+ เพิ่มรายการ'}
                </button>
              </div>

              {showAddSch && (
                <div style={{ padding:'20px 24px', background:'#f9fafb', borderBottom:'1px solid #f3f4f6' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>ประเภท</div>
                      <select style={ins} value={schForm.type} onChange={e=>schUp('type')(e.target.value)}>
                        <option value="promo">⚡ โปรโมชั่น</option>
                        <option value="meeting">📅 ประชุม</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>สัปดาห์</div>
                      <select style={ins} value={schForm.week} onChange={e=>schUp('week')(Number(e.target.value))}>
                        {WEEKS.map((w,i)=><option key={i} value={i}>{w}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>วัน</div>
                      <select style={ins} value={schForm.day} onChange={e=>schUp('day')(Number(e.target.value))}>
                        {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>ชื่อ *</div>
                      <input style={ins} value={schForm.title} onChange={e=>schUp('title')(e.target.value)} placeholder="ชื่อโปรหรือประชุม" />
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>รายละเอียด</div>
                      <input style={ins} value={schForm.type==='promo'?schForm.desc:schForm.location} onChange={e=>schUp(schForm.type==='promo'?'desc':'location')(e.target.value)} placeholder={schForm.type==='promo'?'เงื่อนไข...':'สถานที่/ลิงก์...'} />
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>เวลาเริ่ม</div>
                      <input type="time" style={ins} value={schForm.startTime} onChange={e=>schUp('startTime')(e.target.value)} />
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>เวลาสิ้นสุด</div>
                      <input type="time" style={ins} value={schForm.endTime} onChange={e=>schUp('endTime')(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={addSch} disabled={!schForm.title.trim()||saving} style={{ padding:'10px 24px', borderRadius:20, border:'none', background:schForm.title.trim()?'#6366f1':'#d1d5db', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:schForm.title.trim()?'pointer':'not-allowed' }}>
                      {saving?'⏳':'💾 บันทึก'}
                    </button>
                    <button onClick={()=>setShowAddSch(false)} style={{ padding:'10px 20px', borderRadius:20, border:'1.5px solid #e5e7eb', background:'#fff', color:'#6b7280', fontFamily:'inherit', fontSize:14, cursor:'pointer' }}>ยกเลิก</button>
                  </div>
                </div>
              )}

              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f9fafb' }}>
                    {['#','ประเภท','ชื่อ','สัปดาห์/วัน','เวลา','รายละเอียด','จัดการ'].map(h=>(
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:13, fontWeight:600, color:'#6b7280', borderBottom:'1px solid #f3f4f6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.length===0 && <tr><td colSpan={7} style={{ padding:'32px', textAlign:'center', color:'#9ca3af' }}>ยังไม่มีรายการ</td></tr>}
                  {schedule.map((s,i) => (
                    <tr key={s.id} style={{ borderBottom:'1px solid #f9fafb' }}
                      onMouseEnter={ev=>(ev.currentTarget.style.background='#f9fafb')}
                      onMouseLeave={ev=>(ev.currentTarget.style.background='#fff')}>
                      <td style={{ padding:'14px 16px', color:'#9ca3af', fontSize:13 }}>{i+1}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:s.type==='promo'?'#fef3c7':'#ede9fe', color:s.type==='promo'?'#d97706':'#6d28d9' }}>
                          {s.type==='promo'?'⚡ โปร':'📅 ประชุม'}
                        </span>
                      </td>
                      <td style={{ padding:'14px 16px', fontWeight:600, fontSize:14 }}>{s.title}</td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280' }}>{WEEKS[s.week]} {DAYS[s.day]}</td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280' }}>{s.startTime}–{s.endTime}</td>
                      <td style={{ padding:'14px 16px', fontSize:13, color:'#6b7280', maxWidth:200 }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.desc||s.location||'-'}</div>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <button onClick={()=>delSch(s.id)} style={{ padding:'5px 14px', borderRadius:20, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#ef4444', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab==='settings' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', padding:'24px' }}>
              <div style={{ fontWeight:700, fontSize:17, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>📅 ตาราง Zoom ประจำสัปดาห์</div>
              <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontWeight:600, fontSize:15, color:'#92400e', marginBottom:8 }}>✍️ รายการคนรักสุขภาพ</div>
                <div style={{ fontSize:14, color:'#78350f', lineHeight:2 }}>
                  🗓 ทุกวันจันทร์–ศุกร์ เวลา 07:00–08:30 น.<br/>
                  🔹 Meeting ID: <strong>568 239 4879</strong><br/>
                  🔹 Passcode: <strong>6666</strong><br/>
                  <a href="https://us06web.zoom.us/j/5682394879?pwd=cApWGQrBAsiUbOnb1VnFIe7jGFu9kx.1" target="_blank" style={{ color:'#0d7377', fontWeight:600 }}>💻 เข้าร่วม Zoom</a>
                </div>
              </div>
            </div>

            <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', padding:'24px' }}>
              <div style={{ fontWeight:700, fontSize:17, marginBottom:16 }}>🔗 ลิงก์ระบบ</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  ['🤖 หน้าบอท','/'],
                  ['👥 Member Page','/m'],
                  ['🔐 Admin Login','/admin/login'],
                  ['🔍 Diagnostic','/api/test'],
                  ['📘 Facebook','https://www.facebook.com/OlyLifeGlobalByVibeVerse/'],
                  ['🎬 YouTube VTR','https://youtu.be/UIv5jff0POo'],
                ].map(([label,url],i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, border:'1.5px solid #f3f4f6', color:'#1f2937', textDecoration:'none', fontSize:14, transition:'background .15s' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='#f9fafb')}
                    onMouseLeave={e=>(e.currentTarget.style.background='#fff')}>
                    <span>{label}</span>
                    <span style={{ color:'#9ca3af', fontSize:12 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
