import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND = 'http://localhost:5000';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]           = useState(null);
  const [emailEnc, setEmailEnc]     = useState(null);
  const [newEmail, setNewEmail]     = useState('');
  const [editing, setEditing]       = useState(false);
  const [saveMsg, setSaveMsg]       = useState('');
  const [saveErr, setSaveErr]       = useState('');
  const [showRaw, setShowRaw]       = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND}/api/auth/email`).then(r => setEmail(r.data.email)),
      axios.get(`${BACKEND}/api/auth/email-raw`).then(r => setEmailEnc(r.data.email_enc)),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleSaveEmail(e) {
    e.preventDefault();
    setSaveErr(''); setSaveMsg('');
    try {
      await axios.put(`${BACKEND}/api/auth/email`, { email: newEmail });
      const [r1, r2] = await Promise.all([
        axios.get(`${BACKEND}/api/auth/email`),
        axios.get(`${BACKEND}/api/auth/email-raw`),
      ]);
      setEmail(r1.data.email);
      setEmailEnc(r2.data.email_enc);
      setNewEmail('');
      setEditing(false);
      setSaveMsg('E-posta şifrelenerek kaydedildi.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveErr(err.response?.data?.error || 'Kaydetme başarısız');
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.inner}>

        {/* Header */}
        <header style={s.header}>
          <div style={s.hLeft}>
            <div style={s.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#8952FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={s.pageTitle}>My Profile</div>
              <div style={s.pageSub}><span style={s.dot}/>Account &amp; Security</div>
            </div>
          </div>
          <div style={s.hRight}>
            <button style={s.ghostBtn} onClick={() => navigate('/')}>← Dashboard</button>
            <button style={s.dangerBtn} onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
          </div>
        </header>

        <div style={s.grid}>

          {/* Identity card */}
          <div style={s.card}>
            <div style={s.cardHead}><span style={s.cardTitle}>Identity</span></div>
            <div style={s.cardBody}>
              <div style={s.avatarBig}>{user?.username?.[0]?.toUpperCase()}</div>
              <div style={s.username}>{user?.username}</div>
              <span style={user?.role === 'admin' ? s.roleAdmin : s.roleUser}>{user?.role}</span>
            </div>
          </div>

          {/* Encryption demo card */}
          <div style={{ ...s.card, flex: 2 }}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>E-posta Şifrelemesi</span>
              <span style={s.algoBadge}>Fernet · AES-128-CBC + HMAC-SHA256</span>
            </div>
            <div style={{ padding: '16px 18px' }}>

              {loading ? (
                <div style={s.center}><span style={s.spinner}/>Yükleniyor…</div>
              ) : (
                <>
                  {/* Decrypted value */}
                  <div style={s.fieldGroup}>
                    <div style={s.fieldLabel}>
                      <span style={s.greenDot}/>Çözülmüş E-posta (Plaintext)
                    </div>
                    <div style={s.fieldVal}>
                      {email
                        ? <span style={s.emailDisplay}>{email}</span>
                        : <span style={s.notSet}>— Henüz e-posta eklenmedi</span>
                      }
                    </div>
                  </div>

                  {/* Encrypted value */}
                  <div style={s.fieldGroup}>
                    <div style={s.fieldLabelRow}>
                      <span style={s.fieldLabel}>
                        <span style={s.lockDot}/>Şifrelenmiş Değer (Veritabanında Saklanan)
                      </span>
                      {emailEnc && (
                        <button style={s.toggleBtn} onClick={() => setShowRaw(v => !v)}>
                          {showRaw ? 'Gizle' : 'Göster'}
                        </button>
                      )}
                    </div>
                    <div style={s.encBox}>
                      {emailEnc
                        ? showRaw
                          ? <span style={s.encText}>{emailEnc}</span>
                          : <span style={s.encMasked}>gAAAAAB••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••</span>
                        : <span style={s.notSet}>— Şifrelenecek veri yok</span>
                      }
                    </div>
                    {emailEnc && showRaw && (
                      <div style={s.encNote}>
                        Bu değer veritabanında bu haliyle saklanır. Fernet anahtarı olmadan çözülemez.
                      </div>
                    )}
                  </div>

                  {/* Arrow diagram */}
                  {email && emailEnc && (
                    <div style={s.flowRow}>
                      <div style={s.flowBox}>
                        <div style={s.flowLabel}>Plaintext</div>
                        <div style={s.flowVal}>{email}</div>
                      </div>
                      <div style={s.flowArrow}>
                        <svg width="40" height="16" viewBox="0 0 40 16">
                          <path d="M0 8h36M30 2l6 6-6 6" stroke="#8952FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                        <div style={s.flowArrowLabel}>Fernet.encrypt()</div>
                      </div>
                      <div style={{ ...s.flowBox, borderColor: 'rgba(137,82,253,0.3)', background: 'rgba(137,82,253,0.05)' }}>
                        <div style={s.flowLabel}>Ciphertext (DB)</div>
                        <div style={{ ...s.flowVal, fontFamily: 'monospace', fontSize: 9, wordBreak: 'break-all', color: '#9F75F9' }}>
                          {emailEnc.slice(0, 40)}…
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit form */}
                  {saveMsg && <div style={s.okMsg}>{saveMsg}</div>}
                  {saveErr && <div style={s.errMsg}>{saveErr}</div>}

                  {!editing ? (
                    <button style={s.editBtn} onClick={() => setEditing(true)}>
                      {email ? 'E-postayı Güncelle' : '+ E-posta Ekle'}
                    </button>
                  ) : (
                    <form onSubmit={handleSaveEmail} style={s.editForm}>
                      <input
                        style={s.input}
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="yeni@ornek.com"
                        required
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={s.saveBtn} type="submit">Şifrele &amp; Kaydet</button>
                        <button style={s.cancelBtn} type="button" onClick={() => { setEditing(false); setSaveErr(''); }}>İptal</button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Security info card */}
          <div style={s.card}>
            <div style={s.cardHead}><span style={s.cardTitle}>Güvenlik Özeti</span></div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Şifre Hash', val: 'bcrypt', sub: '12 rounds · salt içerir', color: '#47EBEB' },
                { label: 'E-posta Şifreleme', val: 'Fernet', sub: 'AES-128-CBC + HMAC-SHA256', color: '#9F75F9' },
                { label: 'Kimlik Doğrulama', val: 'JWT HS256', sub: '1 saatlik token süresi', color: '#F7C948' },
                { label: 'Erişim Kontrolü', val: 'RBAC', sub: 'admin / user rolleri', color: '#FC856D' },
              ].map(({ label, val, sub, color }) => (
                <div key={label} style={s.secRow}>
                  <div style={s.secLabel}>{label}</div>
                  <div>
                    <span style={{ ...s.secVal, color }}>{val}</span>
                    <div style={s.secSub}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight: '100vh', background: 'linear-gradient(195deg,rgba(10,0,30,1) 0%,rgba(2,0,10,1) 80%,rgba(12,29,50,1) 100%)', fontFamily: '"Inter",system-ui,sans-serif', color: 'rgba(252,252,252,1)', position: 'relative', overflow: 'hidden', paddingBottom: 40 },
  blob1:     { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(137,82,253,0.09) 0%,transparent 70%)', top: '-12%', right: '-8%', pointerEvents: 'none', zIndex: 0 },
  blob2:     { position: 'fixed', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(71,235,235,0.05) 0%,transparent 70%)', bottom: '8%', left: '-4%', pointerEvents: 'none', zIndex: 0 },
  inner:     { position: 'relative', zIndex: 1, maxWidth: 1060, margin: '0 auto', padding: '0 28px' },

  header:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 20px', borderBottom: '1px solid rgba(54,56,70,0.25)', marginBottom: 20 },
  hLeft:     { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon:  { width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,rgba(137,82,253,0.18),rgba(71,235,235,0.07))', border: '1px solid rgba(137,82,253,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pageTitle: { fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' },
  pageSub:   { display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(163,164,191,0.55)', fontSize: 11, marginTop: 2 },
  dot:       { display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#47EBEB', boxShadow: '0 0 5px #47EBEB' },
  hRight:    { display: 'flex', gap: 8 },
  ghostBtn:  { background: 'rgba(54,56,70,0.18)', color: 'rgba(193,194,217,0.75)', border: '1px solid rgba(54,56,70,0.35)', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' },
  dangerBtn: { background: 'rgba(252,133,109,0.07)', color: '#FC856D', border: '1px solid rgba(252,133,109,0.18)', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' },

  grid:      { display: 'grid', gridTemplateColumns: '200px 1fr 220px', gap: 14, alignItems: 'start' },

  card:      { background: 'linear-gradient(140deg,rgba(27,27,38,0.65),rgba(9,9,13,0.75))', border: '1px solid rgba(54,56,70,0.25)', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(8px)' },
  cardHead:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderBottom: '1px solid rgba(54,56,70,0.2)' },
  cardTitle: { fontSize: 12, fontWeight: 600, color: 'rgba(213,214,234,0.85)' },
  cardBody:  { padding: '22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },

  avatarBig: { width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,rgba(137,82,253,0.3),rgba(91,83,255,0.2))', border: '1px solid rgba(137,82,253,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#9F75F9' },
  username:  { fontSize: 15, fontWeight: 700, color: 'rgba(240,240,247,0.95)' },
  roleAdmin: { display: 'inline-block', background: 'rgba(137,82,253,0.1)', color: '#9F75F9', border: '1px solid rgba(137,82,253,0.22)', borderRadius: 5, padding: '2px 9px', fontSize: 10, fontWeight: 600 },
  roleUser:  { display: 'inline-block', background: 'rgba(54,56,70,0.25)', color: 'rgba(163,164,191,0.75)', border: '1px solid rgba(54,56,70,0.35)', borderRadius: 5, padding: '2px 9px', fontSize: 10, fontWeight: 500 },

  algoBadge: { background: 'rgba(137,82,253,0.08)', color: 'rgba(159,117,249,0.85)', border: '1px solid rgba(137,82,253,0.18)', borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 600 },

  fieldGroup:    { marginBottom: 14 },
  fieldLabelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  fieldLabel:    { display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(163,164,191,0.6)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 },
  fieldVal:      { marginTop: 5 },
  greenDot:  { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#47EBEB', flexShrink: 0 },
  lockDot:   { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#9F75F9', flexShrink: 0 },

  emailDisplay: { color: '#47EBEB', fontFamily: 'monospace', fontSize: 13 },
  notSet:       { color: 'rgba(106,107,131,0.7)', fontSize: 12, fontStyle: 'italic' },

  encBox:    { background: 'rgba(13,13,24,0.5)', border: '1px solid rgba(137,82,253,0.18)', borderRadius: 7, padding: '8px 12px', marginTop: 4, minHeight: 34, wordBreak: 'break-all' },
  encText:   { fontFamily: 'monospace', fontSize: 10, color: '#9F75F9', lineHeight: 1.5 },
  encMasked: { fontFamily: 'monospace', fontSize: 12, color: 'rgba(106,107,131,0.5)', letterSpacing: '0.02em' },
  encNote:   { fontSize: 10, color: 'rgba(106,107,131,0.6)', marginTop: 5, fontStyle: 'italic' },
  toggleBtn: { background: 'rgba(137,82,253,0.1)', color: '#9F75F9', border: '1px solid rgba(137,82,253,0.22)', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: 'inherit' },

  flowRow:       { display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 16px', flexWrap: 'wrap' },
  flowBox:       { background: 'rgba(13,13,24,0.45)', border: '1px solid rgba(71,235,235,0.15)', borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 100 },
  flowLabel:     { fontSize: 9, color: 'rgba(106,107,131,0.7)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 },
  flowVal:       { fontSize: 11, color: '#47EBEB', fontWeight: 600, wordBreak: 'break-all' },
  flowArrow:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 },
  flowArrowLabel:{ fontSize: 9, color: 'rgba(137,82,253,0.7)', fontFamily: 'monospace', whiteSpace: 'nowrap' },

  okMsg:   { background: 'rgba(71,235,235,0.06)', border: '1px solid rgba(71,235,235,0.2)', borderRadius: 7, padding: '6px 12px', color: '#47EBEB', fontSize: 11, marginBottom: 10 },
  errMsg:  { background: 'rgba(252,133,109,0.07)', border: '1px solid rgba(252,133,109,0.22)', borderRadius: 7, padding: '6px 12px', color: '#FC856D', fontSize: 11, marginBottom: 10 },

  editBtn:  { background: 'rgba(137,82,253,0.1)', color: '#9F75F9', border: '1px solid rgba(137,82,253,0.25)', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' },
  editForm: { display: 'flex', flexDirection: 'column', gap: 8 },
  input:    { width: '100%', background: 'rgba(13,13,24,0.6)', border: '1px solid rgba(54,56,70,0.55)', borderRadius: 8, padding: '8px 12px', color: 'rgba(252,252,252,0.9)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  saveBtn:  { background: 'linear-gradient(135deg,#8952FD,#5B53FF)', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' },
  cancelBtn:{ background: 'rgba(54,56,70,0.18)', color: 'rgba(193,194,217,0.7)', border: '1px solid rgba(54,56,70,0.35)', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' },

  center:   { display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(163,164,191,0.45)', fontSize: 12, padding: '20px 0' },
  spinner:  { display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(137,82,253,0.2)', borderTop: '2px solid #8952FD', borderRadius: '50%' },

  secRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 10, borderBottom: '1px solid rgba(54,56,70,0.15)' },
  secLabel: { fontSize: 11, color: 'rgba(163,164,191,0.5)', paddingTop: 2 },
  secVal:   { fontSize: 12, fontWeight: 700 },
  secSub:   { fontSize: 10, color: 'rgba(106,107,131,0.65)', marginTop: 1 },
};
