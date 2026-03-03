import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  IconUsers, IconCheckCircle, IconXCircle, IconFileText,
  IconArrowLeft, IconClock, IconBuilding,
  IconSearch, IconZap, IconStar, IconMail, IconDownload,
} from "../components/Icons";

export default function PlacementApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailResult, setEmailResult] = useState("");

  // ── filter / search / sort ──────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("score"); // "score" | "cgpa" | "name"

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [appRes, jobRes] = await Promise.all([
        api.get(`/placement/job-applicants/${jobId}`),
        api.get("/placement/all-jobs")
      ]);
      setApplicants(appRes.data);
      const currentJob = jobRes.data.find(j => j.id.toString() === jobId);
      setJob(currentJob);
    } catch {
      console.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    setUpdating(applicationId);
    try {
      await api.put(`/placement/update-application/${applicationId}?status=${status}`);
      fetchData();
    } catch {
      alert("Error updating status");
    } finally {
      setUpdating(null);
    }
  };

  const sendEmailsNow = async () => {
    const shortlisted = applicants.filter(a => a.status === "SHORTLISTED").length;
    if (!shortlisted) { alert("No shortlisted students to email."); return; }
    if (!window.confirm(`Send shortlist emails to ${shortlisted} student(s) right now?`)) return;
    setSendingEmails(true); setEmailResult("");
    try {
      const res = await api.post(`/placement/send-shortlist-emails/${jobId}`);
      setEmailResult(res.data.message);
    } catch {
      setEmailResult("Failed to send emails. Check SMTP config.");
    } finally {
      setSendingEmails(false);
    }
  };

  const exportCSV = () => {
    const token = localStorage.getItem("token");
    window.open(`http://127.0.0.1:8000/placement/export-shortlisted/${jobId}?token=${token}`, "_blank");
  };

  // also allow token in query for the CSV download
  // (alternatively the backend can read it from header, this is simpler for file downloads)

  // ── stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: applicants.length,
    pending: applicants.filter(a => a.status === "APPLIED").length,
    shortlisted: applicants.filter(a => a.status === "SHORTLISTED").length,
    rejected: applicants.filter(a => a.status === "REJECTED").length,
  }), [applicants]);

  // ── derived list ────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...applicants];
    if (statusFilter !== "ALL") list = list.filter(a => a.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.full_name?.toLowerCase().includes(q) ||
        a.roll_no?.toLowerCase().includes(q) ||
        a.department?.toLowerCase().includes(q)
      );
    }
    if (sort === "cgpa") list.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
    if (sort === "name") list.sort((a, b) => a.full_name.localeCompare(b.full_name));
    // "score" is already sorted by backend; preserve that order when selected
    return list;
  }, [applicants, statusFilter, search, sort]);

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* ── BACK + HEADER ── */}
        <button onClick={() => navigate("/placement")} style={s.backBtn}>
          <IconArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={s.headerRow}>
          <div>
            <p style={s.eyebrow}>APPLICANT TRACKING</p>
            <h1 style={s.title}>{job?.title || "Loading..."}</h1>
            <p style={s.sub}>{job?.company_name}</p>
          </div>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={sendEmailsNow} disabled={sendingEmails} style={s.btnEmail}>
              <IconMail size={15} />
              {sendingEmails ? "Sending…" : `Email Shortlisted (${stats.shortlisted})`}
            </button>
            <button onClick={exportCSV} style={s.btnExport}>
              <IconDownload size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Email result toast */}
        {emailResult && (
          <div style={emailResult.includes("Failed") ? s.toastErr : s.toastOk}>
            {emailResult.includes("Failed") ? <IconXCircle size={15} /> : <IconCheckCircle size={15} />}
            {emailResult}
            <button onClick={() => setEmailResult("")} style={s.toastClose}>✕</button>
          </div>
        )}

        {/* ─── FEATURE 6: STATS BAR ─── */}
        <div style={s.statsBar}>
          {[
            { label: "Total", val: stats.total, color: "#818cf8" },
            { label: "Pending", val: stats.pending, color: "#fbbf24" },
            { label: "Shortlisted", val: stats.shortlisted, color: "#22c55e" },
            { label: "Rejected", val: stats.rejected, color: "#ef4444" },
          ].map(st => (
            <div key={st.label} style={s.statChip}>
              <span style={{ ...s.statNum, color: st.color }}>{st.val}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>

        {/* ─── FEATURE 1: STATUS FILTER + FEATURE 5: SEARCH & SORT ─── */}
        <div style={s.controlBar}>
          {/* Status tabs */}
          <div style={s.tabs}>
            {[["ALL", "All"], ["APPLIED", "Pending"], ["SHORTLISTED", "Shortlisted"], ["REJECTED", "Rejected"]].map(([key, label]) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                style={{ ...s.tab, ...(statusFilter === key ? s.tabActive : {}) }}>
                {label}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div style={s.rightControls}>
            <div style={s.searchWrap}>
              <IconSearch size={14} color="var(--muted)" />
              <input
                style={s.searchInput}
                placeholder="Search by name, roll no…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={s.sortSelect}>
              <option value="score">Sort: Match Score</option>
              <option value="cgpa">Sort: CGPA</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* ── LIST ── */}
        {loading ? (
          <div style={s.empty}><IconClock size={32} color="var(--muted)" /><p>Loading applicants...</p></div>
        ) : displayed.length === 0 ? (
          <div style={s.empty}><IconUsers size={40} color="var(--muted)" /><p>No applicants match your filter</p></div>
        ) : (
          <div style={s.list}>
            {displayed.map((app) => (
              <div key={app.application_id} style={s.appCard}>

                {/* ── TOP ROW: Avatar + Name + Status ── */}
                <div style={s.cardTop}>
                  <div style={s.avatar}>{app.full_name.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.nameRow}>
                      <h3 style={s.appName}>{app.full_name}</h3>
                      {app.roll_no && <span style={s.rollPill}>{app.roll_no}</span>}
                    </div>
                    <p style={s.deptText}>{app.department}</p>
                  </div>
                  {/* Match score badge */}
                  <div style={s.scoreBadge}>
                    <IconStar size={12} color="#818cf8" />
                    <span>{app.match_score}%</span>
                  </div>
                  <div style={{ ...s.statusPill, ...getStatusStyle(app.status) }}>
                    {app.status === "APPLIED" ? "PENDING" : app.status}
                  </div>
                </div>

                {/* ─── FEATURE 3: EXPANDED STUDENT INFO ─── */}
                <div style={s.infoGrid}>
                  <InfoCell label="CGPA" value={app.cgpa} highlight={job && app.cgpa >= job.min_cgpa} />
                  <InfoCell label="10th %" value={app.tenth_percent ? `${app.tenth_percent}%` : "—"} />
                  <InfoCell label="12th %" value={app.twelfth_percent ? `${app.twelfth_percent}%` : "—"} />
                  <InfoCell label="Backlogs" value={app.backlogs ?? 0} highlight={app.backlogs === 0} invertHighlight />
                  <InfoCell label="Skill Match" value={`${app.skill_match_percent}%`} highlight={app.skill_match_percent >= 50} />
                </div>

                {/* Skills */}
                {app.skills && (
                  <div style={s.skillsWrap}>
                    {app.skills.split(",").filter(Boolean).map((sk, i) => (
                      <span key={i} style={{
                        ...s.skillTag,
                        ...(job?.required_skill?.toLowerCase().includes(sk.trim().toLowerCase())
                          ? s.skillTagMatch : {})
                      }}>{sk.trim()}</span>
                    ))}
                  </div>
                )}

                {/* ── FOOTER: Resume + Actions ── */}
                <div style={s.cardFooter}>
                  {app.resume_url && (
                    <a href={`http://127.0.0.1:8000/${app.resume_url}`} target="_blank" rel="noreferrer" style={s.resumeLink}>
                      <IconFileText size={16} /> View Resume
                    </a>
                  )}
                  <div style={{ flex: 1 }} />
                  <div style={s.actions}>
                    <button
                      onClick={() => updateStatus(app.application_id, "SHORTLISTED")}
                      disabled={updating === app.application_id || app.status === "SHORTLISTED"}
                      style={{ ...s.btnShortlist, opacity: app.status === "SHORTLISTED" ? 0.4 : 1 }}
                    >
                      <IconCheckCircle size={16} /> Shortlist
                    </button>
                    <button
                      onClick={() => updateStatus(app.application_id, "REJECTED")}
                      disabled={updating === app.application_id || app.status === "REJECTED"}
                      style={{ ...s.btnReject, opacity: app.status === "REJECTED" ? 0.4 : 1 }}
                    >
                      <IconXCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ── small helper cell ── */
function InfoCell({ label, value, highlight, invertHighlight }) {
  const active = invertHighlight ? (value === 0) : highlight;
  return (
    <div style={s.infoCell}>
      <span style={{ ...s.infoCellVal, color: active ? "#22c55e" : "var(--text)" }}>{value ?? "—"}</span>
      <span style={s.infoCellLabel}>{label}</span>
    </div>
  );
}

const getStatusStyle = (status) => {
  switch (status) {
    case "SHORTLISTED": return { background: "rgba(34,197,94,0.1)", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" };
    case "REJECTED": return { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" };
    default: return { background: "rgba(251,191,36,0.1)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" };
  }
};

const s = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 80px" },
  backBtn: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, padding: 0, marginBottom: "20px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  eyebrow: { color: "#818cf8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px" },
  title: { color: "var(--text)", fontSize: "32px", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 6px" },
  sub: { color: "var(--muted)", fontSize: "15px", margin: 0 },

  // Stats bar
  statsBar: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  statChip: { display: "flex", flexDirection: "column", alignItems: "center", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px 24px", gap: "4px", minWidth: "80px" },
  statNum: { fontSize: "26px", fontWeight: 900, lineHeight: 1 },
  statLabel: { fontSize: "11px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" },

  // Controls
  controlBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "12px", flexWrap: "wrap" },
  tabs: { display: "flex", gap: "6px" },
  tab: { padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted)" },
  tabActive: { background: "rgba(129,140,248,0.1)", borderColor: "rgba(129,140,248,0.4)", color: "#818cf8" },
  rightControls: { display: "flex", gap: "10px", alignItems: "center" },
  searchWrap: { display: "flex", alignItems: "center", gap: "8px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 13px" },
  searchInput: { border: "none", background: "transparent", outline: "none", color: "var(--text)", fontSize: "13px", width: "180px", fontFamily: "inherit" },
  sortSelect: { padding: "8px 13px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text)", fontSize: "13px", cursor: "pointer", outline: "none" },

  // List
  empty: { textAlign: "center", padding: "100px 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  list: { display: "flex", flexDirection: "column", gap: "14px" },
  appCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },

  // Card top
  cardTop: { display: "flex", gap: "14px", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: "14px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 900, color: "#818cf8", flexShrink: 0 },
  nameRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" },
  appName: { color: "var(--text)", fontSize: "17px", fontWeight: 700, margin: 0 },
  rollPill: { fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" },
  deptText: { color: "var(--muted)", fontSize: "13px", margin: 0 },
  scoreBadge: { display: "flex", alignItems: "center", gap: "5px", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: "8px", padding: "5px 10px", fontSize: "12px", fontWeight: 700, color: "#818cf8", flexShrink: 0 },
  statusPill: { padding: "5px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 800, border: "1px solid", letterSpacing: "0.02em", flexShrink: 0 },

  // Info grid
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" },
  infoCell: { background: "var(--bg)", borderRadius: "10px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "3px", alignItems: "center", textAlign: "center" },
  infoCellVal: { fontSize: "15px", fontWeight: 800, color: "var(--text)" },
  infoCellLabel: { fontSize: "10px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },

  // Skills
  skillsWrap: { display: "flex", flexWrap: "wrap", gap: "6px" },
  skillTag: { padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" },
  skillTagMatch: { background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.3)", color: "#818cf8" },

  // Footer
  cardFooter: { display: "flex", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "14px" },
  resumeLink: { display: "flex", alignItems: "center", gap: "8px", color: "#818cf8", fontWeight: 700, fontSize: "14px", textDecoration: "none" },
  actions: { display: "flex", gap: "10px" },
  btnShortlist: { padding: "8px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnReject: { padding: "8px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnEmail: { padding: "9px 18px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.3)", color: "#818cf8", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },
  btnExport: { padding: "9px 18px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },
  toastOk: { display: "flex", alignItems: "center", gap: "10px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", fontWeight: 600 },
  toastErr: { display: "flex", alignItems: "center", gap: "10px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", fontWeight: 600 },
  toastClose: { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "16px", padding: "0 4px" },
};
