import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  IconEdit, IconBriefcase, IconUpload, IconCheckCircle,
  IconZap, IconArrowRight, IconDownload, IconShield,
  IconFileText, IconRocket, IconStar, IconX, IconPhone, IconEyeOff, IconEye,
} from "../components/Icons";

/* ─── renders a parsed resume section as nicely formatted text ─── */
const ResumeSection = ({ text, emptyMsg, icon: Icon }) => {
  if (!text || !text.trim()) return <p style={s.cardEmpty}>{emptyMsg}</p>;
  return (
    <div style={s.sectionContainer}>
      {text.split("\n").map((line, i) => {
        const isBullet = line.trimStart().startsWith("• ");
        const content = isBullet ? line.trimStart().slice(2) : line;
        if (!line.trim()) return <div key={i} style={{ height: "6px" }} />;
        if (isBullet) {
          return (
            <div key={i} style={s.bulletRow}>
              <span style={s.bulletDot}>•</span>
              <span style={s.bulletText}>{content}</span>
            </div>
          );
        }
        return (
          <div key={i} style={s.itemHeader}>
            {Icon && <Icon size={14} color="#818cf8" style={{ marginTop: "2px" }} />}
            <span style={s.sectionTitle}>{content}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── locked field ───────────────────────────────────────────────── */
const LockedField = ({ label, value }) => (
  <div style={s.field}>
    <label style={s.fieldLabel}>
      {label} <span style={s.lockBadge}>🔒 Official</span>
    </label>
    <div style={s.lockedInput}>{value ?? "—"}</div>
  </div>
);

/* ─── editable field ─────────────────────────────────────────────── */
const Field = ({ label, value, onChange, type = "text", placeholder }) => (
  <div style={s.field}>
    <label style={s.fieldLabel}>{label}</label>
    <input style={s.fieldInput} type={type}
      placeholder={placeholder || label} value={value ?? ""}
      onChange={e => onChange(e.target.value)} />
  </div>
);


/* ─── main component ─────────────────────────────────────────────── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "", phone: "", skills: "",
    internship_experience: "NO", experience_months: "",
    linkedin: "", portfolio: "",
    parsed_skills: "", internships: "", projects: "", achievements: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "applications"
  const [myApps, setMyApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // change password modal
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new_: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // parser
  const [parseFile, setParseFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState("");

  useEffect(() => {
    api.get("/student/profile").then(res => {
      if (res.data) { setProfile(res.data); populateForm(res.data); }
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (activeTab === "applications" && myApps.length === 0) {
      setAppsLoading(true);
      api.get("/student/my-applications")
        .then(res => setMyApps(res.data))
        .catch(() => { })
        .finally(() => setAppsLoading(false));
    }
  }, [activeTab]);

  const populateForm = d => setForm({
    full_name: d.full_name || "",
    phone: d.phone || "",
    skills: d.skills || "",
    internship_experience: d.internship_experience || "NO",
    experience_months: d.experience_months || "",
    linkedin: d.linkedin || "",
    portfolio: d.portfolio || "",
    parsed_skills: d.parsed_skills || "",
    internships: d.internships || "",
    projects: d.projects || "",
    achievements: d.achievements || "",
  });

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const saveProfile = async () => {
    setLoading(true);
    try {
      await api.post("/student/profile", {
        ...form,
        experience_months: form.experience_months ? Number(form.experience_months) : 0,
      });
      const updated = await api.get("/student/profile");
      setProfile(updated.data);
      populateForm(updated.data);
      setEditMode(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert("Error saving profile"); }
    finally { setLoading(false); }
  };

  const parseResume = async () => {
    if (!parseFile) return;
    setParsing(true); setParseResult(null); setParseError("");
    try {
      const fd = new FormData();
      fd.append("file", parseFile);
      const res = await api.post("/student/parse-resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setParseResult(res.data);
      const updated = await api.get("/student/profile");
      setProfile(updated.data);
      populateForm(updated.data);
      setParseFile(null);
    } catch (e) {
      setParseError(e?.response?.data?.detail || "Parsing failed. Make sure your PDF has selectable text.");
    } finally { setParsing(false); }
  };

  // ── derived ────────────────────────────────────────────────────────
  const cgpa = parseFloat(profile?.cgpa || 0);
  const cgpaPct = Math.min((cgpa / 10) * 100, 100);
  const cgpaColor = cgpa >= 7.5 ? "#818cf8" : cgpa >= 6 ? "#fb923c" : "rgba(129,140,248,0.4)";
  const verified = profile?.verified_academics;

  // merged skills (manual + parsed), deduplicated
  const allSkills = [...new Set([
    ...(profile?.skills || "").split(","),
    ...(profile?.parsed_skills || "").split(","),
  ].map(s => s.trim()).filter(Boolean))];

  const submitChangePassword = async (e) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (pwForm.new_ !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    if (pwForm.new_.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    setPwLoading(true);
    try {
      await api.post("/student/change-password", { old_password: pwForm.old, new_password: pwForm.new_ });
      setPwSuccess("Password changed successfully! ✅");
      setPwForm({ old: "", new_: "", confirm: "" });
      setTimeout(() => { setShowPwModal(false); setPwSuccess(""); }, 1800);
    } catch (err) {
      setPwError(err?.response?.data?.detail || "Something went wrong.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* PAGE HEADER */}
        <div style={s.pageHeader}>
          <div>
            <p style={s.eyebrow}>STUDENT PORTAL</p>
            <h1 style={s.pageTitle}>My Dashboard</h1>
            <p style={s.pageSub}>Manage your profile, applications, and career journey.</p>
          </div>
          {profile && !editMode && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowPwModal(true)} style={s.btnPw}>
                <IconShield size={15} /> Change Password
              </button>
              <button onClick={() => setEditMode(true)} style={s.btnOutline}>
                <IconEdit size={15} /> Edit Profile
              </button>
              <button onClick={() => navigate("/student/jobs")} style={s.btnPrimary}>
                Browse Jobs <IconArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* DEFAULT PASSWORD WARNING BANNER */}
        {profile?.is_default_password !== false && (
          <div style={s.defaultPwBanner}>
            <IconShield size={16} color="#f59e0b" />
            <span>You are using a <strong>default password</strong>. Please change it to secure your account.</span>
            <button onClick={() => setShowPwModal(true)} style={s.bannerBtn}>Change Now →</button>
          </div>
        )}

        {/* TAB SWITCHER */}
        {profile && !editMode && (
          <div style={s.tabBar}>
            <button onClick={() => setActiveTab("profile")}
              style={{ ...s.tabBtn, ...(activeTab === "profile" ? s.tabBtnActive : {}) }}>
              My Profile
            </button>
            <button onClick={() => setActiveTab("applications")}
              style={{ ...s.tabBtn, ...(activeTab === "applications" ? s.tabBtnActive : {}) }}>
              My Applications
              {myApps.length > 0 && <span style={s.tabCount}>{myApps.length}</span>}
            </button>
          </div>
        )}

        {saved && (
          <div style={s.toast}>
            <IconCheckCircle size={16} color="#818cf8" /> Profile saved!
          </div>
        )}

        {profile && !editMode && activeTab === "applications" ? (
          /* ─── MY APPLICATIONS TAB ─── */
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {appsLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>Loading applications…</div>
            ) : myApps.length === 0 ? (
              <div style={s.emptyApps}>
                <IconBriefcase size={40} color="var(--muted)" />
                <p>No applications yet — <button onClick={() => navigate("/student/jobs")} style={s.inlineLink}>Browse jobs</button></p>
              </div>
            ) : myApps.map(app => (
              <div key={app.application_id} style={s.appRow}>
                <div style={s.appLeft}>
                  <div style={s.appIconBox}>
                    <IconBriefcase size={18} color="#818cf8" />
                  </div>
                  <div>
                    <p style={s.appJobTitle}>{app.job_title}</p>
                    <p style={s.appCompany}>{app.company_name}{app.department ? ` · ${app.department}` : ""}</p>
                    <p style={s.appDate}>Applied {app.applied_at}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {app.external_link && (
                    <a href={app.external_link} target="_blank" rel="noreferrer" style={s.appExtLink}>
                      Apply Link <IconArrowRight size={12} />
                    </a>
                  )}
                  <span style={{ ...s.appStatus, ...getAppStatusStyle(app.status) }}>
                    {app.status === "APPLIED" ? "Pending" : app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : profile && !editMode ? (
          <div style={s.outerGrid}>
            {/* ── LEFT ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* IDENTITY */}
              <div style={s.card}>
                <div style={s.avatarWrap}>
                  <div style={s.avatarRing}>
                    <div style={s.avatar}>{(profile.full_name?.[0] || "S").toUpperCase()}</div>
                  </div>
                </div>
                <h2 style={s.profileName}>{profile.full_name}</h2>
                {profile.roll_no && <p style={s.rollNo}>{profile.roll_no}</p>}
                <p style={s.profileDept}>{[profile.degree, profile.department].filter(Boolean).join(" · ")}</p>
                <p style={s.profileYear}>Batch of {profile.year_of_passing}</p>
                {profile.college_name && <p style={{ ...s.profileDept, marginTop: 2 }}>{profile.college_name}</p>}
                {profile.phone && (
                  <div style={s.profileDetail}><IconPhone size={13} color="var(--muted)" /><span>{profile.phone}</span></div>
                )}
                <div style={s.divider} />
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                  {profile.gender && <span style={s.infoPill}>{profile.gender}</span>}
                  {profile.nationality && <span style={s.infoPill}>{profile.nationality}</span>}
                  {profile.dob && <span style={s.infoPill}>{profile.dob.toString().slice(0, 10)}</span>}
                </div>
                <div style={s.divider} />
                {profile.resume_url ? (
                  <a href={`http://127.0.0.1:8000/${profile.resume_url}`} target="_blank"
                    rel="noreferrer" style={s.resumeLink}>
                    <IconDownload size={14} /> View Resume
                  </a>
                ) : (
                  <div style={s.resumeMissing}><IconUpload size={13} /> No resume yet</div>
                )}
                {verified && (
                  <div style={s.verifiedBadge}><IconShield size={13} color="#34d399" /> Verified by Institution</div>
                )}
              </div>

              {/* CGPA CARD */}
              <div style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={s.cardEyebrow}>Academic Score</p>
                  {verified && <span style={s.lockTag}>🔒 Official</span>}
                </div>
                <div style={s.cgpaRow}>
                  <span style={{ ...s.cgpaBig, color: cgpaColor }}>{profile.cgpa}</span>
                  <span style={s.cgpaOf}>/10 CGPA</span>
                </div>
                <div style={s.track}>
                  <div style={{ ...s.bar, width: `${cgpaPct}%` }} />
                </div>
                <div style={s.acGrid}>
                  {[["10th", profile.tenth_percent, "%"],
                  ["12th", profile.twelfth_percent, "%"],
                  ["Diploma", profile.diploma_percent, "%"],
                  ["Backlogs", profile.backlogs, ""],
                  ].filter(([, v]) => v != null).map(([lbl, val, suf]) => (
                    <div key={lbl} style={s.acCell}>
                      <span style={{ ...s.acVal, color: lbl === "Backlogs" && val > 0 ? "#ef4444" : "var(--text)" }}>
                        {val}{suf}
                      </span>
                      <span style={s.acLbl}>{lbl}</span>
                    </div>
                  ))}
                </div>
                {profile.grading_system && (
                  <p style={{ ...s.acLbl, marginTop: 4 }}>System: {profile.grading_system}</p>
                )}
              </div>

              {/* QUICK ACTIONS */}
              <div style={{ ...s.card, background: "rgba(129,140,248,0.04)", borderColor: "rgba(129,140,248,0.15)" }}>
                <p style={s.cardEyebrow}>Quick Actions</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => navigate("/student/jobs")} style={s.btnPrimary}>
                    <IconZap size={15} /> View Jobs
                  </button>
                  <button onClick={() => setEditMode(true)} style={s.btnOutline}>
                    <IconEdit size={15} /> Update Profile
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* SKILLS */}
              <div style={s.card}>
                <p style={s.cardEyebrow}>Skills</p>
                {allSkills.length > 0 ? (
                  <div style={s.skillsWrap}>
                    {allSkills.map((sk, i) => (
                      <span key={i} style={s.skillTag}>{sk}</span>
                    ))}
                  </div>
                ) : (
                  <p style={s.cardEmpty}>No skills yet — edit profile or parse your resume.</p>
                )}
              </div>

              {/* PROJECTS */}
              <div style={s.card}>
                <p style={s.cardEyebrow}>Projects</p>
                <ResumeSection
                  text={profile.projects}
                  icon={IconRocket}
                  emptyMsg="No projects parsed yet — upload your resume below."
                />
              </div>

              {/* INTERNSHIPS */}
              <div style={s.card}>
                <p style={s.cardEyebrow}>Internships</p>
                <ResumeSection
                  text={profile.internships}
                  icon={IconBriefcase}
                  emptyMsg="No internships parsed yet."
                />
              </div>

              {/* ACHIEVEMENTS */}
              <div style={s.card}>
                <p style={s.cardEyebrow}>Achievements &amp; Certifications</p>
                <ResumeSection
                  text={profile.achievements}
                  icon={IconStar}
                  emptyMsg="No achievements parsed yet."
                />
              </div>
            </div>
          </div>

        ) : (
          /* ──────────────── EDIT MODE ──────────────── */
          <div style={s.editCard}>
            <div style={s.editHeader}>
              <div style={s.editIconBox}><IconEdit size={20} color="#818cf8" /></div>
              <div>
                <h2 style={s.editTitle}>Edit Profile</h2>
                <p style={s.editSub}>Academic fields are locked — they come from the official spreadsheet.</p>
              </div>
            </div>

            {verified && (
              <EditSection title="Academic Info — Locked">
                <div style={s.lockedBanner}>
                  <IconShield size={15} color="#34d399" />
                  These fields are verified by your institution and cannot be changed.
                </div>
                <div style={s.formGrid4}>
                  <LockedField label="CGPA" value={profile?.cgpa} />
                  <LockedField label="10th %" value={profile?.tenth_percent} />
                  <LockedField label="12th %" value={profile?.twelfth_percent} />
                  <LockedField label="Backlogs" value={profile?.backlogs} />
                </div>
                <div style={s.formGrid2}>
                  <LockedField label="Degree" value={profile?.degree} />
                  <LockedField label="Branch" value={profile?.department} />
                  <LockedField label="College" value={profile?.college_name} />
                  <LockedField label="Year of Passing" value={profile?.year_of_passing} />
                </div>
              </EditSection>
            )}

            <EditSection title="Personal Info">
              <div style={s.formGrid2}>
                <Field label="Full Name" value={form.full_name} onChange={set("full_name")} />
                <Field label="Phone" value={form.phone} onChange={set("phone")} />
                <Field label="LinkedIn URL" value={form.linkedin} onChange={set("linkedin")} />
                <Field label="Portfolio URL" value={form.portfolio} onChange={set("portfolio")} />
              </div>
            </EditSection>

            <EditSection title="Skills & Experience">
              <Field label="Skills (comma-separated)" placeholder="Python, React, SQL"
                value={form.skills} onChange={set("skills")} />
              <div style={s.field}>
                <label style={s.fieldLabel}>Internship Experience</label>
                <select style={s.fieldSelect} value={form.internship_experience}
                  onChange={e => set("internship_experience")(e.target.value)}>
                  <option value="NO">No internship</option>
                  <option value="YES">Yes — I have internship experience</option>
                </select>
              </div>
              {form.internship_experience === "YES" && (
                <Field label="Duration (months)" type="number"
                  value={form.experience_months} onChange={set("experience_months")} />
              )}
            </EditSection>

            {/* ── RESUME PARSER ── */}
            <EditSection title="Resume Parser — Auto-fill from PDF" last>
              <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 14px" }}>
                Upload your PDF resume — we'll automatically extract Skills, Projects, Internships, and Achievements.
              </p>

              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
                onChange={e => { setParseFile(e.target.files[0]); setParseResult(null); setParseError(""); }} />

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
                <button onClick={() => fileRef.current.click()} style={s.btnOutline}>
                  <IconUpload size={15} />
                  {parseFile ? parseFile.name : "Choose PDF resume"}
                </button>
                <button onClick={parseResume} disabled={!parseFile || parsing}
                  style={{ ...s.btnPrimary, opacity: (!parseFile || parsing) ? 0.5 : 1 }}>
                  {parsing ? "Parsing…" : <><IconFileText size={15} /> Parse Resume</>}
                </button>
              </div>

              {parseError && <div style={s.errBox}><IconX size={14} /> {parseError}</div>}

              {/* Parse result preview */}
              {parseResult && (() => {
                return (
                  <div style={s.parsePreview}>
                    <div style={s.parseSuccess}>
                      <IconCheckCircle size={16} color="#34d399" />
                      Parsed! Found <strong>{parseResult.parsed_skills?.split(",").filter(Boolean).length || 0}</strong> skills
                    </div>

                    {/* Skills preview */}
                    {parseResult.parsed_skills && (
                      <div style={s.previewSection}>
                        <p style={s.previewLabel}>Extracted Skills</p>
                        <div style={s.skillsWrap}>
                          {parseResult.parsed_skills.split(",").map((sk, i) => (
                            <span key={i} style={s.skillTag}>{sk.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects preview */}
                    {parseResult.projects && (
                      <div style={s.previewSection}>
                        <p style={s.previewLabel}>Projects Preview</p>
                        <ResumeSection text={parseResult.projects} emptyMsg="No projects found." />
                      </div>
                    )}

                    {/* Internships preview */}
                    {parseResult.internships && (
                      <div style={s.previewSection}>
                        <p style={s.previewLabel}>Internships Preview</p>
                        <ResumeSection text={parseResult.internships} emptyMsg="No internships found." />
                      </div>
                    )}

                    {/* Achievements preview */}
                    {parseResult.achievements && (
                      <div style={s.previewSection}>
                        <p style={s.previewLabel}>Achievements Preview</p>
                        <ResumeSection text={parseResult.achievements} emptyMsg="No achievements found." />
                      </div>
                    )}
                  </div>
                );
              })()}
            </EditSection>

            <div style={s.editFooter}>
              {profile && <button onClick={() => setEditMode(false)} style={s.btnOutline}>Cancel</button>}
              <div style={{ flex: 1 }} />
              <button onClick={saveProfile} disabled={loading}
                style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Saving…" : "Save Profile"}
                {!loading && <IconArrowRight size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CHANGE PASSWORD MODAL ── */}
      {showPwModal && (
        <div style={s.modalOverlay} onClick={() => { setShowPwModal(false); setPwError(""); setPwSuccess(""); }}>
          <div style={s.pwModal} onClick={e => e.stopPropagation()}>
            <div style={s.pwModalHeader}>
              <div>
                <p style={{ color: "#818cf8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", margin: "0 0 4px" }}>ACCOUNT SECURITY</p>
                <h2 style={{ color: "var(--text)", fontSize: "20px", fontWeight: 800, margin: 0 }}>Change Password</h2>
              </div>
              <button onClick={() => { setShowPwModal(false); setPwError(""); setPwSuccess(""); }} style={s.pwClose}>
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={submitChangePassword} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Current Password */}
              <div style={s.field}>
                <label style={s.fieldLabel}>Current Password</label>
                <div style={s.pwInputWrap}>
                  <input type={showOld ? "text" : "password"} style={{ ...s.fieldInput, paddingRight: "44px" }}
                    placeholder="Enter current password" value={pwForm.old}
                    onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))} />
                  <button type="button" onClick={() => setShowOld(v => !v)} style={s.eyeBtn}>
                    {showOld ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={s.field}>
                <label style={s.fieldLabel}>New Password</label>
                <div style={s.pwInputWrap}>
                  <input type={showNew ? "text" : "password"} style={{ ...s.fieldInput, paddingRight: "44px" }}
                    placeholder="At least 6 characters" value={pwForm.new_}
                    onChange={e => setPwForm(f => ({ ...f, new_: e.target.value }))} />
                  <button type="button" onClick={() => setShowNew(v => !v)} style={s.eyeBtn}>
                    {showNew ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={s.field}>
                <label style={s.fieldLabel}>Confirm New Password</label>
                <input type="password" style={s.fieldInput}
                  placeholder="Repeat new password" value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>

              {pwError && <div style={s.pwErr}>{pwError}</div>}
              {pwSuccess && <div style={s.pwOk}>{pwSuccess}</div>}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
                <button type="button" onClick={() => { setShowPwModal(false); setPwError(""); }} style={s.btnOutline}>Cancel</button>
                <button type="submit" disabled={pwLoading} style={{ ...s.btnPrimary, opacity: pwLoading ? 0.7 : 1 }}>
                  {pwLoading ? "Saving…" : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}


function EditSection({ title, children, last }) {
  return (
    <div style={{ padding: "22px 28px", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <p style={{ color: "#818cf8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

const getAppStatusStyle = (status) => {
  switch (status) {
    case "SHORTLISTED": return { background: "rgba(34,197,94,0.1)", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" };
    case "REJECTED": return { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" };
    default: return { background: "rgba(251,191,36,0.1)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" };
  }
};

const A = "rgba(129,140,248,";
const s = {
  page: { maxWidth: "1080px", margin: "0 auto", padding: "36px 24px 80px" },

  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "14px" },
  eyebrow: { color: "#818cf8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px" },
  pageTitle: { color: "var(--text)", fontSize: "30px", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 4px" },
  pageSub: { color: "var(--muted)", fontSize: "14px", margin: 0 },
  toast: { display: "flex", alignItems: "center", gap: "8px", background: `${A}0.1)`, border: `1px solid ${A}0.25)`, color: "#818cf8", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", fontWeight: 600, animation: "slideDown 0.3s ease" },

  outerGrid: { display: "grid", gridTemplateColumns: "270px 1fr", gap: "16px" },
  card: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "22px", display: "flex", flexDirection: "column", gap: "10px" },
  cardEyebrow: { color: "var(--muted)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 },
  cardEmpty: { color: "var(--muted)", fontSize: "13px", margin: 0, fontStyle: "italic" },
  divider: { height: "1px", background: "var(--border)", margin: "4px 0" },
  countPill: { padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700 },

  // Identity
  avatarWrap: { display: "flex", justifyContent: "center" },
  avatarRing: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#818cf8,#6366f1)", padding: "3px" },
  avatar: { width: "100%", height: "100%", borderRadius: "50%", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 900, color: "#818cf8" },
  profileName: { color: "var(--text)", fontSize: "17px", fontWeight: 800, textAlign: "center", margin: 0 },
  rollNo: { color: "#818cf8", fontSize: "11px", fontWeight: 700, textAlign: "center", margin: 0, letterSpacing: "0.06em" },
  profileDept: { color: "var(--muted)", fontSize: "12px", textAlign: "center", margin: 0 },
  profileYear: { color: "#818cf8", fontSize: "12px", fontWeight: 600, textAlign: "center", margin: 0 },
  profileDetail: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--muted)", fontSize: "12px" },
  infoPill: { padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" },
  resumeLink: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#818cf8", fontWeight: 600, fontSize: "13px", textDecoration: "none" },
  resumeMissing: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--muted)", fontSize: "13px" },
  verifiedBadge: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#34d399", fontSize: "12px", fontWeight: 600 },
  lockTag: { fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" },

  // CGPA
  cgpaRow: { display: "flex", alignItems: "baseline", gap: "6px" },
  cgpaBig: { fontSize: "38px", fontWeight: 900, lineHeight: 1 },
  cgpaOf: { color: "var(--muted)", fontSize: "13px" },
  track: { height: "5px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" },
  bar: { height: "100%", borderRadius: "999px", background: "linear-gradient(90deg,#FF3366,#818cf8)", transition: "width 1s ease" },
  acGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginTop: "4px" },
  acCell: { background: "var(--bg)", borderRadius: "9px", padding: "9px", textAlign: "center" },
  acVal: { display: "block", fontSize: "14px", fontWeight: 700, color: "var(--text)" },
  acLbl: { display: "block", fontSize: "10px", color: "var(--muted)", marginTop: "2px" },

  // Skills
  skillsWrap: { display: "flex", flexWrap: "wrap", gap: "6px" },
  skillTag: { padding: "4px 11px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, background: `${A}0.1)`, border: `1px solid ${A}0.25)`, color: "#818cf8" },

  // Item cards (projects / internships)
  itemCard: { background: "var(--bg)", borderRadius: "12px", padding: "13px 16px", borderLeft: "3px solid", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "7px" },
  itemIconBox: { width: 28, height: 28, borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemTitle: { fontSize: "13px", fontWeight: 700, lineHeight: 1.4, whiteSpace: "normal", wordBreak: "break-word" },
  itemDesc: { fontSize: "12px", color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.7 },
  expandBtn: { background: "none", border: "none", color: "#818cf8", fontSize: "11px", fontWeight: 600, cursor: "pointer", padding: "4px 0 0", textDecoration: "none", letterSpacing: "0.03em" },

  // Achievements
  achBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", background: `${A}0.08)`, border: `1px solid ${A}0.2)`, color: "var(--text)", fontSize: "12px", fontWeight: 500 },

  // Edit mode
  editCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", overflow: "hidden" },
  editHeader: { display: "flex", alignItems: "center", gap: "14px", padding: "22px 28px", borderBottom: "1px solid var(--border)", background: `${A}0.03)` },
  editIconBox: { width: 42, height: 42, borderRadius: "11px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  editTitle: { color: "var(--text)", fontSize: "17px", fontWeight: 800, margin: 0 },
  editSub: { color: "var(--muted)", fontSize: "13px", margin: 0 },
  editFooter: { display: "flex", gap: "10px", padding: "18px 28px", borderTop: "1px solid var(--border)" },

  lockedBanner: { display: "flex", alignItems: "center", gap: "8px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399", borderRadius: "10px", padding: "9px 13px", fontSize: "13px", marginBottom: "14px" },

  field: { marginBottom: "12px" },
  fieldLabel: { display: "block", color: "var(--muted)", fontSize: "11px", fontWeight: 700, marginBottom: "6px", letterSpacing: "0.06em", textTransform: "uppercase" },
  lockBadge: { fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "4px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", marginLeft: "6px" },
  lockedInput: { padding: "10px 13px", background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "10px", color: "var(--muted)", fontSize: "14px" },
  fieldInput: { width: "100%", padding: "10px 13px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text)", fontSize: "14px", boxSizing: "border-box", marginBottom: 0, outline: "none", fontFamily: "inherit" },
  fieldSelect: { width: "100%", padding: "10px 13px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text)", fontSize: "14px", boxSizing: "border-box", marginBottom: 0, outline: "none", cursor: "pointer" },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px" },
  formGrid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "11px" },

  parsePreview: { marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" },
  parseSuccess: { display: "flex", alignItems: "center", gap: "8px", background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", fontWeight: 500, color: "#34d399", flexWrap: "wrap" },
  previewSection: { display: "flex", flexDirection: "column", gap: "8px" },
  previewLabel: { color: "var(--muted)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 },
  errBox: { display: "flex", alignItems: "center", gap: "8px", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#f87171" },

  btnPrimary: { width: "auto", padding: "10px 20px", background: "#818cf8", color: "#000", border: "none", borderRadius: "11px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },
  btnOutline: { width: "auto", padding: "10px 18px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "11px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },

  // Tab switcher
  tabBar: { display: "flex", gap: "6px", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "0" },
  tabBtn: { padding: "10px 20px", background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "var(--muted)", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "-1px" },
  tabBtnActive: { color: "#818cf8", borderBottomColor: "#818cf8" },
  tabCount: { marginLeft: "7px", background: "rgba(129,140,248,0.15)", color: "#818cf8", borderRadius: "99px", fontSize: "11px", fontWeight: 700, padding: "1px 7px" },

  // My Applications list
  emptyApps: { textAlign: "center", padding: "80px 0", color: "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", fontSize: "14px" },
  inlineLink: { background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer", fontSize: "inherit", padding: 0 },
  appRow: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" },
  appLeft: { display: "flex", gap: "14px", alignItems: "center" },
  appIconBox: { width: 42, height: 42, borderRadius: "12px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  appJobTitle: { color: "var(--text)", fontSize: "15px", fontWeight: 700, margin: "0 0 3px" },
  appCompany: { color: "var(--muted)", fontSize: "13px", margin: "0 0 3px" },
  appDate: { color: "var(--muted)", fontSize: "12px", margin: 0 },
  appExtLink: { display: "flex", alignItems: "center", gap: "5px", color: "#818cf8", fontWeight: 600, fontSize: "13px", textDecoration: "none", padding: "6px 12px", border: "1px solid rgba(129,140,248,0.3)", borderRadius: "8px", background: "rgba(129,140,248,0.06)" },
  appStatus: { padding: "5px 13px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, border: "1px solid" },

  // ResumeSection text renderer
  sectionContainer: { display: "flex", flexDirection: "column", gap: "10px" },
  itemHeader: { display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" },
  sectionTitle: { fontSize: "14px", fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "0.01em" },
  bulletRow: { display: "flex", gap: "8px", alignItems: "flex-start", paddingLeft: "22px" },
  bulletDot: { color: "#818cf8", fontWeight: 700, flexShrink: 0, lineHeight: "1.65", fontSize: "13px" },
  bulletText: { fontSize: "13px", color: "var(--muted)", lineHeight: "1.65", flex: 1 },

  // Change Password
  btnPw: { width: "auto", padding: "10px 18px", background: "transparent", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.35)", borderRadius: "11px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },
  defaultPwBanner: { display: "flex", alignItems: "center", gap: "12px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "14px", padding: "13px 18px", marginBottom: "20px", fontSize: "14px", color: "#f59e0b", flexWrap: "wrap" },
  bannerBtn: { marginLeft: "auto", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" },
  pwModal: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", width: "100%", maxWidth: "440px", animation: "slideDown 0.2s ease" },
  pwModalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 24px", borderBottom: "1px solid var(--border)" },
  pwClose: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", padding: "4px" },
  pwInputWrap: { position: "relative", display: "flex", alignItems: "center" },
  eyeBtn: { position: "absolute", right: "12px", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", padding: 0 },
  pwErr: { background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", borderRadius: "10px", padding: "10px 14px", fontSize: "13px" },
  pwOk: { background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", fontWeight: 600 },
};

