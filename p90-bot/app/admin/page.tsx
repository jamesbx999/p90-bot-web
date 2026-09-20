'use client';
import { useState, useEffect, useRef } from 'react';

interface UserData {
  id: string; username: string; phone: string; refCode: string;
  referredBy?: string; lineUrl?: string; messengerUrl?: string;
  profileImg?: string; refBaseUrl?: string; heroTitle?: string;
  createdByAdmin?: boolean; ts: number;
}
interface KBEntry { id: string; title: string; content: string; ts: number; }
interface ScheduleItem { id: string; type: 'promo'|'meeting'; week: number; day: number; category: string; title: string; desc: string; startTime: string; endTime: string; location?: string; }
interface SiteSettings {
  brandName: string; tagline: string; subTagline: string; welcomeMsg: string;
  phone: string; lineUrl: string; messengerUrl: string; facebookUrl: string;
  incomePlan: string; poster1: string; poster2: string; poster3: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'OlyLife THZ Tera-P90+', tagline: 'ถามทุกเรื่องสินค้า ให้ AI ตอบแทนคุณ',
  subTagline: 'ผู้ช่วย AI 24 ชั่วโมง เทคโนโลยี PEMF & Terahertz', welcomeMsg: 'สวัสดีค่ะ! ฉันชื่อ โอลี่ 🌿',
  phone: '', lineUrl: '', messengerUrl: '',
  facebookUrl: 'https://www.facebook.com/OlyLifeGlobalByVibeVerse/',
  incomePlan: '', poster1: '', poster2: '', poster3: '',
};

const BLANK_MEMBER = { username:'', slug:'', phone:'', lineUrl:'', messengerUrl:'', profileImg:'', refBaseUrl:'', heroTitle:'' };
const DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const WEEKS = ['สัปดาห์ที่ 1','สัปดาห์ที่ 2','สัปดาห์ที่ 3','สัปดาห์ที่ 4'];
const GR = '#14a085'; const GR2 = '#0d7377'; const GLIGHT = '#f0fdf4';

const ins: React.CSSProperties = { width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#1f2937', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };

function getToken() { return document.cookie.split(';').find(c=>c.trim().startsWith('admin-token='))?.split('=')[1]?.trim()||''; }
async function api(url: string, method='GET', body?: object) {
  const res = await fetch(url, { method, headers:{'Content-Type':'application/json','x-admin-token':getToken()}, body:body?JSON.stringify(body):undefined });
  return res.json();
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 800 / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9\u0E00-\u0E7F]/g,'').slice(0,12);
}

