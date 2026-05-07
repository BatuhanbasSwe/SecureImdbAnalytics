import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QUESTIONS = [
  { key: 'rating',     prompt: 'Hangisinin IMDB puanı daha YÜKSEK?',   field: 'rating',       fmt: v => typeof v === 'number' ? v.toFixed(1) : '—', dir: 'higher', label: 'Rating' },
  { key: 'year',       prompt: 'Hangisi daha ÖNCE çıktı?',              field: 'year',         fmt: v => v ?? '—',                                  dir: 'lower',  label: 'Year' },
  { key: 'votes',      prompt: 'Hangisi daha ÇOK oy aldı?',             field: 'votes',        fmt: v => typeof v === 'number' ? v.toLocaleString() : '—', dir: 'higher', label: 'Votes' },
  { key: 'metascore',  prompt: 'Hangisinin Metascore\'u daha YÜKSEK?',  field: 'metascore',    fmt: v => v ?? '—',                                  dir: 'higher', label: 'Metascore' },
  { key: 'duration',   prompt: 'Hangisi daha UZUN?',                    field: 'duration_min', fmt: v => typeof v === 'number' ? `${v} dk` : '—',  dir: 'higher', label: 'Süre' },
];

function pickTwo(arr) {
  const i = Math.floor(Math.random() * arr.length);
  let j = Math.floor(Math.random() * arr.length);
  while (j === i) j = Math.floor(Math.random() * arr.length);
  return [arr[i], arr[j]];
}

function correctSide(a, b, q) {
  const va = a[q.field], vb = b[q.field];
  if (typeof va !== 'number' || typeof vb !== 'number') return null;
  if (va === vb) return null;
  if (q.dir === 'higher') return va > vb ? 'a' : 'b';
  return va < vb ? 'a' : 'b';
}

