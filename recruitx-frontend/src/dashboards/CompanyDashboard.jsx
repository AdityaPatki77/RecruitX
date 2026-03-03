import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { IconBriefcase, IconCheckCircle, IconClock, IconPlus, IconBuilding, IconX, IconEdit, IconXCircle } from "../components/Icons";

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [posting, setPosting] = useState(false);

  const [job, setJob] = useState({
    title: "", company_name: "", min_cgpa: "", department: "", skill: "", external_link: "", max_backlogs: "0",
  });
  const [editJobId, setEditJobId] = useState(null);  // null = create mode, number = edit mode

  const BLANK_JOB = { title: "", company_name: "", min_cgpa: "", department: "", skill: "", external_link: "", max_backlogs: "0" };

  const fetchJobs = () => {
    setLoading(true);
    api.get("/company/my-jobs")
      .then(res => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const openCreate = () => { setJob(BLANK_JOB); setEditJobId(null); setShowJobModal(true); };
  const openEdit = (j) => {
    setJob({ title: j.title, min_cgpa: j.min_cgpa, max_backlogs: j.max_backlogs, department: j.department || "", skill: j.required_skill || "", external_link: j.external_link || "" });
    setEditJobId(j.id);
    setShowJobModal(true);
  };

  const postJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const payload = { ...job, min_cgpa: Number(job.min_cgpa), max_backlogs: Number(job.max_backlogs) };
      if (editJobId) {
        await api.put(`/company/update-job/${editJobId}`, payload);
        alert("Job updated! It will need re-approval from the placement cell.");
      } else {
        await api.post("/company/create-job", payload);
        alert("Job posted! Awaiting placement cell approval.");
      }
      setShowJobModal(false);
      setJob(BLANK_JOB);
      setEditJobId(null);
      fetchJobs();
    } catch (err) {
      alert(err?.response?.data?.detail || "Error saving job.");
    }
    setPosting(false);
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Delete this job listing? This cannot be undone.")) return;
    try {
      await api.delete(`/company/delete-job/${jobId}`);
      fetchJobs();
    } catch (err) {
      alert(err?.response?.data?.detail || "Error deleting job.");
    }
  };

  const approvedJobs = jobs.filter(j => j.is_approved).length;
  const pendingJobs = jobs.filter(j => !j.is_approved).length;

  return (
    <>
      <Navbar />
      <div style={s.page}>
        <div style={s.pageHeader}>
          <div>
            <div style={s.eyebrow}><IconBuilding size={14} style={{ display: 'inline', marginBottom: '-2px' }} /> COMPANY PORTAL</div>
            <h1 style={s.pageTitle}>Dashboard Overview</h1>
            <p style={s.pageSub}>Manage your job listings and track approval statuses.</p>
          </div>
          <button style={s.btnPrimary} onClick={openCreate}>
            <IconPlus size={16} /> Post New Job
          </button>
        </div>

        {/* STATS CARDS */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statIconWrap}><IconBriefcase size={22} color="#818cf8" /></div>
            <div>
              <p style={s.statLabel}>Total Opportunities</p>
              <h3 style={s.statValue}>{jobs.length}</h3>
            </div>
          </div>
          <div style={s.statCard}>
            <div style={s.statIconWrapGreen}><IconCheckCircle size={22} color="#34d399" /></div>
            <div>
              <p style={s.statLabel}>Approved & Live</p>
              <h3 style={s.statValue}>{approvedJobs}</h3>
            </div>
          </div>
          <div style={s.statCard}>
            <div style={s.statIconWrapWarn}><IconClock size={22} color="#fbbf24" /></div>
            <div>
              <p style={s.statLabel}>Pending Approval</p>
              <h3 style={s.statValue}>{pendingJobs}</h3>
            </div>
          </div>
        </div>

        {/* JOBS TABLE */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h2 style={s.tableTitle}>Your Job Postings</h2>
          </div>

          {loading ? (
            <div style={s.emptyState}>Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div style={s.emptyState}>
              <IconBriefcase size={32} color="var(--muted)" style={{ opacity: 0.5, marginBottom: '10px' }} />
              <p>You haven't posted any jobs yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Job Title</th>
                    <th style={s.th}>Department / Skills</th>
                    <th style={s.th}>Req. CGPA</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id} style={s.tr}>
                      <td style={s.td}>
                        <div style={s.jobTitle}>{j.title}</div>
                        <div style={s.jobCompany}>{j.company_name}</div>
                      </td>
                      <td style={s.td}>
                        <div style={s.cellText}>{j.department || "—"}</div>
                        <div style={s.cellSub}>{j.required_skill || "Any"}</div>
                      </td>
                      <td style={s.td}>
                        <div style={s.cellText}>{j.min_cgpa}+</div>
                        <div style={s.cellSub}>Max backlogs: {j.max_backlogs}</div>
                      </td>
                      <td style={s.td}>
                        {j.is_approved ? (
                          <span style={s.statusApproved}><IconCheckCircle size={14} /> Approved</span>
                        ) : (
                          <span style={s.statusPending}><IconClock size={14} /> Pending</span>
                        )}
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => openEdit(j)} style={s.btnIconEdit} title="Edit">
                            <IconEdit size={14} />
                          </button>
                          <button onClick={() => deleteJob(j.id)} style={s.btnIconDelete} title="Delete">
                            <IconXCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* POST JOB MODAL */}
      {showJobModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Create Job Posting</h2>
              <button style={s.modalClose} onClick={() => setShowJobModal(false)}>
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={postJob} style={s.form}>
              <div style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Job Title*</label>
                  <input required style={s.fieldInput} value={job.title}
                    onChange={e => setJob({ ...job, title: e.target.value })}
                    placeholder="e.g. Software Engineer" />
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Company Name*</label>
                  <input required style={s.fieldInput} value={job.company_name}
                    onChange={e => setJob({ ...job, company_name: e.target.value })}
                    placeholder="e.g. Google" />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.fieldLabel}>Core Skills Required*</label>
                <input required style={s.fieldInput} value={job.skill}
                  onChange={e => setJob({ ...job, skill: e.target.value })}
                  placeholder="e.g. React, Python, AWS" />
              </div>

              <div style={s.field}>
                <label style={s.fieldLabel}>Target Department*</label>
                <input required style={s.fieldInput} value={job.department}
                  onChange={e => setJob({ ...job, department: e.target.value })}
                  placeholder="e.g. Computer Science" />
              </div>

              <div style={s.field}>
                <label style={s.fieldLabel}>External Application Link (Optional)</label>
                <input style={s.fieldInput} value={job.external_link}
                  type="url"
                  onChange={e => setJob({ ...job, external_link: e.target.value })}
                  placeholder="https://company.careers.com/..." />
              </div>

              <div style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Minimum CGPA*</label>
                  <input required type="number" step="0.1" style={s.fieldInput} value={job.min_cgpa}
                    onChange={e => setJob({ ...job, min_cgpa: e.target.value })}
                    placeholder="e.g. 7.5" />
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Max Backlogs Allowed</label>
                  <input required type="number" style={s.fieldInput} value={job.max_backlogs}
                    onChange={e => setJob({ ...job, max_backlogs: e.target.value })} />
                </div>
              </div>

              <div style={s.modalFooter}>
                <button type="button" style={s.btnOutline} onClick={() => setShowJobModal(false)}>Cancel</button>
                <button type="submit" style={s.btnSubmit} disabled={posting}>
                  {posting ? "Posting..." : "Submit Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
}

const s = {
  page: { maxWidth: "1080px", margin: "0 auto", padding: "36px 24px 80px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" },
  eyebrow: { color: "#818cf8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px", textTransform: "uppercase" },
  pageTitle: { color: "var(--text)", fontSize: "32px", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 4px" },
  pageSub: { color: "var(--muted)", fontSize: "15px", margin: 0 },

  btnPrimary: { background: "linear-gradient(135deg, #818cf8, #6366f1)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" },
  statCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" },
  statIconWrap: { width: 48, height: 48, borderRadius: "12px", background: "rgba(129, 140, 248, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" },
  statIconWrapGreen: { width: 48, height: 48, borderRadius: "12px", background: "rgba(52, 211, 153, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" },
  statIconWrapWarn: { width: 48, height: 48, borderRadius: "12px", background: "rgba(251, 191, 36, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" },
  statLabel: { color: "var(--muted)", fontSize: "13px", fontWeight: 600, margin: "0 0 4px" },
  statValue: { color: "var(--text)", fontSize: "24px", fontWeight: 800, margin: 0 },

  tableCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" },
  tableHeader: { padding: "20px 24px", borderBottom: "1px solid var(--border)" },
  tableTitle: { margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text)" },

  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "14px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg)", color: "var(--muted)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  tr: { borderBottom: "1px solid var(--border)", transition: "background 0.2s ease" },
  td: { padding: "16px 24px", verticalAlign: "top" },

  jobTitle: { color: "var(--text)", fontSize: "14px", fontWeight: 700, marginBottom: "4px" },
  jobCompany: { color: "var(--muted)", fontSize: "13px" },
  cellText: { color: "var(--text)", fontSize: "14px", fontWeight: 500, marginBottom: "4px" },
  cellSub: { color: "var(--muted)", fontSize: "13px" },

  statusApproved: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "6px", background: "rgba(52, 211, 153, 0.1)", color: "#34d399", fontSize: "12px", fontWeight: 600 },
  statusPending: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "6px", background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", fontSize: "12px", fontWeight: 600 },

  emptyState: { padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "14px" },

  /* MODAL */
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modalContent: { background: "var(--card)", borderRadius: "20px", width: "100%", maxWidth: "560px", border: "1px solid var(--border)", animation: "fadeIn 0.2s ease", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: 800, color: "var(--text)" },
  modalClose: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center" },

  form: { padding: "24px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  field: { marginBottom: "16px" },
  fieldLabel: { display: "block", color: "var(--muted)", fontSize: "12px", fontWeight: 700, marginBottom: "8px", letterSpacing: "0.02em" },
  fieldInput: { width: "100%", padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text)", fontSize: "14px", boxSizing: "border-box", outline: "none", fontFamily: "inherit" },

  modalFooter: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" },
  btnOutline: { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 18px", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  btnSubmit: { background: "#818cf8", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer" },
  btnIconEdit: { padding: "6px 10px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.3)", color: "#818cf8", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" },
  btnIconDelete: { padding: "6px 10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" },
};

