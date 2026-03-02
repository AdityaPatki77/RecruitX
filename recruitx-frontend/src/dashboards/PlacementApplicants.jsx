import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  IconUsers, IconCheckCircle, IconXCircle, IconFileText,
  IconArrowLeft, IconClock, IconBuilding, IconMail, IconPhone,
} from "../components/Icons";

export default function PlacementApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <>
      <Navbar />
      <div style={s.page}>
        <div style={s.header}>
          <button onClick={() => navigate("/placement")} style={s.backBtn}>
            <IconArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={s.headerContent}>
            <div>
              <p style={s.eyebrow}>APPLICANT TRACKING</p>
              <h1 style={s.title}>{job?.title || "Loading..."}</h1>
              <p style={s.sub}>{job?.company_name} · {applicants.length} Total Applicants</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={s.empty}><IconClock size={32} color="var(--muted)" /><p>Loading applicants...</p></div>
        ) : applicants.length === 0 ? (
          <div style={s.empty}><IconUsers size={40} color="var(--muted)" /><p>No applications found yet</p></div>
        ) : (
          <div style={s.list}>
            {applicants.map((app) => (
              <div key={app.application_id} style={s.appCard}>
                <div style={s.cardTop}>
                  <div style={s.avatar}>
                    {app.full_name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={s.appName}>{app.full_name}</h3>
                    <div style={s.appInfoGrid}>
                      <span style={s.infoItem}><IconBuilding size={14} /> {app.department}</span>
                      <span style={s.infoItem}><IconCheckCircle size={14} /> CGPA: {app.cgpa}</span>
                    </div>
                  </div>
                  <div style={{ ...s.statusPill, ...getStatusStyle(app.status) }}>
                    {app.status}
                  </div>
                </div>

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

const getStatusStyle = (status) => {
  switch (status) {
    case "SHORTLISTED": return { background: "rgba(34,197,94,0.1)", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" };
    case "REJECTED": return { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" };
    default: return { background: "rgba(255,172,65,0.1)", color: "#FFAC41", borderColor: "rgba(255,172,65,0.3)" };
  }
};

const A = "rgba(255,172,65,";

const s = {
  page: { maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 80px" },
  header: { marginBottom: "32px" },
  backBtn: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, padding: 0, marginBottom: "20px", width: "auto" },
  headerContent: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  eyebrow: { color: "#FFAC41", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px" },
  title: { color: "var(--text)", fontSize: "32px", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 6px" },
  sub: { color: "var(--muted)", fontSize: "15px", margin: 0 },

  empty: { textAlign: "center", padding: "100px 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  list: { display: "flex", flexDirection: "column", gap: "14px" },
  appCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" },

  cardTop: { display: "flex", gap: "16px", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: "14px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 900, color: "#FFAC41" },
  appName: { color: "var(--text)", fontSize: "18px", fontWeight: 700, margin: "0 0 6px" },
  appInfoGrid: { display: "flex", gap: "16px", flexWrap: "wrap" },
  infoItem: { display: "flex", alignItems: "center", gap: "6px", color: "var(--muted)", fontSize: "13px" },
  statusPill: { padding: "5px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 800, border: "1px solid", letterSpacing: "0.02em" },

  cardFooter: { display: "flex", alignItems: "center", pt: "20px", borderTop: "1px solid var(--border)", paddingTop: "16px" },
  resumeLink: { display: "flex", alignItems: "center", gap: "8px", color: "#FFAC41", fontWeight: 700, fontSize: "14px", textDecoration: "none" },
  actions: { display: "flex", gap: "10px" },
  btnShortlist: { width: "auto", padding: "8px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  btnReject: { width: "auto", padding: "8px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
};