export default function GamePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [pair, setPair]       = useState(null);
  const [question, setQuestion] = useState(QUESTIONS[0]);
  const [streak, setStreak]   = useState(0);
  const [best, setBest]       = useState(() => Number(localStorage.getItem('game_best') || 0));
  const [phase, setPhase]     = useState('asking');
  const [picked, setPicked]   = useState(null);
  const [correct, setCorrect] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetch('/movies_final.json')
      .then(r => r.json())
      .then(d => setRecords(Array.isArray(d?.records) ? d.records : []));
  }, []);

  const nextRound = useCallback(() => {
    if (records.length < 2) return;
    let attempts = 0, q, a, b, side;
    do {
      q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      [a, b] = pickTwo(records.filter(r => typeof r[q.field] === 'number'));
      side = a && b ? correctSide(a, b, q) : null;
      attempts++;
    } while (!side && attempts < 20);
    if (side) {
      setQuestion(q);
      setPair({ a, b });
      setCorrect(side);
      setPicked(null);
      setFeedback('');
      setPhase('asking');
    }
  }, [records]);

  useEffect(() => {
    if (records.length >= 2 && !pair) nextRound();
  }, [records, pair, nextRound]);

  function handlePick(side) {
    if (phase !== 'asking') return;
    setPicked(side);
    setPhase('reveal');
    if (side === correct) {
      const ns = streak + 1;
      setStreak(ns);
      setFeedback('Doğru!');
      if (ns > best) {
        setBest(ns);
        localStorage.setItem('game_best', String(ns));
      }
    } else {
      setStreak(0);
      setFeedback('Yanlış. Seri sıfırlandı.');
    }
    setTimeout(nextRound, 1800);
  }

  if (!pair) {
    return (
      <div style={s.page}>
        <div style={s.center}><span style={s.spinner}/>Yükleniyor…</div>
      </div>
    );
  }

  const { a, b } = pair;
  const isReveal = phase === 'reveal';

  return (
    <div style={s.page}>
      <div style={s.blob1}/><div style={s.blob2}/>
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
              <div style={s.pageTitle}>This or That</div>
              <div style={s.pageSub}><span style={s.dot}/>{user?.username} · IMDB Quiz</div>
            </div>
          </div>
          <div style={s.hRight}>
            <button style={s.ghostBtn} onClick={() => navigate('/')}>← Dashboard</button>
            <button style={s.dangerBtn} onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
          </div>
        </header>

        {/* Streak counters */}
        <div style={s.streakRow}>
          <div style={s.streakCard}>
            <div style={{...s.streakLabel, color: '#47EBEB'}}>Şu Anki Seri</div>
            <div style={{...s.streakVal, color: streak > 0 ? '#47EBEB' : 'rgba(252,252,252,0.4)'}}>
              {streak === 0 ? '0' : `🔥 ${streak}`}
            </div>
          </div>
          <div style={s.streakCard}>
            <div style={{...s.streakLabel, color: '#F7C948'}}>En İyi</div>
            <div style={{...s.streakVal, color: '#F7C948'}}>
              {best > 0 ? `⭐ ${best}` : '—'}
            </div>
          </div>
        </div>

        {/* Question */}
        <div style={s.questionBox}>
          <div style={s.questionPrompt}>{question.prompt}</div>
          {feedback && (
            <div style={{...s.feedback, color: picked === correct ? '#47EBEB' : '#FC856D'}}>
              {feedback}
            </div>
          )}
        </div>

        {/* Two cards */}
        <div style={s.cardsRow}>
          {[['a', a], ['b', b]].map(([side, item]) => {
            const isPicked = picked === side;
            const isCorrect = correct === side;
            const cardStyle = {
              ...s.movieCard,
              borderColor: isReveal
                ? isCorrect ? 'rgba(71,235,235,0.6)' : isPicked ? 'rgba(252,133,109,0.6)' : 'rgba(54,56,70,0.25)'
                : 'rgba(54,56,70,0.25)',
              transform: isReveal && isCorrect ? 'translateY(-3px)' : 'none',
              boxShadow: isReveal && isCorrect ? '0 8px 30px rgba(71,235,235,0.2)' : 'none',
              cursor: phase === 'asking' ? 'pointer' : 'default',
              opacity: isReveal && !isCorrect && !isPicked ? 0.55 : 1,
            };
            return (
              <button key={side} style={cardStyle} onClick={() => handlePick(side)} disabled={phase !== 'asking'}>
                <div style={s.posterBox}>
                  {item.poster_url ? (
                    <img
                      src={item.poster_url}
                      alt={item.title}
                      style={{...s.posterImg, borderColor: side === 'a' ? 'rgba(137,82,253,0.3)' : 'rgba(71,235,235,0.3)'}}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div style={{
                    ...s.posterIcon,
                    display: item.poster_url ? 'none' : 'flex',
                    background: side === 'a' ? 'linear-gradient(135deg,rgba(137,82,253,0.2),rgba(91,83,255,0.1))' : 'linear-gradient(135deg,rgba(71,235,235,0.18),rgba(71,235,235,0.05))',
                  }}>
                    {item.type === 'tv'
                      ? <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke={side === 'a' ? '#9F75F9' : '#47EBEB'} strokeWidth="1.6"/><path d="M9 3l3 3 3-3" stroke={side === 'a' ? '#9F75F9' : '#47EBEB'} strokeWidth="1.6" strokeLinecap="round"/></svg>
                      : <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M2 7l3-3M2 11l3-3M2 15l3-3M2 19l3-3M19 7l3-3M19 11l3-3M19 15l3-3M19 19l3-3M5 4h14v16H5z" stroke={side === 'a' ? '#9F75F9' : '#47EBEB'} strokeWidth="1.4"/></svg>
                    }
                  </div>
                </div>
                <div style={s.title}>{item.title}</div>
                <div style={s.subRow}>
                  <span style={s.typeTag}>{item.type === 'tv' ? 'TV' : 'Movie'}</span>
                  <span style={s.dimText}>
                    {question.field === 'year' && !isReveal ? '????' : item.year}
                  </span>
                </div>
                <div style={s.genres}>
                  {(item.genres || []).slice(0, 2).map(g => (
                    <span key={g} style={s.genreTag}>{g}</span>
                  ))}
                </div>

                {/* Reveal area */}
                <div style={s.revealBox}>
                  {isReveal ? (
                    <>
                      <div style={s.revealLabel}>{question.label}</div>
                      <div style={{
                        ...s.revealVal,
                        color: isCorrect ? '#47EBEB' : isPicked ? '#FC856D' : 'rgba(252,252,252,0.6)',
                      }}>
                        {question.fmt(item[question.field])}
                      </div>
                      {isReveal && (
                        <div style={{
                          ...s.resultBadge,
                          background: isCorrect ? 'rgba(71,235,235,0.1)' : 'rgba(252,133,109,0.08)',
                          color: isCorrect ? '#47EBEB' : 'rgba(252,133,109,0.85)',
                          borderColor: isCorrect ? 'rgba(71,235,235,0.3)' : 'rgba(252,133,109,0.25)',
                        }}>
                          {isCorrect ? '✓ Doğru cevap' : isPicked ? '✗ Yanlış seçim' : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={s.hiddenLabel}>?</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* VS divider */}
        <div style={s.vsCircle}>VS</div>

        {/* Hint */}
        <div style={s.hint}>
          {phase === 'asking' ? 'Tahminin için bir kart seç' : 'Sıradaki tur geliyor…'}
        </div>

      </div>
    </div>
  );
}

const s = {
  page:        { minHeight:'100vh', background:'linear-gradient(195deg,rgba(10,0,30,1) 0%,rgba(2,0,10,1) 80%,rgba(12,29,50,1) 100%)', fontFamily:'"Inter",system-ui,sans-serif', color:'rgba(252,252,252,1)', position:'relative', overflow:'hidden', paddingBottom:60 },
  blob1:       { position:'fixed', width:550, height:550, borderRadius:'50%', background:'radial-gradient(circle,rgba(137,82,253,0.1) 0%,transparent 70%)', top:'-12%', right:'-8%', pointerEvents:'none', zIndex:0 },
  blob2:       { position:'fixed', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(71,235,235,0.06) 0%,transparent 70%)', bottom:'5%', left:'-4%', pointerEvents:'none', zIndex:0 },
  inner:       { position:'relative', zIndex:1, maxWidth:1000, margin:'0 auto', padding:'0 28px' },

  header:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 0 16px', borderBottom:'1px solid rgba(54,56,70,0.25)', marginBottom:18 },
  hLeft:       { display:'flex', alignItems:'center', gap:12 },
  logoIcon:    { width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,rgba(137,82,253,0.18),rgba(71,235,235,0.07))', border:'1px solid rgba(137,82,253,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  pageTitle:   { fontSize:17, fontWeight:700, letterSpacing:'-0.02em' },
  pageSub:     { display:'flex', alignItems:'center', gap:5, color:'rgba(163,164,191,0.55)', fontSize:11, marginTop:2 },
  dot:         { display:'inline-block', width:5, height:5, borderRadius:'50%', background:'#47EBEB', boxShadow:'0 0 5px #47EBEB' },
  hRight:      { display:'flex', gap:8 },
  ghostBtn:    { background:'rgba(54,56,70,0.18)', color:'rgba(193,194,217,0.75)', border:'1px solid rgba(54,56,70,0.35)', borderRadius:7, padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit' },
  dangerBtn:   { background:'rgba(252,133,109,0.07)', color:'#FC856D', border:'1px solid rgba(252,133,109,0.18)', borderRadius:7, padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit' },

  streakRow:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18 },
  streakCard:  { background:'linear-gradient(140deg,rgba(27,27,38,0.65),rgba(9,9,13,0.75))', border:'1px solid rgba(54,56,70,0.25)', borderRadius:12, padding:'14px 18px', backdropFilter:'blur(8px)', textAlign:'center' },
  streakLabel: { fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600, marginBottom:4 },
  streakVal:   { fontSize:28, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1 },

  questionBox: { textAlign:'center', marginBottom:14 },
  questionPrompt: { fontSize:18, fontWeight:700, letterSpacing:'-0.02em', color:'rgba(252,252,252,0.95)', marginBottom:6 },
  feedback:    { fontSize:12, fontWeight:600, marginTop:4, transition:'color 0.2s' },

  cardsRow:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, position:'relative', marginBottom:14 },
  movieCard:   { background:'linear-gradient(140deg,rgba(27,27,38,0.65),rgba(9,9,13,0.75))', border:'1px solid rgba(54,56,70,0.25)', borderRadius:14, padding:'18px 16px', backdropFilter:'blur(8px)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, fontFamily:'inherit', color:'inherit', transition:'all 0.25s ease', textAlign:'center' },
  posterBox:   { width:'100%', display:'flex', justifyContent:'center', marginBottom:6, position:'relative' },
  posterImg:   { width:130, height:195, borderRadius:10, objectFit:'cover', border:'1px solid', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' },
  posterIcon:  { width:130, height:195, borderRadius:10, border:'1px solid rgba(137,82,253,0.2)', alignItems:'center', justifyContent:'center' },
  title:       { fontSize:15, fontWeight:700, color:'rgba(240,240,247,0.95)', letterSpacing:'-0.01em', minHeight:38, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center' },
  subRow:      { display:'flex', alignItems:'center', gap:8 },
  typeTag:     { display:'inline-block', background:'rgba(137,82,253,0.1)', color:'#9F75F9', border:'1px solid rgba(137,82,253,0.22)', borderRadius:5, padding:'1px 7px', fontSize:10, fontWeight:600 },
  dimText:     { color:'rgba(163,164,191,0.6)', fontSize:11 },
  genres:      { display:'flex', gap:4, flexWrap:'wrap', justifyContent:'center', minHeight:18 },
  genreTag:    { background:'rgba(54,56,70,0.25)', color:'rgba(193,194,217,0.7)', border:'1px solid rgba(54,56,70,0.35)', borderRadius:4, padding:'1px 6px', fontSize:9 },

  revealBox:   { marginTop:10, paddingTop:10, borderTop:'1px solid rgba(54,56,70,0.2)', width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:4, minHeight:64 },
  revealLabel: { fontSize:9, color:'rgba(106,107,131,0.7)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600 },
  revealVal:   { fontSize:22, fontWeight:800, letterSpacing:'-0.03em', transition:'color 0.2s' },
  resultBadge: { fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:5, border:'1px solid', marginTop:2 },
  hiddenLabel: { fontSize:32, fontWeight:800, color:'rgba(106,107,131,0.35)', letterSpacing:'-0.03em' },

  vsCircle:    { position:'absolute', left:'50%', top:'58%', transform:'translate(-50%,-50%)', width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#8952FD,#5B53FF)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, letterSpacing:'0.05em', boxShadow:'0 6px 20px rgba(137,82,253,0.4)', border:'3px solid rgba(2,0,10,1)', pointerEvents:'none' },

  hint:        { textAlign:'center', color:'rgba(163,164,191,0.5)', fontSize:11, marginTop:16, fontStyle:'italic' },

  center:      { display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:60, color:'rgba(163,164,191,0.45)', fontSize:12 },
  spinner:     { display:'inline-block', width:14, height:14, border:'2px solid rgba(137,82,253,0.2)', borderTop:'2px solid #8952FD', borderRadius:'50%' },
};
