'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    setLoading(true); setErr('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) { router.push('/admin'); }
    else { const d = await res.json(); setErr(d.error || 'เกิดข้อผิดพลาด'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#070e1a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sarabun',sans-serif" }}>
      <div style={{ width:320, background:'#0d1c2e', border:'1px solid rgba(109,191,184,0.2)', borderRadius:20, padding:32 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🛠️</div>
          <div style={{ color:'#6dbfb8', fontWeight:700, fontSize:20 }}>Admin Login</div>
          <div style={{ color:'#5a8090', fontSize:13, marginTop:4 }}>OlyLife P90+ Bot</div>
        </div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key==='Enter' && login()}
          placeholder="รหัสผ่าน Admin" style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid rgba(109,191,184,0.3)', background:'rgba(255,255,255,0.05)', color:'#ddeef0', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
        {err && <div style={{ color:'#ef4444', fontSize:12, marginTop:8 }}>{err}</div>}
        <button onClick={login} disabled={!pw.trim() || loading} style={{ width:'100%', marginTop:14, padding:'12px', borderRadius:10, border:'none', background:pw.trim()?'linear-gradient(135deg,#0d7377,#14a085)':'rgba(255,255,255,0.06)', color:pw.trim()?'#fff':'#444', fontFamily:'inherit', fontSize:15, fontWeight:600, cursor:pw.trim()?'pointer':'not-allowed' }}>
          {loading ? '⏳ กำลังเข้าสู่ระบบ...' : '🔐 เข้าสู่ระบบ'}
        </button>
        <div style={{ textAlign:'center', marginTop:16 }}>
          <a href="/" style={{ color:'#5a8090', fontSize:12, textDecoration:'none' }}>← กลับหน้าบอท</a>
        </div>
      </div>
    </div>
  );
}
