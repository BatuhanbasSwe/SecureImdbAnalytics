import React, { useEffect, useMemo, useState } from "react";
import {
  ComposedChart, Bar, BarChart, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { Database, Star, AlertCircle, Search, ExternalLink, Download, Film, Tv } from "lucide-react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* ── palette ────────────────────────────────────────────────── */
const P = {
  pageBg: "linear-gradient(195deg,rgba(10,0,30,1) 0%,rgba(2,0,10,1) 80%,rgba(12,29,50,1) 100%)",
  card: "linear-gradient(140deg,rgba(27,27,38,0.65),rgba(9,9,13,0.75))",
  border: "rgba(54,56,70,0.25)",
  borderHov: "rgba(137,82,253,0.35)",
  txt: "rgba(252,252,252,0.92)",
  sub: "rgba(163,164,191,0.65)",
  iris: "#8952FD",
  teal: "#47EBEB",
  coral: "#FC856D",
  grid: "rgba(54,56,70,0.18)",
  inputBg: "rgba(13,13,24,0.55)",
  rowOdd: "rgba(54,56,70,0.04)",
  rowAnom: "rgba(252,133,109,0.05)",
};

const s = {
  page: { fontFamily: '"Inter",system-ui,sans-serif', background: P.pageBg, color: P.txt, minHeight: "100vh", padding: "24px 28px", position: "relative", overflow: "hidden" },
  blob1: { position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(137,82,253,0.07) 0%,transparent 70%)", top: "-14%", right: "-8%", pointerEvents: "none", zIndex: 0 },
  blob2: { position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(71,235,235,0.04) 0%,transparent 70%)", bottom: "5%", left: "-6%", pointerEvents: "none", zIndex: 0 },
  inner: { position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  logoIcon: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,rgba(137,82,253,0.2),rgba(71,235,235,0.07))", border: `1px solid rgba(137,82,253,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  titleBlock: { flex: 1 },
  title: { fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" },
  sub: { color: P.sub, fontSize: 11, marginTop: 2 },
  ghostBtn: { background: "rgba(54,56,70,0.18)", color: "rgba(193,194,217,0.75)", border: `1px solid rgba(54,56,70,0.35)`, borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit" },
  dangerBtn: { background: "rgba(252,133,109,0.07)", color: P.coral, border: `1px solid rgba(252,133,109,0.18)`, borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 },
  statCard: { background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: "13px 16px", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 12 },
  statIcon: { width: 38, height: 38, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statVal: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 },
  statLbl: { fontSize: 10, color: P.sub, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3 },
  filtersRow: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" },
  pillGroup: { display: "flex", gap: 4 },
  pill: { background: "rgba(54,56,70,0.18)", color: P.sub, border: `1px solid rgba(54,56,70,0.3)`, borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 500, fontFamily: "inherit", whiteSpace: "nowrap" },
  pillActive: { background: "rgba(137,82,253,0.15)", color: P.iris, border: `1px solid rgba(137,82,253,0.4)` },
  pillAnom: { background: "rgba(252,133,109,0.1)", color: P.coral, border: `1px solid rgba(252,133,109,0.3)` },
  searchWrap: { flex: 1, position: "relative", minWidth: 180 },
  input: { width: "100%", background: P.inputBg, border: `1px solid rgba(54,56,70,0.45)`, borderRadius: 8, padding: "7px 10px 7px 32px", color: P.txt, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  searchIcon: { position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  select: { background: P.inputBg, border: `1px solid rgba(54,56,70,0.45)`, borderRadius: 8, padding: "7px 10px", color: P.txt, fontSize: 12, outline: "none", fontFamily: "inherit" },
  chartRow: { display: "grid", gridTemplateColumns: "0.75fr 2fr", gap: 10, marginBottom: 10 },
  chartCard: { background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: "14px 16px", backdropFilter: "blur(8px)" },
  chartTitle: { fontSize: 12, fontWeight: 600, color: "rgba(213,214,234,0.85)", marginBottom: 10 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 },
  statMini: { background: "rgba(13,13,24,0.5)", border: `1px solid rgba(54,56,70,0.2)`, borderRadius: 7, padding: "8px 10px" },
  statMiniLbl: { fontSize: 10, color: P.sub, marginBottom: 3 },
  statMiniVal: { fontSize: 16, fontWeight: 700, color: P.teal },
  tableCard: { background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden", backdropFilter: "blur(8px)" },
  tableHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid rgba(54,56,70,0.2)` },
  tableTitle: { fontSize: 12, fontWeight: 600, color: "rgba(213,214,234,0.85)" },
  badge: { background: "rgba(137,82,253,0.1)", color: P.iris, border: `1px solid rgba(137,82,253,0.18)`, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 600 },
  th: { padding: "8px 12px", textAlign: "left", fontSize: 10, color: "rgba(106,107,131,0.9)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, borderBottom: `1px solid rgba(54,56,70,0.2)`, background: "rgba(13,13,24,0.3)", cursor: "pointer", whiteSpace: "nowrap" },
  td: { padding: "9px 12px", borderBottom: `1px solid rgba(54,56,70,0.1)`, fontSize: 12, color: "rgba(213,214,234,0.8)", verticalAlign: "middle" },
  link: { color: P.teal, textDecoration: "none" },
  genreTag: { display: "inline-block", background: "rgba(137,82,253,0.08)", color: "rgba(159,117,249,0.9)", border: `1px solid rgba(137,82,253,0.15)`, borderRadius: 4, padding: "1px 5px", fontSize: 10, marginRight: 3 },
  anomBadge: { display: "inline-block", background: "rgba(252,133,109,0.1)", color: P.coral, border: `1px solid rgba(252,133,109,0.25)`, borderRadius: 4, padding: "1px 6px", fontSize: 10 },
  normBadge: { display: "inline-block", background: "rgba(54,56,70,0.2)", color: P.sub, border: `1px solid rgba(54,56,70,0.3)`, borderRadius: 4, padding: "1px 6px", fontSize: 10 },
  pagRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: `1px solid rgba(54,56,70,0.15)` },
  pageBtn: { background: "rgba(54,56,70,0.18)", color: P.sub, border: `1px solid rgba(54,56,70,0.3)`, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" },
  pageBtnActive: { background: "rgba(137,82,253,0.15)", color: P.iris, border: `1px solid rgba(137,82,253,0.35)` },
  csvBtn: { display: "flex", alignItems: "center", gap: 5, background: "rgba(71,235,235,0.08)", color: P.teal, border: `1px solid rgba(71,235,235,0.2)`, borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 500, fontFamily: "inherit" },
};

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function safeLower(s) { return typeof s === "string" ? s.toLowerCase() : ""; }
function isAnom(r) { return Boolean(r?.is_anomaly || r?.anomaly_rating_high_meta_low || r?.anomaly_duration_outlier || r?.anomaly_rating_votes_inconsistent); }
function anomReasons(r) {
  const out = [];
  if (r?.anomaly_rating_high_meta_low) out.push("High rating / low metascore");
  if (r?.anomaly_duration_outlier) out.push("Duration outlier");
  if (r?.anomaly_rating_votes_inconsistent) out.push("Rating-votes mismatch");
  return out;
}
function quantile(arr, p) {
  if (!arr.length) return null;
  const pos = (arr.length - 1) * p, base = Math.floor(pos), rest = pos - base;
  return arr[base + 1] !== undefined ? arr[base] + rest * (arr[base + 1] - arr[base]) : arr[base];
}
function computeStats(arr) {
  const clean = arr.filter(x => typeof x === "number" && !isNaN(x)).sort((a, b) => a - b);
  if (!clean.length) return null;
  const q1 = quantile(clean, 0.25), q3 = quantile(clean, 0.75), median = quantile(clean, 0.5);
  const iqr = q3 - q1, mean = clean.reduce((s, v) => s + v, 0) / clean.length;
  return { q1, q3, median, iqr, lower: q1 - 1.5 * iqr, upper: q3 + 1.5 * iqr, mean, count: clean.length };
}
function compareMaybeNum(a, b, dir = "desc") {
  const aN = typeof a === "number" && !isNaN(a), bN = typeof b === "number" && !isNaN(b);
  if (!aN && !bN) return 0; if (!aN) return 1; if (!bN) return -1;
  return dir === "asc" ? a - b : b - a;
}

/* ── Box-plot component ─────────────────────────────────────── */
function BoxPlot({ stats }) {
  if (!stats) return <div style={{ color: P.sub, fontSize: 12 }}>No data</div>;
  const { q1, q3, median, lower, upper } = stats;
  const pad = 0.3;
  const dMin = Math.min(lower, q1) - pad, dMax = Math.max(upper, q3) + pad;
  const BoxShape = (props) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    const sx = v => x + ((v - dMin) / (dMax - dMin)) * width;
    const cy = y + height / 2, top = y + height * 0.2, bot = y + height * 0.8;
    return (
      <g>
        <line x1={sx(payload.lower)} y1={cy} x2={sx(payload.q1)} y2={cy} stroke={P.sub} strokeWidth={2} />
        <line x1={sx(payload.q3)} y1={cy} x2={sx(payload.upper)} y2={cy} stroke={P.sub} strokeWidth={2} />
        {[payload.lower, payload.upper].map((v, i) => (
          <line key={i} x1={sx(v)} y1={cy - 7} x2={sx(v)} y2={cy + 7} stroke={P.sub} strokeWidth={2} />
        ))}
        <rect x={Math.min(sx(q1), sx(q3))} y={top} width={Math.max(2, Math.abs(sx(q3) - sx(q1)))} height={bot - top}
          fill="rgba(137,82,253,0.12)" stroke="rgba(137,82,253,0.55)" rx={3} />
        <line x1={sx(payload.median)} y1={top - 2} x2={sx(payload.median)} y2={bot + 2} stroke={P.teal} strokeWidth={3} />
      </g>
    );
  };
  return (
    <div style={{ width: "100%", height: 110, marginTop: 6 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={[{ name: "Rating", q1, q3, median, lower, upper, value: 1 }]} margin={{ top: 20, right: 16, bottom: 10, left: 16 }}>
          <CartesianGrid stroke={P.grid} />
          <XAxis type="number" domain={[dMin, dMax]} tick={{ fill: P.sub, fontSize: 10 }} axisLine={{ stroke: P.border }} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: P.sub, fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
          <Tooltip cursor={false} content={({ active }) => active ? (
            <div style={{ background: P.inputBg, border: `1px solid ${P.border}`, padding: "8px 10px", borderRadius: 8, fontSize: 11 }}>
              <b>Q1:</b> {stats.q1.toFixed(2)} &nbsp; <b>Median:</b> {stats.median.toFixed(2)} &nbsp; <b>Q3:</b> {stats.q3.toFixed(2)}<br />
              <b>IQR:</b> {stats.iqr.toFixed(2)} &nbsp; <b>Mean:</b> {stats.mean.toFixed(2)} &nbsp; <b>n:</b> {stats.count}
            </div>
          ) : null} />
          <Bar dataKey="value" fill="transparent" shape={BoxShape} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Scatter tooltip ────────────────────────────────────────── */
function ScatterTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload || {};
  return (
    <div style={{ background: P.inputBg, border: `1px solid ${P.border}`, padding: "8px 10px", borderRadius: 8, fontSize: 11, maxWidth: 220 }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: P.txt }}>{p.title || "-"}</div>
      <div style={{ color: P.sub }}>Rating: <span style={{ color: P.txt }}>{typeof p.rating === "number" ? p.rating.toFixed(1) : "-"}</span> · Meta: <span style={{ color: P.txt }}>{p.metascore ?? "-"}</span></div>
      <div style={{ color: P.sub }}>Votes: {p.votes?.toLocaleString() ?? "-"} · {p.type}</div>
    </div>
  );
}

/* ── CSV export ─────────────────────────────────────────────── */
function exportCSV(records, filename) {
  const headers = ["Title", "Year", "Rating", "Metascore", "Votes", "Duration", "Type", "Genres", "Anomaly", "Reason"];
  const rows = records.map(r => [
    r.title, r.year, r.rating, r.metascore, r.votes,
    r.type === "tv" ? `${r.episodes ?? "?"} eps` : `${r.duration_min ?? "?"} min`,
    r.type, (r.genres || []).join("; "), isAnom(r) ? "Yes" : "No",
    anomReasons(r).join("; "),
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Main component ─────────────────────────────────────────── */
export default function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [onlyAnomalies, setOnlyAnomalies] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("rating");
  const [sortDir, setSortDir] = useState("desc");
  const [pageInput, setPageInput] = useState("1");

  useEffect(() => {
    fetch("/movies_final.json")
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e?.message || "Failed to load"); setLoading(false); });
  }, []);

  const records = useMemo(() => (Array.isArray(data?.records) ? data.records : []), [data]);

  const typeCounts = useMemo(() => records.reduce((a, r) => {
    const t = r?.type || "movie"; a[t] = (a[t] || 0) + 1; a.all = (a.all || 0) + 1; return a;
  }, { all: 0 }), [records]);

  const overallAnom = useMemo(() => records.filter(isAnom).length, [records]);
  const overallMean = useMemo(() => {
    const v = records.map(r => typeof r.rating === "number" ? r.rating : null).filter(x => x != null);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  }, [records]);

  const allGenres = useMemo(() => {
    const s = new Set();
    records.forEach(r => (r.genres || []).forEach(g => g?.trim() && s.add(g.trim())));
    return ["all", ...Array.from(s).sort()];
  }, [records]);

  const genreChartData = useMemo(() => {
    const cnt = {};
    records.forEach(r => (r.genres || []).forEach(g => { cnt[g] = (cnt[g] || 0) + 1; }));
    return Object.entries(cnt).map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count).slice(0, 12);
  }, [records]);

  useEffect(() => { setPage(1); }, [query, genre, onlyAnomalies, pageSize, sortBy, sortDir, selectedType]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter(r => {
      if (selectedType !== "all" && (r?.type || "movie") !== selectedType) return false;
      if (onlyAnomalies && !isAnom(r)) return false;
      if (genre !== "all" && !(r.genres || []).includes(genre)) return false;
      if (q) {
        const hay = `${r.title ?? ""} ${r.year ?? ""} ${(r.genres || []).join(" ")}`;
        if (!safeLower(hay).includes(q)) return false;
      }
      return true;
    });
  }, [records, query, genre, onlyAnomalies, selectedType]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      if (sortBy === "title") return sortDir === "asc" ? (a.title ?? "").localeCompare(b.title ?? "") : (b.title ?? "").localeCompare(a.title ?? "");
      if (sortBy === "anomaly") { const da = isAnom(a) ? 1 : 0, db = isAnom(b) ? 1 : 0; return sortDir === "asc" ? da - db : db - da; }
      return compareMaybeNum(a[sortBy], b[sortBy], sortDir);
    });
    return list;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const curPage = clamp(page, 1, totalPages);
  useEffect(() => { setPageInput(String(curPage)); }, [curPage]);
  const pageSlice = sorted.slice((curPage - 1) * pageSize, curPage * pageSize);

  const ratingStats = useMemo(() => computeStats(filtered.map(r => typeof r.rating === "number" ? r.rating : null).filter(x => x != null)), [filtered]);
  const anomCount = useMemo(() => filtered.filter(isAnom).length, [filtered]);

  const scatterData = useMemo(() => filtered
    .filter(r => typeof r.rating === "number" && typeof r.metascore === "number")
    .map(r => {
      const h = [...(r.title || "")].reduce((h, c) => (h ^ c.charCodeAt(0)) * 16777619 >>> 0, 2166136261);
      const j = ((h % 1000) / 1000 - 0.5) * 0.16;
      const rt = 7.7;
      const pr = r.rating <= rt ? (r.rating / rt) * 20 : 20 + ((r.rating - rt) / (10 - rt)) * 80;
      const pm = r.metascore <= 50 ? (r.metascore / 50) * 20 : 20 + ((r.metascore - 50) / 50) * 80;
      return { ...r, plotRating: Math.max(0, Math.min(100, pr + j * 4)), plotMetascore: pm, is_anomaly: isAnom(r) };
    }), [filtered]);

  const RenderDot = ({ cx, cy, fill }) => cx != null && cy != null ? <circle cx={cx} cy={cy} r={3.5} fill={fill} opacity={0.85} /> : null;

  function sortClick(col, defaultDir = "desc") {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir(defaultDir); }
  }
  function sortArrow(col) { return sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : ""; }

  const goPage = () => {
    const n = Number((pageInput || "").trim());
    if (Number.isFinite(n)) setPage(clamp(Math.floor(n), 1, totalPages));
  };

  if (loading) return <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: P.sub }}>Loading dashboard…</span></div>;
  if (error) return <div style={{ ...s.page, padding: 32 }}><div style={{ color: P.coral }}>{error}</div></div>;

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.inner}>

        {/* Header */}
        <header style={s.header}>
          <div style={s.logoIcon}><Database size={16} color={P.iris} /></div>
          <div style={s.titleBlock}>
            <div style={s.title}>IMDB Insights Dashboard</div>
            <div style={s.sub}>
              Showing <strong style={{ color: P.txt }}>{filtered.length}</strong> / {records.length} records
              {onlyAnomalies && <span style={{ color: P.coral }}> · Anomalies only</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {user?.role === "admin" && (
              <button style={s.ghostBtn} onClick={() => navigate("/admin")}>Admin Panel</button>
            )}
            <button style={s.ghostBtn} onClick={() => navigate("/game")}>🎮 Game</button>
            <button style={s.ghostBtn} onClick={() => navigate("/profile")}>Profile</button>
            <button style={s.dangerBtn} onClick={() => { logout(); navigate("/login"); }}>
              Sign out ({user?.username})
            </button>
          </div>
        </header>

        {/* Stat cards */}
        <section style={s.statsRow}>
          {[
            { icon: <Film size={18} color={P.iris} />, val: typeCounts.movie || 0, lbl: "Movies", bg: "rgba(137,82,253,0.08)", valColor: P.iris },
            { icon: <Tv size={18} color={P.teal} />, val: typeCounts.tv || 0, lbl: "TV Shows", bg: "rgba(71,235,235,0.06)", valColor: P.teal },
            { icon: <AlertCircle size={18} color={P.coral} />, val: overallAnom, lbl: `Anomalies · ${records.length ? Math.round(overallAnom / records.length * 100) : 0}%`, bg: "rgba(252,133,109,0.06)", valColor: P.coral },
            { icon: <Star size={18} color="#F7C948" />, val: overallMean?.toFixed(2) ?? "-", lbl: `Avg Rating · ${records.length} items`, bg: "rgba(247,201,72,0.06)", valColor: "#F7C948" },
          ].map(({ icon, val, lbl, bg, valColor }) => (
            <div key={lbl} style={s.statCard}>
              <div style={{ ...s.statIcon, background: bg }}>{icon}</div>
              <div>
                <div style={{ ...s.statVal, color: valColor }}>{val}</div>
                <div style={s.statLbl}>{lbl}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Filters */}
        <section style={s.filtersRow}>
          <div style={s.pillGroup}>
            {[
              { key: "all_normal", label: "All", action: () => { setSelectedType("all"); setOnlyAnomalies(false); }, active: selectedType === "all" && !onlyAnomalies },
              { key: "movie", label: `Movies (${typeCounts.movie || 0})`, action: () => { setSelectedType("movie"); setOnlyAnomalies(false); }, active: selectedType === "movie" && !onlyAnomalies },
              { key: "tv", label: `TV (${typeCounts.tv || 0})`, action: () => { setSelectedType("tv"); setOnlyAnomalies(false); }, active: selectedType === "tv" && !onlyAnomalies },
            ].map(({ key, label, action, active }) => (
              <button key={key} style={{ ...s.pill, ...(active ? s.pillActive : {}) }} onClick={action}>{label}</button>
            ))}
            <button style={{ ...s.pill, ...(onlyAnomalies ? s.pillAnom : {}) }} onClick={() => { setOnlyAnomalies(v => !v); if (!onlyAnomalies) setSelectedType("all"); }}>
              Anomalies ({overallAnom})
            </button>
          </div>
          <div style={s.searchWrap}>
            <Search size={13} color={P.sub} style={s.searchIcon} />
            <input style={s.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, year, genre…" />
          </div>
          <select style={s.select} value={genre} onChange={e => setGenre(e.target.value)}>
            {allGenres.map(g => <option key={g} value={g}>{g === "all" ? "All genres" : g}</option>)}
          </select>
        </section>

        {/* Charts row */}
        <section style={s.chartRow}>
          {/* Box plot */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>Rating Distribution (Box-and-Whisker)</div>
            <BoxPlot stats={ratingStats} />
            {ratingStats && (
              <div style={s.statsGrid}>
                {[["Q1 (25%)", ratingStats.q1.toFixed(2)], ["Median", ratingStats.median.toFixed(2)], ["Q3 (75%)", ratingStats.q3.toFixed(2)], ["Mean", ratingStats.mean.toFixed(2)]].map(([l, v]) => (
                  <div key={l} style={s.statMini}>
                    <div style={s.statMiniLbl}>{l}</div>
                    <div style={s.statMiniVal}>{v}</div>
                  </div>
                ))}
                <div style={{ ...s.statMini, gridColumn: "1/-1" }}>
                  <div style={s.statMiniLbl}>IQR · Count</div>
                  <div style={{ ...s.statMiniVal, color: P.iris }}>{ratingStats.iqr.toFixed(2)} · {ratingStats.count}</div>
                </div>
              </div>
            )}
          </div>

          {/* Scatter */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>Rating vs Metascore — Audience vs Critics</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 16, bottom: 10, left: 10 }}>
                  <CartesianGrid stroke={P.grid} />
                  <XAxis type="number" dataKey="plotRating" name="Rating" domain={[0, 100]}
                    ticks={[0, 20, ((7.5 - 7) / 3) * 80 + 20, ((8 - 7) / 3) * 80 + 20, ((8.5 - 7) / 3) * 80 + 20, ((9 - 7) / 3) * 80 + 20, 100]}
                    tickFormatter={t => { const inv = t <= 20 ? (t / 20) * 7 : 7 + ((t - 20) / 80) * 3; return Number.isFinite(inv) ? inv.toFixed(inv % 1 ? 1 : 0) : ""; }}
                    tick={{ fill: P.sub, fontSize: 10 }} axisLine={{ stroke: P.border }} tickLine={false} />
                  <YAxis type="number" dataKey="plotMetascore" name="Metascore" domain={[0, 100]}
                    ticks={[0, 20, 20 + 16, 20 + 32, 20 + 48, 20 + 64, 100]}
                    tickFormatter={t => { const inv = t <= 20 ? (t / 20) * 50 : 50 + ((t - 20) / 80) * 50; return Number.isFinite(inv) ? String(Math.round(inv)) : ""; }}
                    tick={{ fill: P.sub, fontSize: 10 }} axisLine={{ stroke: P.border }} tickLine={false} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: P.sub }} />
                  <Scatter name="Normal" data={scatterData.filter(d => !d.is_anomaly)} fill={P.iris} shape={RenderDot} />
                  <Scatter name="Anomaly" data={scatterData.filter(d => d.is_anomaly)} fill={P.coral} shape={RenderDot} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 11, color: P.sub, marginTop: 4 }}>Points: {scatterData.length} · Anomalies: {anomCount}</div>
          </div>
        </section>

        {/* Genre chart */}
        <section style={{ ...s.chartCard, marginBottom: 10 }}>
          <div style={s.chartTitle}>Genre Distribution — Top 12 Genres by Count</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreChartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 90 }}>
                <CartesianGrid horizontal={false} stroke={P.grid} />
                <XAxis type="number" tick={{ fill: P.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="genre" width={90} tick={{ fill: P.sub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div style={{ background: P.inputBg, border: `1px solid ${P.border}`, padding: "6px 10px", borderRadius: 7, fontSize: 11 }}>
                    <b style={{ color: P.txt }}>{payload[0].payload.genre}</b>: {payload[0].value} titles
                  </div>
                ) : null} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {genreChartData.map((_, i) => (
                    <Cell key={i} fill={i % 3 === 0 ? P.iris : i % 3 === 1 ? P.teal : "rgba(137,82,253,0.5)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Table */}
        <section style={s.tableCard}>
          <div style={s.tableHead}>
            <span style={s.tableTitle}>Item List</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={s.badge}>{sorted.length} records</span>
              <button style={s.csvBtn} onClick={() => exportCSV(sorted, "imdb_export.csv")}>
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr>
                  {[["title", "Title", "asc"], ["year", "Year", "desc"], ["rating", "Rating", "desc"], ["metascore", "Metascore", "desc"], ["duration_min", "Duration", "asc"]].map(([col, lbl, def]) => (
                    <th key={col} style={s.th} onClick={() => sortClick(col, def)}>{lbl}{sortArrow(col)}</th>
                  ))}
                  <th style={{ ...s.th, cursor: "default" }}>Genres</th>
                  <th style={s.th} onClick={() => sortClick("anomaly")}>Anomaly{sortArrow("anomaly")}</th>
                  <th style={{ ...s.th, cursor: "default" }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...s.td, color: P.sub, textAlign: "center", padding: 24 }}>No items match the current filters.</td></tr>
                ) : pageSlice.map((r, i) => {
                  const anom = isAnom(r), reasons = anomReasons(r);
                  return (
                    <tr key={`${r.title}-${r.year}-${i}`} style={{ background: anom ? P.rowAnom : i % 2 === 0 ? "transparent" : P.rowOdd }}>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <a href={r.imdb_url || r.url || "#"} target="_blank" rel="noreferrer" style={s.link}>{r.title || "(untitled)"}</a>
                          {(r.imdb_url || r.url) && <ExternalLink size={11} color={P.sub} />}
                        </div>
                      </td>
                      <td style={s.td}>{r.year ?? "-"}</td>
                      <td style={{ ...s.td, color: r.rating >= 8.5 ? P.teal : P.txt }}>{typeof r.rating === "number" ? r.rating.toFixed(1) : "-"}</td>
                      <td style={{ ...s.td, color: r.metascore >= 85 ? P.teal : r.metascore < 60 ? P.coral : P.txt }}>{typeof r.metascore === "number" ? r.metascore : "-"}</td>
                      <td style={{ ...s.td, color: P.sub }}>{r.type === "tv" && typeof r.episodes === "number" ? `${r.episodes} eps` : typeof r.duration_min === "number" ? `${r.duration_min} min` : "-"}</td>
                      <td style={s.td}>{(r.genres || []).slice(0, 3).map(g => <span key={g} style={s.genreTag}>{g}</span>)}</td>
                      <td style={s.td}><span style={anom ? s.anomBadge : s.normBadge}>{anom ? "Anomaly" : "Normal"}</span></td>
                      <td style={s.td}>{reasons.length ? <span style={{ ...s.anomBadge, fontSize: 10 }}>{reasons.join(" · ")}</span> : <span style={{ ...s.normBadge, fontSize: 10 }}>—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div style={s.pagRow}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: P.sub }}>Show</span>
              <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} style={{ ...s.select, padding: "4px 8px", fontSize: 11 }}>
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
              <button style={s.pageBtn} onClick={() => setPage(clamp(curPage - 1, 1, totalPages))}>‹ Prev</button>
              {(() => {
                let start = Math.max(1, curPage - 3), end = Math.min(totalPages, start + 6);
                if (end - start < 6) start = Math.max(1, end - 6);
                return Array.from({ length: end - start + 1 }, (_, k) => start + k).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ ...s.pageBtn, ...(p === curPage ? s.pageBtnActive : {}), minWidth: 28 }}>{p}</button>
                ));
              })()}
              <button style={s.pageBtn} onClick={() => setPage(clamp(curPage + 1, 1, totalPages))}>Next ›</button>
              <input value={pageInput} onChange={e => setPageInput(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && goPage()}
                style={{ ...s.select, width: 52, padding: "4px 6px", textAlign: "center", fontSize: 11 }} />
              <button style={s.pageBtn} onClick={goPage}>Go</button>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: 16, color: P.sub, fontSize: 11 }}>
          Data sourced from IMDB · {records.length} titles · Re-run <code style={{ color: P.iris }}>generate_movies.py</code> to refresh
        </footer>
      </div>
    </div>
  );
}
