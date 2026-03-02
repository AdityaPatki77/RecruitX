import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  IconBriefcase, IconBarChart, IconCheckCircle, IconClock,
  IconSearch, IconTarget, IconArrowLeft, IconExternalLink,
} from "../components/Icons";

const scoreColor = (s) => s >= 75 ? "#FFAC41" : s >= 50 ? "#FF3366" : "rgba(255,172,65,0.4)";

export default function StudentJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applied, setApplied] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appRes] = await Promise.all([
        api.get("/student/eligible-jobs"),
        api.get("/student/applied-jobs"),
      ]);
      setJobs([...jobsRes.data].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)));
      setApplied(appRes.data);
    } catch { alert("Failed to load jobs"); }
    finally { setLoading(false); }
  };

  const applyJob = async (id) => {
    try { await api.post(`/student/apply/${id}`); fetchData(); }
    catch { alert("Error applying"); }
  };

  const handleExternal = (job) => {
    window.open(job.external_link, "_blank");
    if (window.confirm("Did you complete the external application?")) applyJob(job.id);
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const ok = !q || j.title?.toLowerCase().includes(q) || j.company_name?.toLowerCase().includes(q);
    if (!ok) return false;
    if (filter === "eligible") return j.eligible;
    if (filter === "applied") return applied.includes(j.id);
    return true;
  });

  const stats = {
    total: jobs.length,
    eligible: jobs.filter(j => j.eligible).length,
    applied: applied.length,
    top: jobs.length ? Math.max(...jobs.map(j => j.match_score || 0)) : 0,
  };

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* HEADER */}
        <div style={s.pageHeader}>
          <div>
            <p style={s.eyebrow}>JOB LISTINGS</p>
            <h1 style={s.pageTitle}>Matched Opportunities</h1>
            <p style={s.pageSub}>Ranked by AI match score — your best fits are shown first.</p>
          </div>
          <button onClick={() => navigate("/student")} style={s.btnOutline}>
            <IconArrowLeft size={15} /> My Profile
          </button>
        </div>

        {/* STATS */}
        <div style={s.statsRow}>
          {[
            { icon: <IconBriefcase size={18} color="#FFAC41" />, label: "Total Jobs", val: stats.total },
            { icon: <IconCheckCircle size={18} color="#FFAC41" />, label: "You're Eligible", val: stats.eligible },
            { icon: <IconClock size={18} color="#FFAC41" />, label: "Applied", val: stats.applied },
            { icon: <IconTarget size={18} color="#FFAC41" />, label: "Best Match", val: `${stats.top}%` },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statIcon}>{st.icon}</div>
              <span style={s.statVal}>{st.val}</span>
              <span style={s.statLbl}>{st.label}</span>
            </div>
          ))}
        </div>

        {/* FILTER BAR */}
        <div style={s.filterBar}>
          <div style={s.searchWrap}>
            <IconSearch size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
            <input style={s.searchInput} placeholder="Search jobs or companies…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={s.filterBtns}>
            {[["all", "All"], ["eligible", "Eligible"], ["applied", "Applied"]].map(([key, lbl]) => (
              <button key={key} onClick={() => setFilter(key)}
                style={{ ...s.filterBtn, ...(filter === key ? s.filterActive : {}) }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* JOB CARDS */}
        {loading ? (
          <div style={s.empty}><IconClock size={32} color="var(--muted)" /><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <IconSearch size={36} color="var(--muted)" />
            <p style={{ color: "var(--text)", fontWeight: 700, margin: "8px 0 4px" }}>No results</p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div style={s.list}>
            {filtered.map(job => {
              const isApplied = applied.includes(job.id);
              const score = job.match_score || 0;
              const col = scoreColor(score);

              return (
                <div key={job.id} style={{ ...s.card, opacity: job.eligible ? 1 : 0.7, borderColor: isApplied ? "rgba(255,172,65,0.3)" : job.eligible ? "rgba(255,172,65,0.15)" : "var(--border)" }}>

                  <div style={s.cardTop}>
                    <div style={s.logoBox}>
                      {(job.company_name?.[0] || "C").toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.titleRow}>
                        <h3 style={s.jobTitle}>{job.title}</h3>
                        <div style={s.badges}>
                          {isApplied && <span style={s.badgeApplied}>Applied</span>}
                          <span style={{ ...s.badgeElig, ...(job.eligible ? s.badgeEligYes : s.badgeEligNo) }}>
                            {job.eligible ? "Eligible" : "Not Eligible"}
                          </span>
                        </div>
                      </div>
                      <p style={s.companyName}>{job.company_name}</p>
                    </div>
                  </div>

                  {/* MATCH SCORE */}
                  <div style={s.scoreSection}>
                    <div style={s.scoreHeader}>
                      <span style={s.scoreLabel}>Match Score</span>
                      <span style={{ ...s.scoreNum, color: col }}>{score}%</span>
                    </div>
                    <div style={s.track}>
                      <div style={{ ...s.bar, width: `${score}%`, background: `linear-gradient(90deg, #FF3366, ${col})` }} />
                    </div>
                  </div>

                  {!job.eligible && job.reason && (
                    <div style={s.reasonBox}>{job.reason}</div>
                  )}

                  <div style={s.cardFooter}>
                    {isApplied ? (
                      <button disabled style={s.btnApplied}>
                        <IconCheckCircle size={14} /> Applied
                      </button>
                    ) : !job.eligible ? (
                      <button disabled style={s.btnDisabled}>Not Eligible</button>
                    ) : job.external_link ? (
                      <button onClick={() => handleExternal(job)} style={s.btnExternal}>
                        <IconExternalLink size={14} /> Apply Externally
                      </button>
                    ) : (
                      <button onClick={() => applyJob(job.id)} style={s.btnApply}>
                        Apply Now <IconArrowLeft size={14} style={{ transform: "rotate(180deg)" }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const A = "rgba(255,172,65,";

const s = {
  page: { maxWidth: "980px", margin: "0 auto", padding: "36px 24px 80px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "14px" },
  eyebrow: { color: "#FFAC41", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px" },
  pageTitle: { color: "var(--text)", fontSize: "30px", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 4px" },
  pageSub: { color: "var(--muted)", fontSize: "14px", margin: 0 },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" },
  statCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" },
  statIcon: { width: 38, height: 38, borderRadius: "10px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center" },
  statVal: { color: "var(--text)", fontSize: "24px", fontWeight: 800 },
  statLbl: { color: "var(--muted)", fontSize: "12px", textAlign: "center" },

  filterBar: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  searchWrap: { flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0 14px", minWidth: "200px" },
  searchInput: { flex: 1, padding: "11px 0", background: "transparent", border: "none", color: "var(--text)", fontSize: "14px", outline: "none", marginBottom: 0, width: "100%" },
  filterBtns: { display: "flex", gap: "7px" },
  filterBtn: { width: "auto", padding: "10px 16px", background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  filterActive: { background: `${A}0.1)`, borderColor: `${A}0.35)`, color: "#FFAC41" },

  empty: { textAlign: "center", padding: "80px 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  list: { display: "flex", flexDirection: "column", gap: "14px" },
  card: { background: "var(--card)", border: "1px solid", borderRadius: "20px", padding: "22px", display: "flex", flexDirection: "column", gap: "16px" },

  cardTop: { display: "flex", gap: "14px", alignItems: "flex-start" },
  logoBox: { width: 50, height: 50, borderRadius: "14px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 900, color: "#FFAC41", flexShrink: 0 },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" },
  jobTitle: { color: "var(--text)", fontSize: "17px", fontWeight: 700, margin: "0 0 3px", letterSpacing: "-0.01em" },
  companyName: { color: "var(--muted)", fontSize: "13px", margin: 0 },
  badges: { display: "flex", gap: "6px", flexWrap: "wrap", flexShrink: 0 },
  badgeApplied: { padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: `${A}0.12)`, color: "#FFAC41", border: `1px solid ${A}0.3)` },
  badgeElig: { padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, border: "1px solid" },
  badgeEligYes: { background: "var(--bg)", color: "var(--muted)", borderColor: "var(--border)" },
  badgeEligNo: { background: "rgba(239,68,68,0.07)", color: "#f87171", borderColor: "rgba(239,68,68,0.2)" },

  scoreSection: { display: "flex", flexDirection: "column", gap: "7px" },
  scoreHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  scoreLabel: { color: "var(--muted)", fontSize: "12px", fontWeight: 600 },
  scoreNum: { fontSize: "16px", fontWeight: 800 },
  track: { height: "5px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" },
  bar: { height: "100%", borderRadius: "999px", transition: "width 1s ease" },

  reasonBox: { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "9px 14px", color: "#f87171", fontSize: "13px" },

  cardFooter: { display: "flex", justifyContent: "flex-end" },
  btnApply: { width: "auto", padding: "9px 20px", background: "#FFAC41", color: "#000", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnExternal: { width: "auto", padding: "9px 20px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnDisabled: { width: "auto", padding: "9px 20px", background: "var(--bg)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "not-allowed" },
  btnApplied: { width: "auto", padding: "9px 20px", background: `${A}0.1)`, color: "#FFAC41", border: `1px solid ${A}0.25)`, borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "default", display: "flex", alignItems: "center", gap: "6px" },

  btnOutline: { width: "auto", padding: "10px 18px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "11px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },
};