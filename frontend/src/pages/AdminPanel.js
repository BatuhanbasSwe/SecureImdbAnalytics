import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND = 'http://localhost:5000';

function isLocked(locked_until) {
  if (!locked_until) return false;
  return new Date(locked_until) > new Date();
}

export default function AdminPanel() {
  const [users, setUsers]         = useState([]);
  const [logs, setLogs]           = useState([]);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [showEnc, setShowEnc]     = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = useCallback(() => {
    return axios.get(`${BACKEND}/api/admin/users`)
      .then(res => setUsers(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load users'));
  }, []);

  const fetchLogs = useCallback(() => {
    return axios.get(`${BACKEND}/api/admin/audit-logs`)
      .then(res => setLogs(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchLogs()]).finally(() => setLoading(false));
  }, [fetchUsers, fetchLogs]);

  async function doAction(userId, action) {
    try {
      await axios.put(`${BACKEND}/api/admin/users/${userId}/${action}`);
      setActionMsg(`${action} successful`);
      setTimeout(() => setActionMsg(''), 2500);
      await Promise.all([fetchUsers(), fetchLogs()]);
    } catch (err) {
      setActionMsg(err.response?.data?.error || `${action} failed`);
      setTimeout(() => setActionMsg(''), 3000);
    }
  }

  const banned  = users.filter(u => u.is_banned).length;
  const admins  = users.filter(u => u.role === 'admin').length;
  const members = users.filter(u => u.role === 'user').length;

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.inner}>

        {/* Header */}
        <header style={s.header}>
          <div style={s.hLeft}>
            <div style={s.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#8952FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={s.pageTitle}>Admin Panel</div>
              <div style={s.pageSub}><span style={s.onlineDot}/>Logged in as <b style={{color:'rgba(209,209,251,0.85)',fontWeight:500}}>{user?.username}</b></div>
            </div>
          </div>
          <div style={s.hRight}>
            <button style={s.ghostBtn} onClick={() => navigate('/')}>← Dashboard</button>
            <button style={s.dangerBtn} onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
          </div>
        </header>

        {actionMsg && (
          <div style={s.toastBar}>{actionMsg}</div>
        )}

        {/* Stats */}
        <div style={s.stats}>
          {[['Total Users', users.length, '#e6eef8'], ['Admins', admins, '#9F75F9'], ['Members', members, '#47EBEB'], ['Banned', banned, '#FC856D']].map(([label, val, color]) => (
            <div key={label} style={s.statCard}>
              <div style={{...s.statVal, color}}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* User table */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>User Registry</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                style={{ ...s.badge, cursor: 'pointer', background: showEnc ? 'rgba(137,82,253,0.2)' : 'rgba(137,82,253,0.1)', border: showEnc ? '1px solid rgba(137,82,253,0.4)' : '1px solid rgba(137,82,253,0.18)' }}
                onClick={() => setShowEnc(v => !v)}
                title="Veritabanında saklanan Fernet şifreli değeri göster"
              >
                {showEnc ? '🔓 Encrypted ON' : '🔒 Show Encrypted'}
              </button>
              <span style={s.badge}>{users.length} records</span>
            </div>
          </div>

          {loading ? (
            <div style={s.center}><span style={s.spinner}/>Loading…</div>
          ) : error ? (
            <div style={s.errBox}>{error}</div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID','User','Role','Status', showEnc ? 'Email (Encrypted)' : 'Email','Password','Registered','Actions'].map(h =>
                      <th key={h} style={s.th}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const locked = isLocked(u.locked_until);
                    return (
                      <tr key={u.id} style={{background: i%2===0?'transparent':'rgba(54,56,70,0.03)'}}>
                        <td style={s.td}><span style={s.idTag}>#{u.id}</span></td>
                        <td style={s.td}>
                          <div style={s.userCell}>
                            <div style={s.avatar}>{u.username[0].toUpperCase()}</div>
                            <span style={s.uname}>{u.username}</span>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={u.role==='admin' ? s.roleAdmin : s.roleUser}>{u.role}</span>
                        </td>
                        <td style={s.td}>
                          {u.is_banned
                            ? <span style={s.statusBanned}>Banned</span>
                            : locked
                              ? <span style={s.statusLocked}>Locked ({u.failed_attempts})</span>
                              : <span style={s.statusActive}>Active</span>
                          }
                        </td>
                        <td style={s.td}>
                          {showEnc
                            ? u.email_enc_preview
                              ? <span style={s.encTag} title="Fernet AES-128-CBC şifreli değer">{u.email_enc_preview}</span>
                              : <span style={{ color: 'rgba(106,107,131,0.5)', fontSize: 11 }}>—</span>
                            : <span style={s.emailTag}>{u.masked_email}</span>
                          }
                        </td>
                        <td style={s.td}><span style={s.pwDots}>{u.masked_password}</span></td>
                        <td style={s.td}><span style={s.dateTag}>{u.created_at}</span></td>
                        <td style={s.td}>
                          <div style={s.actionRow}>
                            {u.is_banned
                              ? <button style={s.btnUnban} onClick={() => doAction(u.id, 'unban')}>Unban</button>
                              : <button style={s.btnBan} onClick={() => doAction(u.id, 'ban')}>Ban</button>
                            }
                            {locked && (
                              <button style={s.btnUnlock} onClick={() => doAction(u.id, 'unlock')}>Unlock</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Log */}
        <div style={{...s.card, marginTop: 16}}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Audit Log</span>
            <span style={s.badge}>{logs.length} entries</span>
          </div>
          {logs.length === 0 ? (
            <div style={s.center}>No actions recorded yet.</div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Timestamp','Admin','Action','Target','Details'].map(h =>
                      <th key={h} style={s.th}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} style={{background: i%2===0?'transparent':'rgba(54,56,70,0.03)'}}>
                      <td style={s.td}><span style={s.dateTag}>{log.timestamp}</span></td>
                      <td style={s.td}><span style={s.uname}>{log.admin_username}</span></td>
                      <td style={s.td}><ActionBadge action={log.action} /></td>
                      <td style={s.td}><span style={s.emailTag}>{log.target_user || '—'}</span></td>
                      <td style={s.td}><span style={s.dateTag}>{log.details || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ActionBadge({ action }) {
  const map = {
    ban:         { color: '#FC856D', bg: 'rgba(252,133,109,0.08)', border: 'rgba(252,133,109,0.22)' },
    unban:       { color: '#47EBEB', bg: 'rgba(71,235,235,0.06)',  border: 'rgba(71,235,235,0.2)'  },
    unlock:      { color: '#F7C948', bg: 'rgba(247,201,72,0.07)',  border: 'rgba(247,201,72,0.22)' },
    role_change: { color: '#9F75F9', bg: 'rgba(137,82,253,0.08)', border: 'rgba(137,82,253,0.22)' },
  };
  const c = map[action] || { color: 'rgba(163,164,191,0.7)', bg: 'rgba(54,56,70,0.15)', border: 'rgba(54,56,70,0.3)' };
  return (
    <span style={{display:'inline-block', background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:5, padding:'2px 8px', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>
      {action.replace('_', ' ')}
    </span>
  );
}

const s = {
  page:       { minHeight:'100vh', background:'linear-gradient(195deg,rgba(10,0,30,1) 0%,rgba(2,0,10,1) 80%,rgba(12,29,50,1) 100%)', fontFamily:'"Inter",system-ui,sans-serif', color:'rgba(252,252,252,1)', position:'relative', overflow:'hidden', paddingBottom:40 },
  blob1:      { position:'fixed', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(137,82,253,0.09) 0%,transparent 70%)', top:'-12%', right:'-8%', pointerEvents:'none', zIndex:0 },
  blob2:      { position:'fixed', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(71,235,235,0.05) 0%,transparent 70%)', bottom:'8%', left:'-4%', pointerEvents:'none', zIndex:0 },
  inner:      { position:'relative', zIndex:1, maxWidth:1100, margin:'0 auto', padding:'0 28px' },

  header:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 0 20px', borderBottom:'1px solid rgba(54,56,70,0.25)', marginBottom:16 },
  hLeft:      { display:'flex', alignItems:'center', gap:12 },
  logoIcon:   { width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,rgba(137,82,253,0.18),rgba(71,235,235,0.07))', border:'1px solid rgba(137,82,253,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  pageTitle:  { fontSize:17, fontWeight:700, letterSpacing:'-0.02em' },
  pageSub:    { display:'flex', alignItems:'center', gap:5, color:'rgba(163,164,191,0.55)', fontSize:11, marginTop:2 },
  onlineDot:  { display:'inline-block', width:5, height:5, borderRadius:'50%', background:'#47EBEB', boxShadow:'0 0 5px #47EBEB' },
  hRight:     { display:'flex', gap:8 },
  ghostBtn:   { display:'flex', alignItems:'center', gap:5, background:'rgba(54,56,70,0.18)', color:'rgba(193,194,217,0.75)', border:'1px solid rgba(54,56,70,0.35)', borderRadius:7, padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit' },
  dangerBtn:  { display:'flex', alignItems:'center', gap:5, background:'rgba(252,133,109,0.07)', color:'#FC856D', border:'1px solid rgba(252,133,109,0.18)', borderRadius:7, padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit' },

  toastBar:   { background:'rgba(137,82,253,0.12)', border:'1px solid rgba(137,82,253,0.25)', borderRadius:8, padding:'8px 14px', color:'rgba(209,209,251,0.9)', fontSize:12, marginBottom:12, textAlign:'center' },

  stats:      { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 },
  statCard:   { background:'linear-gradient(140deg,rgba(27,27,38,0.65),rgba(9,9,13,0.75))', border:'1px solid rgba(54,56,70,0.25)', borderRadius:12, padding:'14px 18px', backdropFilter:'blur(8px)' },
  statVal:    { fontSize:26, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1, marginBottom:4 },
  statLabel:  { fontSize:10, color:'rgba(163,164,191,0.45)', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:500 },

  card:       { background:'linear-gradient(140deg,rgba(27,27,38,0.65),rgba(9,9,13,0.75))', border:'1px solid rgba(54,56,70,0.25)', borderRadius:14, overflow:'hidden', backdropFilter:'blur(8px)' },
  cardHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', borderBottom:'1px solid rgba(54,56,70,0.2)' },
  cardTitle:  { fontSize:13, fontWeight:600, color:'rgba(213,214,234,0.85)' },
  badge:      { background:'rgba(137,82,253,0.1)', color:'rgba(159,117,249,1)', border:'1px solid rgba(137,82,253,0.18)', borderRadius:20, padding:'2px 9px', fontSize:10, fontWeight:600 },

  center:     { display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'28px 0', color:'rgba(163,164,191,0.45)', fontSize:12 },
  spinner:    { display:'inline-block', width:14, height:14, border:'2px solid rgba(137,82,253,0.2)', borderTop:'2px solid #8952FD', borderRadius:'50%' },
  errBox:     { display:'flex', alignItems:'center', gap:8, color:'#FC856D', padding:'18px 20px', fontSize:13 },

  table:      { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:         { background:'rgba(13,13,24,0.35)', color:'rgba(106,107,131,1)', padding:'9px 14px', textAlign:'left', fontSize:10, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600, borderBottom:'1px solid rgba(54,56,70,0.2)', whiteSpace:'nowrap' },
  td:         { padding:'10px 14px', borderBottom:'1px solid rgba(54,56,70,0.12)', color:'rgba(213,214,234,0.8)', verticalAlign:'middle' },

  idTag:      { fontFamily:'monospace', color:'rgba(106,107,131,0.8)', fontSize:11 },
  userCell:   { display:'flex', alignItems:'center', gap:8 },
  avatar:     { width:26, height:26, borderRadius:7, background:'linear-gradient(135deg,rgba(137,82,253,0.25),rgba(91,83,255,0.15))', border:'1px solid rgba(137,82,253,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#9F75F9', flexShrink:0 },
  uname:      { fontWeight:600, color:'rgba(240,240,247,0.92)', fontSize:12 },

  roleAdmin:  { display:'inline-block', background:'rgba(137,82,253,0.1)', color:'#9F75F9', border:'1px solid rgba(137,82,253,0.22)', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:600 },
  roleUser:   { display:'inline-block', background:'rgba(54,56,70,0.25)', color:'rgba(163,164,191,0.75)', border:'1px solid rgba(54,56,70,0.35)', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:500 },

  statusActive:  { display:'inline-block', background:'rgba(71,235,235,0.07)', color:'#47EBEB', border:'1px solid rgba(71,235,235,0.2)', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:600 },
  statusBanned:  { display:'inline-block', background:'rgba(252,133,109,0.08)', color:'#FC856D', border:'1px solid rgba(252,133,109,0.22)', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:600 },
  statusLocked:  { display:'inline-block', background:'rgba(247,201,72,0.07)', color:'#F7C948', border:'1px solid rgba(247,201,72,0.22)', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:600 },

  emailTag:   { fontFamily:'monospace', color:'#47EBEB', background:'rgba(71,235,235,0.05)', border:'1px solid rgba(71,235,235,0.1)', borderRadius:4, padding:'1px 6px', fontSize:11 },
  encTag:     { fontFamily:'monospace', color:'#9F75F9', background:'rgba(137,82,253,0.06)', border:'1px solid rgba(137,82,253,0.18)', borderRadius:4, padding:'1px 6px', fontSize:10, maxWidth:180, display:'inline-block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', verticalAlign:'middle' },
  pwDots:     { fontFamily:'monospace', color:'rgba(106,107,131,0.75)', letterSpacing:'0.08em', fontSize:13 },
  dateTag:    { color:'rgba(106,107,131,0.75)', fontSize:11, fontVariantNumeric:'tabular-nums' },

  actionRow:  { display:'flex', gap:5, alignItems:'center' },
  btnBan:     { background:'rgba(252,133,109,0.08)', color:'#FC856D', border:'1px solid rgba(252,133,109,0.22)', borderRadius:5, padding:'3px 9px', cursor:'pointer', fontSize:10, fontWeight:600, fontFamily:'inherit' },
  btnUnban:   { background:'rgba(71,235,235,0.07)', color:'#47EBEB', border:'1px solid rgba(71,235,235,0.2)', borderRadius:5, padding:'3px 9px', cursor:'pointer', fontSize:10, fontWeight:600, fontFamily:'inherit' },
  btnUnlock:  { background:'rgba(247,201,72,0.07)', color:'#F7C948', border:'1px solid rgba(247,201,72,0.22)', borderRadius:5, padding:'3px 9px', cursor:'pointer', fontSize:10, fontWeight:600, fontFamily:'inherit' },
};
