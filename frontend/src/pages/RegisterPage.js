import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';

const RULES = [
  { key: 'min8',    label: 'En az 8 karakter',   test: p => p.length >= 8 },
  { key: 'upper',   label: 'Büyük harf (A-Z)',    test: p => /[A-Z]/.test(p) },
  { key: 'lower',   label: 'Küçük harf (a-z)',    test: p => /[a-z]/.test(p) },
  { key: 'digit',   label: 'Rakam (0-9)',          test: p => /[0-9]/.test(p) },
  { key: 'special', label: 'Özel karakter (!@#…)', test: p => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const checks = useMemo(() => RULES.map(r => ({ ...r, ok: r.test(password) })), [password]);
  const allOk  = checks.every(c => c.ok);

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!allOk) {
      const missing = checks.filter(c => !c.ok).map(c => c.label).join(', ');
      setError(`Şifre gereksinimleri karşılanmadı: ${missing}`);
      return;
    }
    setError(''); setLoading(true);
    try {
      await axios.post(`${BACKEND}/api/auth/register`, { username, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  }

  const showChecklist = touched || password.length > 0;

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

        <h1 style={s.title}>Create account</h1>
        <p style={s.sub}>Join the analytics dashboard</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          {error && (
            <div style={s.err}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#FC856D" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#FC856D" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div style={s.ok}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#47EBEB" strokeWidth="2"/>
                <path d="M9 12l2 2 4-4" stroke="#47EBEB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Account created! Redirecting to login…
            </div>
          )}

          <label style={s.label}>Username</label>
          <input style={s.input} type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="yourname" required autoFocus disabled={success} />

          <label style={s.label}>Email address</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required disabled={success} />

          <label style={s.label}>Password</label>
          <input
            style={{ ...s.input, marginBottom: showChecklist ? 8 : 12, borderColor: touched && !allOk ? 'rgba(252,133,109,0.5)' : undefined }}
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setTouched(true); }}
            placeholder="Güçlü bir şifre girin"
            required
            disabled={success}
          />

          {showChecklist && (
            <div style={s.checklist}>
              {checks.map(c => (
                <div key={c.key} style={s.checkRow}>
                  <span style={{ ...s.dot, background: c.ok ? '#47EBEB' : 'rgba(54,56,70,0.6)', boxShadow: c.ok ? '0 0 5px rgba(71,235,235,0.4)' : 'none' }}>
                    {c.ok
                      ? <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#0a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                      : null
                    }
                  </span>
                  <span style={{ ...s.checkLabel, color: c.ok ? 'rgba(71,235,235,0.85)' : 'rgba(106,107,131,0.75)' }}>{c.label}</span>
                </div>
              ))}
            </div>
          )}

          <button style={{ ...s.btn, opacity: loading || success ? 0.65 : 1, marginTop: showChecklist ? 10 : 2 }} type="submit" disabled={loading || success}>
            {loading ? 'Creating account…' : success ? 'Done!' : 'Sign up →'}
          </button>
        </form>

        <p style={s.foot}>
          Already have an account?{' '}
          <span style={s.link} onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', background: 'linear-gradient(195deg,rgba(10,0,30,1) 0%,rgba(2,0,10,1) 80%,rgba(12,29,50,1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",system-ui,sans-serif', position: 'relative', overflow: 'hidden' },
  blob1:     { position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(137,82,253,0.11) 0%,transparent 70%)', top: '-14%', right: '-8%', pointerEvents: 'none' },
  blob2:     { position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(71,235,235,0.06) 0%,transparent 70%)', bottom: '-10%', left: '-5%', pointerEvents: 'none' },
  card:      { position: 'relative', zIndex: 1, background: 'linear-gradient(140deg,rgba(27,27,38,0.92),rgba(9,9,13,0.96))', border: '1px solid rgba(54,56,70,0.4)', borderRadius: 18, padding: '30px 28px', width: 370, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' },
  logoWrap:  { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 },
  logoIcon:  { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,rgba(137,82,253,0.2),rgba(71,235,235,0.08))', border: '1px solid rgba(137,82,253,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brand:     { fontSize: 14, fontWeight: 700, color: 'rgba(240,240,247,0.9)', letterSpacing: '-0.01em' },
  title:     { color: 'rgba(252,252,252,1)', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' },
  sub:       { color: 'rgba(163,164,191,0.7)', fontSize: 12, marginTop: 4, marginBottom: 0 },
  err:       { display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(252,133,109,0.07)', border: '1px solid rgba(252,133,109,0.22)', borderRadius: 8, padding: '8px 12px', color: '#FC856D', fontSize: 12, marginBottom: 12 },
  ok:        { display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(71,235,235,0.06)', border: '1px solid rgba(71,235,235,0.2)', borderRadius: 8, padding: '8px 12px', color: '#47EBEB', fontSize: 12, marginBottom: 12 },
  label:     { display: 'block', color: 'rgba(193,194,217,0.7)', fontSize: 11, fontWeight: 500, marginBottom: 5, letterSpacing: '0.03em', textTransform: 'uppercase' },
  input:     { width: '100%', background: 'rgba(13,13,24,0.6)', border: '1px solid rgba(54,56,70,0.55)', borderRadius: 9, padding: '9px 12px', color: 'rgba(252,252,252,0.9)', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit' },
  checklist: { background: 'rgba(13,13,24,0.4)', border: '1px solid rgba(54,56,70,0.35)', borderRadius: 8, padding: '10px 12px', marginBottom: 2, display: 'flex', flexDirection: 'column', gap: 6 },
  checkRow:  { display: 'flex', alignItems: 'center', gap: 8 },
  dot:       { width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s, box-shadow 0.2s' },
  checkLabel:{ fontSize: 11, fontWeight: 500, transition: 'color 0.2s' },
  btn:       { width: '100%', background: 'linear-gradient(135deg,#8952FD,#5B53FF)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 16px rgba(137,82,253,0.3)', fontFamily: 'inherit' },
  foot:      { color: 'rgba(106,107,131,1)', fontSize: 12, textAlign: 'center', marginTop: 16, marginBottom: 0 },
  link:      { color: '#8952FD', cursor: 'pointer', fontWeight: 500 },
};
