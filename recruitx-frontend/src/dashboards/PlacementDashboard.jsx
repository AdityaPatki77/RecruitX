import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  IconBriefcase, IconCheckCircle, IconClock, IconPlus,
  IconBuilding, IconUsers, IconZap, IconEye, IconBarChart,
  IconUpload, IconX, IconShield,
} from "../components/Icons";

export default function PlacementDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [approving, setApproving] = useState(null);
  const navigate = useNavigate();

  // ── Spreadsheet sync state ─────────────────────────────────────
  const [syncFile, setSyncFile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);  // { created, skipped, errors }
  const [syncError, setSyncError] = useState("");
  const fileRef = useRef();

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const res = await api.get("/placement/all-jobs"); setJobs(res.data); }
    catch { alert("Error loading jobs"); }
    finally { setLoading(false); }
  };

  const uploadMasterSheet = async () => {
    if (!syncFile) return;
    setSyncing(true); setSyncResult(null); setSyncError("");
    try {
      const fd = new FormData();
      fd.append("file", syncFile);
      const res = await api.post("/placement/upload-student-master-sheet", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSyncResult(res.data);
      setSyncFile(null);
    } catch (e) {
      setSyncError(e?.response?.data?.detail || "Upload failed. Please try again.");
    } finally { setSyncing(false); }
  };

  const approveJob = async (jobId) => {
    setApproving(jobId);
    try { await api.put(`/placement/approve-job/${jobId}`); fetchJobs(); }
    catch { alert("Error approving job"); }
    finally { setApproving(null); }
  };

  const filtered = jobs.filter(j =>
    filter === "all" ? true : filter === "approved" ? j.is_approved : !j.is_approved
  );

  const stats = {
    total: jobs.length,
    approved: jobs.filter(j => j.is_approved).length,
    pending: jobs.filter(j => !j.is_approved).length,
  };

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* ── STUDENT DATA SYNC CARD ── */}
        <div style={s.syncCard}>
          <div style={s.syncLeft}>
            <div style={s.syncIconBox}><IconShield size={22} color="#FFAC41" /></div>
            <div>
              <p style={s.syncTitle}>Student Data Sync</p>
              <p style={s.syncSub}>Upload the official Excel sheet — students are auto-registered with academic data locked.</p>
            </div>
          </div>

          <div style={s.syncRight}>
            {/* File picker */}
            <input ref={fileRef} type="file" accept=".xlsx" style={{ display: "none" }}
              onChange={e => { setSyncFile(e.target.files[0]); setSyncResult(null); setSyncError(""); }} />
            <button onClick={() => fileRef.current.click()} style={s.btnOutline}>
              <IconUpload size={15} /> {syncFile ? syncFile.name : "Choose .xlsx file"}
            </button>
            <button onClick={uploadMasterSheet} disabled={!syncFile || syncing}
              style={{ ...s.btnSync, opacity: (!syncFile || syncing) ? 0.5 : 1 }}>
              {syncing ? "Syncing…" : "Sync Students"}
            </button>
          </div>

          {/* Warning */}
          <div style={{ width: "100%" }}>
            <div style={s.syncWarn}>
              ⚠️ &nbsp;This will <strong>wipe all existing student accounts</strong> and recreate them from the sheet. Run only when you have an updated official file.
            </div>
          </div>

          {/* Result */}
          {syncResult && (
            <div style={s.syncSuccess}>
              <IconCheckCircle size={16} color="#34d399" />
              <strong>{syncResult.total_students_created}</strong> students synced ·
              <span style={{ color: "var(--muted)" }}> {syncResult.rows_skipped} skipped</span>
              {syncResult.errors?.length > 0 && (
                <span style={{ color: "#f87171", marginLeft: 8 }}> · {syncResult.errors.length} errors</span>
              )}
            </div>
          )}
          {syncError && (
            <div style={s.syncErrBox}><IconX size={14} /> {syncError}</div>
          )}
        </div>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div style={s.headerGlow} />
          <div style={s.headerContent}>
            <div>
              <p style={s.eyebrow}>PLACEMENT OFFICE</p>
              <h1 style={s.title}>Job Management</h1>
              <p style={s.sub}>Oversee every listing — approve, track, and manage applicants.</p>
            </div>
            <button onClick={() => navigate("/placement/create")} style={s.btnPrimary}>
              <IconPlus size={16} />
              Post New Job
            </button>
          </div>

          {/* STATS */}
          <div style={s.statsRow}>
            {[
              { icon: <IconBriefcase size={20} color="#FFAC41" />, label: "Total Listings", val: stats.total },
              { icon: <IconCheckCircle size={20} color="#FFAC41" />, label: "Approved", val: stats.approved },
              { icon: <IconClock size={20} color="#FFAC41" />, label: "Pending Review", val: stats.pending },
              {
                icon: <IconBarChart size={20} color="#FFAC41" />, label: "Avg per Company",
                val: stats.approved ? (stats.approved / Math.max(new Set(jobs.map(j => j.company_name)).size, 1)).toFixed(1) : "0"
              },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <div style={s.statIcon}>{st.icon}</div>
                <div style={s.statVal}>{st.val}</div>
                <div style={s.statLbl}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div style={s.filterBar}>
          <p style={s.sectionTitle}>Listings</p>
          <div style={s.filterBtns}>
            {[["all", "All"], ["approved", "Approved"], ["pending", "Pending"]].map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                style={{ ...s.filterBtn, ...(filter === key ? s.filterActive : {}) }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CARDS ── */}
        {loading ? (
          <div style={s.empty}><IconClock size={32} color="var(--muted)" /><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}><IconBriefcase size={40} color="var(--muted)" /><p>No jobs found</p></div>
        ) : (
          <div style={s.grid}>
            {filtered.map(job => (
              <div key={job.id} style={{ ...s.jobCard, borderColor: job.is_approved ? "rgba(255,172,65,0.2)" : "rgba(255,172,65,0.08)" }}>

                <div style={s.cardTop}>
                  <div style={s.logoBox}>
                    <IconBuilding size={22} color="#FFAC41" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={s.jobTitle}>{job.title}</h3>
                    <p style={s.companyName}>{job.company_name}</p>
                  </div>
                  <span style={{ ...s.pill, ...(job.is_approved ? s.pillApproved : s.pillPending) }}>
                    {job.is_approved ? <><IconCheckCircle size={12} /> Approved</> : <><IconClock size={12} /> Pending</>}
                  </span>
                </div>

                <div style={s.chips}>
                  {[
                    `CGPA ≥ ${job.min_cgpa}`,
                    `10th ≥ ${job.min_tenth}%`,
                    `12th ≥ ${job.min_twelfth}%`,
                    `Backlogs ≤ ${job.max_backlogs}`,
                    job.department && `${job.department}`,
                    job.required_skill && `${job.required_skill}`,
                    job.internship_required && "Internship Req.",
                  ].filter(Boolean).map(c => <span key={c} style={s.chip}>{c}</span>)}
                </div>

                <div style={s.cardFooter}>
                  {!job.is_approved && (
                    <button onClick={() => approveJob(job.id)} disabled={approving === job.id}
                      style={{ ...s.btnApprove, opacity: approving === job.id ? 0.6 : 1 }}>
                      <IconCheckCircle size={15} />
                      {approving === job.id ? "Approving…" : "Approve"}
                    </button>
                  )}
                  <button onClick={() => navigate(`/placement/applicants/${job.id}`)} style={s.btnView}>
                    <IconUsers size={15} />
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const A = "rgba(255,172,65,"; // amber helper

const s = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 80px" },

  // ── sync card ──
  syncCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px 28px", marginBottom: "20px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" },
  syncLeft: { display: "flex", alignItems: "center", gap: "14px", flex: "1 1 300px" },
  syncIconBox: { width: 44, height: 44, borderRadius: "12px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  syncTitle: { color: "var(--text)", fontWeight: 700, fontSize: "15px", margin: "0 0 2px" },
  syncSub: { color: "var(--muted)", fontSize: "12px", margin: 0 },
  syncRight: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" },
  syncWarn: { background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", marginTop: "4px" },
  syncSuccess: { display: "flex", alignItems: "center", gap: "8px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#34d399", marginTop: "4px" },
  syncErrBox: { display: "flex", alignItems: "center", gap: "8px", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#f87171", marginTop: "4px" },
  btnOutline: { width: "auto", padding: "8px 14px", background: "transparent", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnSync: { width: "auto", padding: "8px 18px", background: "#FFAC41", border: "none", color: "#000", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },

  header: { position: "relative", overflow: "hidden", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "36px", marginBottom: "24px" },
  headerGlow: { position: "absolute", width: 500, height: 300, top: -120, right: -80, borderRadius: "50%", background: `radial-gradient(circle, ${A}0.1), transparent 65%)`, pointerEvents: "none" },
  headerContent: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "32px" },
  eyebrow: { color: "#FFAC41", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px" },
  title: { color: "var(--text)", fontSize: "34px", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 8px" },
  sub: { color: "var(--muted)", fontSize: "14px", margin: 0 },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", position: "relative" },
  statCard: { background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "6px" },
  statIcon: { width: 40, height: 40, borderRadius: "12px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4px" },
  statVal: { color: "var(--text)", fontSize: "28px", fontWeight: 800, lineHeight: 1 },
  statLbl: { color: "var(--muted)", fontSize: "12px" },

  filterBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" },
  sectionTitle: { color: "var(--text)", fontSize: "17px", fontWeight: 700, margin: 0 },
  filterBtns: { display: "flex", gap: "6px" },
  filterBtn: { width: "auto", padding: "7px 16px", background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  filterActive: { background: `${A}0.1)`, borderColor: `${A}0.4)`, color: "#FFAC41" },

  empty: { textAlign: "center", padding: "80px 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" },
  jobCard: { background: "var(--card)", border: "1px solid", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },

  cardTop: { display: "flex", alignItems: "flex-start", gap: "14px" },
  logoBox: { width: 50, height: 50, borderRadius: "14px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  jobTitle: { color: "var(--text)", fontSize: "16px", fontWeight: 700, margin: "0 0 3px", letterSpacing: "-0.01em" },
  companyName: { color: "var(--muted)", fontSize: "13px", margin: 0 },
  pill: { padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, border: "1px solid", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  pillApproved: { background: `${A}0.1)`, color: "#FFAC41", borderColor: `${A}0.3)` },
  pillPending: { background: "var(--border)", color: "var(--muted)", borderColor: "var(--border)" },

  chips: { display: "flex", flexWrap: "wrap", gap: "7px" },
  chip: { padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" },

  cardFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "14px" },
  btnApprove: { width: "auto", padding: "8px 16px", background: `${A}0.1)`, border: `1px solid ${A}0.3)`, color: "#FFAC41", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnView: { width: "auto", padding: "8px 16px", background: "#FFAC41", border: "none", color: "#000", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnPrimary: { width: "auto", padding: "12px 22px", background: "#FFAC41", color: "#000", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
};