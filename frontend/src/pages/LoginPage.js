import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND = 'http://localhost:5000';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/api/auth/login`, { username, password });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response ? (err.response.data?.error || 'Login failed') : `Network error: ${err.message}`);
    } finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.card}>
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#8952FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.brand}>IMDB Insights</span>
        </div>

        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Sign in to your dashboard</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          {error && <div style={s.err}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="10" stroke="#FC856D" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#FC856D" strokeWidth="2" strokeLinecap="round"/></svg>{error}</div>}

          <label style={s.label}>Username</label>
          <input style={s.input} type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" required autoFocus />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />

          <button style={{...s.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div style={s.divider}><span style={s.dline}/><span style={s.dtxt}>quick fill</span><span style={s.dline}/></div>

        <div style={s.chips}>
          {[['admin','admin123','Admin'],['user1','user123','User']].map(([u,p,r])=>(
            <div key={u} style={s.chip} onClick={()=>{setUsername(u);setPassword(p);}}>
              <span style={s.chipRole}>{r}</span>
              <span style={s.chipCred}>{u} / {p}</span>
            </div>
          ))}
        </div>

        <p style={s.foot}>
          No account? <span style={s.link} onClick={()=>navigate('/register')}>Register</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:    { minHeight:'100vh', background:'linear-gradient(195deg,rgba(10,0,30,1) 0%,rgba(2,0,10,1) 80%,rgba(12,29,50,1) 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Inter",system-ui,sans-serif', position:'relative', overflow:'hidden' },
  blob1:   { position:'absolute', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle,rgba(137,82,253,0.13) 0%,transparent 70%)', top:'-12%', left:'-8%', pointerEvents:'none' },
  blob2:   { position:'absolute', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(71,235,235,0.07) 0%,transparent 70%)', bottom:'-8%', right:'-4%', pointerEvents:'none' },
  card:    { position:'relative', zIndex:1, background:'linear-gradient(140deg,rgba(27,27,38,0.92),rgba(9,9,13,0.96))', border:'1px solid rgba(54,56,70,0.4)', borderRadius:18, padding:'32px 30px', width:370, boxShadow:'0 24px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(137,82,253,0.04)', backdropFilter:'blur(20px)' },
  logoWrap:{ display:'flex', alignItems:'center', gap:10, marginBottom:18 },
  logoIcon:{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,rgba(137,82,253,0.2),rgba(71,235,235,0.08))', border:'1px solid rgba(137,82,253,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  brand:   { fontSize:14, fontWeight:700, color:'rgba(240,240,247,0.9)', letterSpacing:'-0.01em' },
  title:   { color:'rgba(252,252,252,1)', fontSize:22, fontWeight:700, margin:0, letterSpacing:'-0.02em' },
  sub:     { color:'rgba(163,164,191,0.7)', fontSize:12, marginTop:4, marginBottom:0 },
  err:     { display:'flex', alignItems:'center', gap:7, background:'rgba(252,133,109,0.07)', border:'1px solid rgba(252,133,109,0.22)', borderRadius:8, padding:'8px 12px', color:'#FC856D', fontSize:12, marginBottom:12 },
  label:   { display:'block', color:'rgba(193,194,217,0.7)', fontSize:11, fontWeight:500, marginBottom:5, letterSpacing:'0.03em', textTransform:'uppercase' },
  input:   { width:'100%', background:'rgba(13,13,24,0.6)', border:'1px solid rgba(54,56,70,0.55)', borderRadius:9, padding:'9px 12px', color:'rgba(252,252,252,0.9)', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:12, fontFamily:'inherit' },
  btn:     { width:'100%', background:'linear-gradient(135deg,#8952FD,#5B53FF)', color:'#fff', border:'none', borderRadius:9, padding:'10px 0', fontSize:13, fontWeight:600, cursor:'pointer', marginTop:2, boxShadow:'0 3px 16px rgba(137,82,253,0.3)', fontFamily:'inherit' },
  divider: { display:'flex', alignItems:'center', gap:8, margin:'18px 0 12px' },
  dline:   { flex:1, height:1, background:'rgba(54,56,70,0.45)' },
  dtxt:    { color:'rgba(106,107,131,1)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' },
  chips:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  chip:    { background:'rgba(13,13,24,0.5)', border:'1px solid rgba(54,56,70,0.38)', borderRadius:8, padding:'8px 10px', cursor:'pointer' },
  chipRole:{ display:'block', color:'#8952FD', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 },
  chipCred:{ display:'block', color:'rgba(193,194,217,0.65)', fontSize:11, fontFamily:'monospace' },
  foot:    { color:'rgba(106,107,131,1)', fontSize:12, textAlign:'center', marginTop:16, marginBottom:0 },
  link:    { color:'#8952FD', cursor:'pointer', fontWeight:500 },
};