export default function AdminPage() {
  const [tab, setTab] = useState<'members'|'kb'|'schedule'|'settings'>('members');
  const [users, setUsers] = useState<UserData[]>([]);
  const [kb, setKb] = useState<KBEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [copiedRef, setCopiedRef] = useState('');
  const [saving, setSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState(BLANK_MEMBER);
  const [memberSaving, setMemberSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [kbTitle, setKbTitle] = useState(''); const [kbContent, setKbContent] = useState('');
  const [showAddKB, setShowAddKB] = useState(false); const [showAddSch, setShowAddSch] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState<string|null>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const posterRefs = { poster1:useRef<HTMLInputElement>(null), poster2:useRef<HTMLInputElement>(null), poster3:useRef<HTMLInputElement>(null) };
  const [schForm, setSchForm] = useState({ type:'promo', week:0, day:1, category:'flash', title:'', desc:'', startTime:'09:00', endTime:'18:00', location:'', note:'' });

  const notify = (m: string) => { setMsg(m); setTimeout(()=>setMsg(''),3000); };
  const schUp = (k: string) => (v: string|number) => setSchForm((p: typeof schForm)=>({...p,[k]:v}));
  const mUp = (k: string) => (v: string) => setMemberForm(p=>({...p,[k]:v}));

  useEffect(()=>{
    api('/api/users').then(setUsers).catch(()=>{});
    api('/api/kb').then(setKb).catch(()=>{});
    api('/api/schedule').then(setSchedule).catch(()=>{});
    api('/api/settings').then(s=>setSettings({...DEFAULT_SETTINGS,...s})).catch(()=>{});
  },[]);

  // ── Auto slug from name ──
  useEffect(()=>{
    if (!memberForm.username) return;
    const s = slugify(memberForm.username);
    setMemberForm(p => p.slug===''||p.slug===slugify(p.username.slice(0,-1)) ? {...p,slug:s} : p);
  },[memberForm.username]);

  // ── Upload image helper ──
  const uploadImg = async (file: File): Promise<string|null> => {
    try {
      const base64 = await resizeImage(file);
      const r = await api('/api/img','POST',{data:base64});
      return r.url || null;
    } catch { return null; }
  };

  // ── Profile photo upload ──
  const handleProfileUpload = async (file: File) => {
    setUploadingProfile(true);
    const url = await uploadImg(file);
    if (url) { setMemberForm(p=>({...p,profileImg:url})); notify('อัปโหลดรูปโปรไฟล์แล้ว!'); }
    else notify('อัปโหลดไม่สำเร็จ');
    setUploadingProfile(false);
  };

  // ── Add Member ──
  const addMember = async () => {
    if (!memberForm.username.trim()) return;
    setMemberSaving(true);
    const newUser = await api('/api/users','POST',{
      username: memberForm.username.trim(),
      phone: memberForm.phone,
      slug: memberForm.slug || undefined,
      lineUrl: memberForm.lineUrl,
      messengerUrl: memberForm.messengerUrl,
      profileImg: memberForm.profileImg,
      refBaseUrl: memberForm.refBaseUrl,
      heroTitle: memberForm.heroTitle,
      createdByAdmin: true,
    });
    if (!newUser.error) {
      setUsers(p=>[newUser,...p]);
      setMemberForm(BLANK_MEMBER);
      setShowAddMember(false);
      notify('เพิ่มสมาชิกแล้ว!');
    } else { notify(newUser.error); }
    setMemberSaving(false);
  };

  const delUser = async (id: string, name: string) => {
    if (!confirm('ลบสมาชิก "'+name+'"?')) return;
    await api('/api/users?id='+id,'DELETE');
    setUsers(p=>p.filter(u=>u.id!==id)); notify('ลบสมาชิกแล้ว');
  };

  const copyRef = (code: string) => {
    navigator.clipboard?.writeText(window.location.origin+'/m?ref='+code).then(()=>{
      setCopiedRef(code); setTimeout(()=>setCopiedRef(''),2000);
    });
  };

  // ── KB ──
  const addKB = async () => {
    if (!kbTitle.trim()||!kbContent.trim()) return;
    setSaving(true);
    const e = await api('/api/kb','POST',{title:kbTitle.trim(),content:kbContent.trim()});
    setKb(p=>[e,...p]); setKbTitle(''); setKbContent(''); setShowAddKB(false); notify('เพิ่มความรู้แล้ว!'); setSaving(false);
  };
  const delKB = async (id: string) => { if(!confirm('ลบ?'))return; await api('/api/kb?id='+id,'DELETE'); setKb(p=>p.filter(e=>e.id!==id)); notify('ลบแล้ว'); };

  // ── Schedule ──
  const addSch = async () => {
    if (!schForm.title.trim()) return;
    setSaving(true);
    const item = await api('/api/schedule','POST',schForm);
    setSchedule(p=>[item,...p]); setSchForm(s=>({...s,title:'',desc:'',location:'',note:''})); setShowAddSch(false); notify('เพิ่มตารางแล้ว!'); setSaving(false);
  };
  const delSch = async (id: string) => { if(!confirm('ลบ?'))return; await api('/api/schedule?id='+id,'DELETE'); setSchedule(p=>p.filter(i=>i.id!==id)); notify('ลบแล้ว'); };

  // ── Poster upload ──
  const handlePosterUpload = async (key: 'poster1'|'poster2'|'poster3', file: File) => {
    setUploadingPoster(key);
    const url = await uploadImg(file);
    if (url) { setSettings(p=>({...p,[key]:url})); notify('อัปโหลดรูปแล้ว!'); }
    else notify('อัปโหลดไม่สำเร็จ');
    setUploadingPoster(null);
  };
  const delPoster = (k: 'poster1'|'poster2'|'poster3') => { setSettings(p=>({...p,[k]:''})); notify('ลบรูปแล้ว'); };

  const saveSettings = async () => {
    setSaving(true); await api('/api/settings','POST',settings); setSettingsSaved(true); setTimeout(()=>setSettingsSaved(false),2000); notify('บันทึกแล้ว!'); setSaving(false);
  };
  const logout = async () => { await fetch('/api/auth',{method:'DELETE'}); window.location.href='/admin/login'; };
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())||u.phone.includes(search)||u.refCode.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', fontFamily:'Sarabun,sans-serif', color:'#1f2937' }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#0d7377,#14a085)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>🌿</div>
          <div>
            <div style={{ fontWeight:700,fontSize:17 }}>OlyLife P90+ Admin</div>
            <div style={{ fontSize:12,color:'#6b7280' }}>ระบบจัดการบอทและสมาชิก</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {msg && <div style={{ background:'#d1fae5', color:'#065f46', padding:'6px 16px', borderRadius:20, fontSize:13 }}>{msg}</div>}
          <a href="/" style={{ color:'#6b7280',fontSize:13,textDecoration:'none',padding:'7px 16px',border:'1.5px solid #e5e7eb',borderRadius:20 }}>💬 บอท</a>
          <a href="/m" style={{ color:'#6b7280',fontSize:13,textDecoration:'none',padding:'7px 16px',border:'1.5px solid #e5e7eb',borderRadius:20 }}>👥 Member</a>
          <button onClick={logout} style={{ padding:'7px 18px',border:'1.5px solid #fee2e2',borderRadius:20,background:'#fff',color:'#ef4444',fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>ออกจากระบบ</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px' }}>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
          {[
            { label:'สมาชิกทั้งหมด', val:users.length, bg:'linear-gradient(135deg,#0d7377,#14a085)', sh:'#14a085' },
            { label:'ฐานความรู้', val:kb.length, bg:'linear-gradient(135deg,#d97706,#f59e0b)', sh:'#f59e0b' },
            { label:'โปรโมชั่น & ประชุม', val:schedule.length, bg:'linear-gradient(135deg,#6d28d9,#8b5cf6)', sh:'#8b5cf6' },
          ].map((s,i)=>(
            <div key={i} style={{ background:s.bg, borderRadius:16, padding:'22px 24px', color:'#fff', boxShadow:'0 4px 15px '+s.sh+'44' }}>
              <div style={{ fontSize:38,fontWeight:800,lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:14,marginTop:8,opacity:.9 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {([['members','👥 สมาชิก',users.length],['kb','📝 ฐานความรู้',kb.length],['schedule','📅 ตาราง/โปร',schedule.length],['settings','⚙️ ตั้งค่าบอท',null]] as [string,string,number|null][]).map(([id,label,count])=>(
            <button key={id} onClick={()=>setTab(id as typeof tab)} style={{ padding:'9px 20px',borderRadius:30,border:'1.5px solid',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:600, borderColor:tab===id?GR:'#e5e7eb', background:tab===id?GR:'#fff', color:tab===id?'#fff':'#6b7280', boxShadow:tab===id?'0 2px 8px #14a08555':'none' }}>
              {label}{count!==null&&<span style={{ background:tab===id?'rgba(255,255,255,0.25)':'#f3f4f6',borderRadius:12,padding:'1px 8px',fontSize:12,marginLeft:6 }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* ══ MEMBERS TAB ══ */}
        {tab==='members' && (
          <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div style={{ fontWeight:700,fontSize:17 }}>รายชื่อสมาชิก</div>
              <div style={{ display:'flex', gap:10 }}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 ค้นหา..." style={{...ins,width:220,padding:'8px 14px'}} />
                <button onClick={()=>setShowAddMember(true)} style={{ padding:'9px 20px',borderRadius:20,border:'none',background:GR,color:'#fff',fontSize:14,cursor:'pointer',fontFamily:'inherit',fontWeight:700,whiteSpace:'nowrap' }}>
                  + เพิ่มสมาชิก
                </button>
              </div>
            </div>
            {filteredUsers.length===0 ? (
              <div style={{ padding:'56px', textAlign:'center', color:'#9ca3af' }}>
                <div style={{ fontSize:48,marginBottom:12 }}>👥</div>
                <div style={{ fontWeight:600,marginBottom:6 }}>{search?'ไม่พบสมาชิก':'ยังไม่มีสมาชิก'}</div>
                <div style={{ fontSize:13 }}>กด "+ เพิ่มสมาชิก" เพื่อสร้างหน้าเว็บส่วนตัว</div>
                <div style={{ fontSize:13,color:'#6b7280' }}>แต่ละคนจะได้หน้า /m?ref=CODE ที่มีบอท AI + ลิงก์ติดต่อของตัวเอง</div>
              </div>
            ) : (
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#f9fafb' }}>
                    {['#','สมาชิก','เบอร์/LINE','รหัส Ref','แนะนำโดย','วันที่','ลิงก์','จัดการ'].map(h=>(
                      <th key={h} style={{ padding:'12px 16px',textAlign:'left',fontSize:13,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #f3f4f6',whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u,i)=>(
                    <tr key={u.id} style={{ borderBottom:'1px solid #f9fafb' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='#f9fafb')}
                      onMouseLeave={e=>(e.currentTarget.style.background='#fff')}>
                      <td style={{ padding:'12px 16px',color:'#9ca3af',fontSize:13 }}>{i+1}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                          {u.profileImg ? (
                            <img src={u.profileImg} alt="" style={{ width:38,height:38,borderRadius:'50%',objectFit:'cover',border:'2px solid #d1fae5' }} onError={e=>(e.currentTarget.style.display='none')} />
                          ) : (
                            <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#0d7377,#14a085)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#fff',fontWeight:700,flexShrink:0 }}>
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight:600,fontSize:14 }}>{u.username}</div>
                            {u.createdByAdmin && <div style={{ fontSize:11,color:GR }}>✦ สร้างโดย Admin</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px',fontSize:12,color:'#6b7280' }}>
                        {u.phone && <div>📞 {u.phone}</div>}
                        {u.lineUrl && <div><a href={u.lineUrl} target="_blank" rel="noreferrer" style={{color:GR}}>💬 LINE</a></div>}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:GLIGHT,color:'#16a34a',padding:'3px 12px',borderRadius:20,fontSize:12,fontWeight:700 }}>{u.refCode}</span>
                      </td>
                      <td style={{ padding:'12px 16px',fontSize:13,color:'#6b7280' }}>{u.referredBy||'-'}</td>
                      <td style={{ padding:'12px 16px',fontSize:12,color:'#9ca3af',whiteSpace:'nowrap' }}>{new Date(u.ts).toLocaleDateString('th-TH')}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <button onClick={()=>copyRef(u.refCode)} style={{ padding:'5px 12px',borderRadius:20,border:'1.5px solid #bbf7d0',background:copiedRef===u.refCode?'#d1fae5':GLIGHT,color:'#16a34a',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>
                          {copiedRef===u.refCode?'✅':'🔗 คัดลอก'}
                        </button>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <button onClick={()=>delUser(u.id,u.username)} style={{ padding:'5px 14px',borderRadius:20,border:'1.5px solid #fecaca',background:'#fef2f2',color:'#ef4444',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ══ KB TAB ══ */}
        {tab==='kb' && (
          <div style={{ background:'#fff',borderRadius:16,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',overflow:'hidden' }}>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div style={{ fontWeight:700,fontSize:17 }}>ฐานความรู้บอท</div>
              <button onClick={()=>setShowAddKB(v=>!v)} style={{ padding:'9px 20px',borderRadius:20,border:'none',background:GR,color:'#fff',fontSize:14,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>
                {showAddKB?'✕ ปิด':'+ เพิ่มความรู้'}
              </button>
            </div>
            {showAddKB && (
              <div style={{ padding:'20px 24px',background:'#f9fafb',borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 2fr',gap:14,alignItems:'start',marginBottom:12 }}>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>หัวข้อ *</div><input style={ins} value={kbTitle} onChange={e=>setKbTitle(e.target.value)} placeholder="เช่น โปรโมชั่นเดือนนี้" /></div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>เนื้อหา *</div><textarea style={{...ins,height:80,resize:'vertical'}} value={kbContent} onChange={e=>setKbContent(e.target.value)} placeholder="ข้อมูลที่ต้องการให้บอทรู้..." /></div>
                </div>
                <div style={{ display:'flex',gap:8 }}>
                  <button onClick={addKB} disabled={!kbTitle.trim()||!kbContent.trim()||saving} style={{ padding:'10px 24px',borderRadius:20,border:'none',background:kbTitle.trim()&&kbContent.trim()?GR:'#d1d5db',color:'#fff',fontFamily:'inherit',fontSize:14,fontWeight:600,cursor:kbTitle.trim()?'pointer':'not-allowed' }}>{saving?'⏳':'💾 บันทึก'}</button>
                  <button onClick={()=>setShowAddKB(false)} style={{ padding:'10px 20px',borderRadius:20,border:'1.5px solid #e5e7eb',background:'#fff',color:'#6b7280',fontFamily:'inherit',fontSize:14,cursor:'pointer' }}>ยกเลิก</button>
                </div>
              </div>
            )}
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'#f9fafb' }}>{['#','หัวข้อ','เนื้อหา','วันที่','จัดการ'].map(h=><th key={h} style={{ padding:'12px 16px',textAlign:'left',fontSize:13,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #f3f4f6' }}>{h}</th>)}</tr></thead>
              <tbody>
                {kb.length===0&&<tr><td colSpan={5} style={{ padding:'40px',textAlign:'center',color:'#9ca3af' }}>ยังไม่มีฐานความรู้</td></tr>}
                {kb.map((e,i)=>(
                  <tr key={e.id} style={{ borderBottom:'1px solid #f9fafb' }} onMouseEnter={ev=>(ev.currentTarget.style.background='#f9fafb')} onMouseLeave={ev=>(ev.currentTarget.style.background='#fff')}>
                    <td style={{ padding:'14px 16px',color:'#9ca3af',fontSize:13 }}>{i+1}</td>
                    <td style={{ padding:'14px 16px',fontWeight:600,fontSize:14 }}>{e.title}</td>
                    <td style={{ padding:'14px 16px',fontSize:13,color:'#6b7280',maxWidth:340 }}><div style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{e.content}</div></td>
                    <td style={{ padding:'14px 16px',fontSize:12,color:'#9ca3af' }}>{new Date(e.ts).toLocaleDateString('th-TH')}</td>
                    <td style={{ padding:'14px 16px' }}><button onClick={()=>delKB(e.id)} style={{ padding:'5px 14px',borderRadius:20,border:'1.5px solid #fecaca',background:'#fef2f2',color:'#ef4444',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>ลบ</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ SCHEDULE TAB ══ */}
        {tab==='schedule' && (
          <div style={{ background:'#fff',borderRadius:16,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',overflow:'hidden' }}>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div style={{ fontWeight:700,fontSize:17 }}>โปรโมชั่น & ตารางประชุม</div>
              <button onClick={()=>setShowAddSch(v=>!v)} style={{ padding:'9px 20px',borderRadius:20,border:'none',background:'#6366f1',color:'#fff',fontSize:14,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>{showAddSch?'✕ ปิด':'+ เพิ่มรายการ'}</button>
            </div>
            {showAddSch && (
              <div style={{ padding:'20px 24px',background:'#f9fafb',borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:12 }}>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>ประเภท</div><select style={ins} value={schForm.type} onChange={e=>schUp('type')(e.target.value)}><option value="promo">โปรโมชั่น</option><option value="meeting">ประชุม</option></select></div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>สัปดาห์</div><select style={ins} value={schForm.week} onChange={e=>schUp('week')(Number(e.target.value))}>{WEEKS.map((w,i)=><option key={i} value={i}>{w}</option>)}</select></div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>วัน</div><select style={ins} value={schForm.day} onChange={e=>schUp('day')(Number(e.target.value))}>{DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}</select></div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>ชื่อ *</div><input style={ins} value={schForm.title} onChange={e=>schUp('title')(e.target.value)} placeholder="ชื่อโปรหรือประชุม" /></div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>{schForm.type==='promo'?'รายละเอียด':'สถานที่/ลิงก์'}</div><input style={ins} value={schForm.type==='promo'?schForm.desc:schForm.location} onChange={e=>schUp(schForm.type==='promo'?'desc':'location')(e.target.value)} placeholder={schForm.type==='promo'?'เงื่อนไข...':'Zoom link...'} /></div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>เวลาเริ่ม</div><input type="time" style={ins} value={schForm.startTime} onChange={e=>schUp('startTime')(e.target.value)} /></div>
                  <div><div style={{ fontSize:13,fontWeight:600,color:'#374151',marginBottom:6 }}>เวลาสิ้นสุด</div><input type="time" style={ins} value={schForm.endTime} onChange={e=>schUp('endTime')(e.target.value)} /></div>
                </div>
                <div style={{ display:'flex',gap:8 }}>
                  <button onClick={addSch} disabled={!schForm.title.trim()||saving} style={{ padding:'10px 24px',borderRadius:20,border:'none',background:schForm.title.trim()?'#6366f1':'#d1d5db',color:'#fff',fontFamily:'inherit',fontSize:14,fontWeight:600,cursor:schForm.title.trim()?'pointer':'not-allowed' }}>{saving?'⏳':'💾 บันทึก'}</button>
                  <button onClick={()=>setShowAddSch(false)} style={{ padding:'10px 20px',borderRadius:20,border:'1.5px solid #e5e7eb',background:'#fff',color:'#6b7280',fontFamily:'inherit',fontSize:14,cursor:'pointer' }}>ยกเลิก</button>
                </div>
              </div>
            )}
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'#f9fafb' }}>{['#','ประเภท','ชื่อ','สัปดาห์/วัน','เวลา','จัดการ'].map(h=><th key={h} style={{ padding:'12px 16px',textAlign:'left',fontSize:13,fontWeight:600,color:'#6b7280',borderBottom:'1px solid #f3f4f6' }}>{h}</th>)}</tr></thead>
              <tbody>
                {schedule.length===0&&<tr><td colSpan={6} style={{ padding:'40px',textAlign:'center',color:'#9ca3af' }}>ยังไม่มีรายการ</td></tr>}
                {schedule.map((s,i)=>(
                  <tr key={s.id} style={{ borderBottom:'1px solid #f9fafb' }} onMouseEnter={ev=>(ev.currentTarget.style.background='#f9fafb')} onMouseLeave={ev=>(ev.currentTarget.style.background='#fff')}>
                    <td style={{ padding:'14px 16px',color:'#9ca3af',fontSize:13 }}>{i+1}</td>
                    <td style={{ padding:'14px 16px' }}><span style={{ padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,background:s.type==='promo'?'#fef3c7':'#ede9fe',color:s.type==='promo'?'#d97706':'#6d28d9' }}>{s.type==='promo'?'โปร':'ประชุม'}</span></td>
                    <td style={{ padding:'14px 16px',fontWeight:600,fontSize:14 }}>{s.title}</td>
                    <td style={{ padding:'14px 16px',fontSize:13,color:'#6b7280' }}>{WEEKS[s.week]} {DAYS[s.day]}</td>
                    <td style={{ padding:'14px 16px',fontSize:13,color:'#6b7280',whiteSpace:'nowrap' }}>{s.startTime}–{s.endTime}</td>
                    <td style={{ padding:'14px 16px' }}><button onClick={()=>delSch(s.id)} style={{ padding:'5px 14px',borderRadius:20,border:'1.5px solid #fecaca',background:'#fef2f2',color:'#ef4444',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>ลบ</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {tab==='settings' && (
          <div style={{ background:'#fff',borderRadius:16,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',overflow:'hidden' }}>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f3f4f6' }}>
              <div style={{ fontWeight:700,fontSize:17 }}>ตั้งค่าแบรนด์ / บอท / แผนรายได้</div>
              <div style={{ color:'#6b7280',fontSize:13,marginTop:4 }}>ข้อมูลนี้จะแสดงในหน้า /m?ref=CODE</div>
            </div>
            <div style={{ padding:'24px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
              <div><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ชื่อแบรนด์</div><input style={ins} value={settings.brandName} onChange={e=>setSettings(p=>({...p,brandName:e.target.value}))} /></div>
              <div><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ลิงก์ Facebook</div><input style={ins} value={settings.facebookUrl} onChange={e=>setSettings(p=>({...p,facebookUrl:e.target.value}))} /></div>
              <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>คำโปรย หลัก</div><input style={ins} value={settings.tagline} onChange={e=>setSettings(p=>({...p,tagline:e.target.value}))} /></div>
              <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>คำโปรย รอง</div><input style={ins} value={settings.subTagline} onChange={e=>setSettings(p=>({...p,subTagline:e.target.value}))} /></div>
              <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ข้อความต้อนรับบอท</div><textarea style={{...ins,height:80,resize:'vertical'}} value={settings.welcomeMsg} onChange={e=>setSettings(p=>({...p,welcomeMsg:e.target.value}))} /></div>
              <div><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>เบอร์โทร</div><input style={ins} value={settings.phone} onChange={e=>setSettings(p=>({...p,phone:e.target.value}))} placeholder="08x-xxx-xxxx" /></div>
              <div><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ลิงก์ LINE</div><input style={ins} value={settings.lineUrl} onChange={e=>setSettings(p=>({...p,lineUrl:e.target.value}))} placeholder="https://line.me/..." /></div>
              <div><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ลิงก์ Messenger</div><input style={ins} value={settings.messengerUrl} onChange={e=>setSettings(p=>({...p,messengerUrl:e.target.value}))} placeholder="https://m.me/..." /></div>
              <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>แผนรายได้</div><textarea style={{...ins,height:120,resize:'vertical',lineHeight:1.8}} value={settings.incomePlan} onChange={e=>setSettings(p=>({...p,incomePlan:e.target.value}))} placeholder={'ผัง Matrix\nระบบ BFS Global Queue...'} /></div>
              <div style={{ gridColumn:'1/-1' }}>
                <div style={{ fontSize:14,fontWeight:700,color:GR,marginBottom:14 }}>ภาพโปสเตอร์แผนรายได้ (สูงสุด 3 ภาพ)</div>
                {(['poster1','poster2','poster3'] as const).map((k,i)=>(
                  <div key={k} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:8 }}>โปสเตอร์ {i+1}</div>
                    <div style={{ display:'flex',gap:12,alignItems:'flex-start' }}>
                      <div style={{ width:90,height:90,borderRadius:12,border:'2px dashed #d1d5db',background:settings[k]?'transparent':'#f9fafb',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0,position:'relative' }}>
                        {settings[k]?<img src={settings[k]} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>(e.currentTarget.style.display='none')} />:<span style={{ fontSize:28,opacity:.3 }}>🖼️</span>}
                        {uploadingPoster===k&&<div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center' }}>⏳</div>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex',gap:8,marginBottom:8 }}>
                          <input type="file" accept="image/*" ref={posterRefs[k]} style={{ display:'none' }} onChange={e=>{const f=e.target.files?.[0];if(f)handlePosterUpload(k,f);e.target.value='';}} />
                          <button onClick={()=>posterRefs[k].current?.click()} disabled={uploadingPoster===k} style={{ padding:'7px 16px',borderRadius:20,border:'1.5px solid #bbf7d0',background:GLIGHT,color:'#16a34a',fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>📤 อัปโหลด</button>
                          {settings[k]&&<button onClick={()=>delPoster(k)} style={{ padding:'7px 16px',borderRadius:20,border:'1.5px solid #fecaca',background:'#fef2f2',color:'#ef4444',fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>🗑 ลบรูป</button>}
                        </div>
                        <input style={{...ins,fontSize:12}} value={settings[k]} onChange={e=>setSettings(p=>({...p,[k]:e.target.value}))} placeholder="หรือวาง URL ภาพตรงนี้" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding:'0 24px 24px',display:'flex',justifyContent:'flex-end',gap:10 }}>
              <button onClick={()=>setSettings(DEFAULT_SETTINGS)} style={{ padding:'11px 24px',borderRadius:20,border:'1.5px solid #e5e7eb',background:'#fff',color:'#6b7280',fontFamily:'inherit',fontSize:14,cursor:'pointer' }}>รีเซ็ต</button>
              <button onClick={saveSettings} disabled={saving} style={{ padding:'11px 32px',borderRadius:20,border:'none',background:'linear-gradient(135deg,#0d7377,#14a085)',color:'#fff',fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 10px #14a08555' }}>
                {saving?'กำลังบันทึก...':settingsSaved?'✅ บันทึกแล้ว!':'💾 บันทึกการตั้งค่า'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ ADD MEMBER MODAL ══ */}
      {showAddMember && (
        <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={e=>e.target===e.currentTarget&&setShowAddMember(false)}>
          <div style={{ background:'#fff',borderRadius:20,padding:0,width:'min(95vw,600px)',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 32px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ padding:'22px 24px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:'#fff',zIndex:1 }}>
              <div style={{ fontWeight:700,fontSize:18,color:'#1f2937' }}>เพิ่มสมาชิกใหม่</div>
              <button onClick={()=>setShowAddMember(false)} style={{ width:32,height:32,borderRadius:'50%',border:'1.5px solid #e5e7eb',background:'#fff',color:'#6b7280',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
            </div>
            <div style={{ padding:'24px' }}>
              {/* Name + Slug */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ชื่อที่แสดง *</div>
                  <input style={ins} value={memberForm.username} onChange={e=>mUp('username')(e.target.value)} placeholder="เช่น โค้ชเพชร" />
                </div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>slug (รหัส Ref) *</div>
                  <input style={ins} value={memberForm.slug} onChange={e=>mUp('slug')(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10))} placeholder="เช่น PETCH" />
                  <div style={{ fontSize:11,color:'#9ca3af',marginTop:4 }}>ลิงก์: /m?ref={memberForm.slug||'CODE'}</div>
                </div>
              </div>

              {/* Ref Base URL */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ลิงก์สมัครส่วนตัว OlyLife (ref link)</div>
                <input style={ins} value={memberForm.refBaseUrl} onChange={e=>mUp('refBaseUrl')(e.target.value)} placeholder="https://olylifeint.com/register?ref=..." />
              </div>

              {/* Phone + LINE */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>เบอร์โทร</div>
                  <input style={ins} value={memberForm.phone} onChange={e=>mUp('phone')(e.target.value)} placeholder="0812345678" />
                </div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ลิงก์ไลน์ (LINE)</div>
                  <input style={ins} value={memberForm.lineUrl} onChange={e=>mUp('lineUrl')(e.target.value)} placeholder="https://line.me/ti/p/~id" />
                </div>
              </div>

              {/* Messenger */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>ลิงก์ Messenger</div>
                <input style={ins} value={memberForm.messengerUrl} onChange={e=>mUp('messengerUrl')(e.target.value)} placeholder="https://m.me/username" />
              </div>

              {/* Profile Photo */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:8 }}>รูปโปรไฟล์</div>
                <div style={{ display:'flex',gap:14,alignItems:'center' }}>
                  <div style={{ width:72,height:72,borderRadius:'50%',border:'2px dashed #d1d5db',background:'#f9fafb',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0,position:'relative' }}>
                    {memberForm.profileImg?<img src={memberForm.profileImg} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />:<span style={{ fontSize:28,opacity:.3 }}>👤</span>}
                    {uploadingProfile&&<div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center' }}>⏳</div>}
                  </div>
                  <div style={{ flex:1 }}>
                    <input type="file" accept="image/*" ref={profileFileRef} style={{ display:'none' }} onChange={e=>{const f=e.target.files?.[0];if(f)handleProfileUpload(f);e.target.value='';}} />
                    <button onClick={()=>profileFileRef.current?.click()} disabled={uploadingProfile} style={{ padding:'8px 18px',borderRadius:20,border:'1.5px solid #bbf7d0',background:GLIGHT,color:'#16a34a',fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600,marginBottom:8,display:'block' }}>
                      📤 {uploadingProfile?'กำลังอัปโหลด...':'อัปโหลดรูป'}
                    </button>
                    <input style={{...ins,fontSize:12}} value={memberForm.profileImg} onChange={e=>mUp('profileImg')(e.target.value)} placeholder="หรือวาง URL รูป" />
                  </div>
                </div>
              </div>

              {/* Hero Title */}
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:13,fontWeight:600,color:GR,marginBottom:6 }}>หัวข้อ hero (เว้นว่าง = ค่าเริ่มต้น)</div>
                <input style={ins} value={memberForm.heroTitle} onChange={e=>mUp('heroTitle')(e.target.value)} placeholder="เช่น สุขภาพดี *เริ่มที่นี่*" />
                <div style={{ fontSize:11,color:'#9ca3af',marginTop:4 }}>ครอบคำด้วย *...* ให้เป็นสีไฮไลต์</div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex',gap:12,justifyContent:'flex-end' }}>
                <button onClick={()=>setShowAddMember(false)} style={{ padding:'12px 24px',borderRadius:20,border:'1.5px solid #e5e7eb',background:'#fff',color:'#6b7280',fontFamily:'inherit',fontSize:14,cursor:'pointer' }}>ยกเลิก</button>
                <button onClick={addMember} disabled={!memberForm.username.trim()||memberSaving} style={{ padding:'12px 32px',borderRadius:20,border:'none',background:memberForm.username.trim()?'linear-gradient(135deg,#0d7377,#14a085)':'#d1d5db',color:'#fff',fontFamily:'inherit',fontSize:15,fontWeight:700,cursor:memberForm.username.trim()?'pointer':'not-allowed',boxShadow:memberForm.username.trim()?'0 2px 10px #14a08555':'none' }}>
                  {memberSaving?'⏳ กำลังบันทึก...':'💾 บันทึก'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}`}</style>
    </div>
  );
}
