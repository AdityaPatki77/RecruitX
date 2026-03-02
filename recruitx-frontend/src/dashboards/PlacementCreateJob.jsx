import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  IconBriefcase, IconBarChart, IconLayers, IconZap,
  IconArrowRight, IconArrowLeft, IconCheckCircle, IconPlus,
  IconGlobe, IconTarget, IconShield, IconClipboard, IconRocket,
} from "../components/Icons";

const EMPTY = {
  title: "", company_name: "", min_cgpa: "", min_tenth: "", min_twelfth: "",
  max_backlogs: "", department: "", required_skill: "", year_required: "",
  internship_required: false, external_link: "",
};

const STEPS = [
  { label: "Basics", icon: IconBriefcase },
  { label: "Eligibility", icon: IconBarChart },
  { label: "Details", icon: IconLayers },
  { label: "Review", icon: IconRocket },
];

function Field({ label, hint, ...props }) {
  return (
    <div style={s.field}>
      <label style={s.fieldLabel}>{label}</label>
      {hint && <p style={s.fieldHint}>{hint}</p>}
      <input style={s.fieldInput} {...props} />
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div style={s.toggleRow}>
      <div>
        <p style={{ ...s.fieldLabel, marginBottom: 2 }}>{label}</p>
        {hint && <p style={s.fieldHint}>{hint}</p>}
      </div>
      <div onClick={onChange}
        style={{ ...s.toggleTrack, background: checked ? "#FFAC41" : "var(--border)", cursor: "pointer" }}>
        <div style={{ ...s.toggleThumb, transform: checked ? "translateX(22px)" : "translateX(2px)" }} />
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div style={s.reviewRow}>
      <span style={s.reviewLabel}>{label}</span>
      <span style={s.reviewValue}>{String(value)}</span>
    </div>
  );
}

export default function PlacementCreateJob() {
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const setEv = (k) => (e) => set(k)(e.target.value);

  const createJob = async () => {
    setLoading(true);
    try {
      await api.post("/placement/create-job", {
        title: form.title, company_name: form.company_name,
        min_cgpa: Number(form.min_cgpa), min_tenth: Number(form.min_tenth),
        min_twelfth: Number(form.min_twelfth), max_backlogs: Number(form.max_backlogs),
        department: form.department || null, required_skill: form.required_skill || null,
        year_required: form.year_required ? Number(form.year_required) : null,
        internship_required: form.internship_required,
        external_link: form.external_link || null,
      });
      setDone(true);
    } catch { alert("Error creating job"); }
    finally { setLoading(false); }
  };

  const step0Valid = form.title && form.company_name;

  /* ── SUCCESS STATE ── */
  if (done) return (
    <>
      <Navbar />
      <div style={s.page}>
        <div style={s.successCard}>
          <div style={s.successIconCircle}><IconCheckCircle size={44} color="#FFAC41" /></div>
          <h2 style={s.successTitle}>Job Posted!</h2>
          <p style={s.successSub}>
            <strong style={{ color: "var(--accent)" }}>{form.title}</strong> at {form.company_name} is now
            pending placement officer approval. Eligible students will be matched automatically.
          </p>
          <div style={s.successActions}>
            <button onClick={() => { setForm(EMPTY); setStep(0); setDone(false); }} style={s.btnPrimary}>
              <IconPlus size={15} /> Post Another
            </button>
            <button onClick={() => navigate("/placement")} style={s.btnOutline}>
              <IconArrowLeft size={15} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div style={s.page}>

        {/* ── HEADER ── */}
        <div style={s.pageHeader}>
          <div>
            <p style={s.eyebrow}>JOB CREATION</p>
            <h1 style={s.pageTitle}>Post a New Opportunity</h1>
            <p style={s.pageSub}>Fill the wizard — eligible students are auto-matched on approval.</p>
          </div>
          <button onClick={() => navigate("/placement")} style={s.btnOutline}>
            <IconArrowLeft size={15} /> Dashboard
          </button>
        </div>

        {/* ── STEPPER ── */}
        <div style={s.stepperWrap}>
          {STEPS.map((st, i) => {
            const Icon = st.icon;
            const active = step === i;
            const done = step > i;
            return (
              <div key={i} style={s.stepItem}>
                <div style={{ ...s.stepCircle, ...(active ? s.stepCircleActive : done ? s.stepCircleDone : {}) }}>
                  {done ? <IconCheckCircle size={16} color="#000" /> : <Icon size={16} color={active ? "#000" : "var(--muted)"} />}
                </div>
                <div style={{ ...s.stepLabel, color: step >= i ? "var(--text)" : "var(--muted)" }}>{st.label}</div>
                {i < STEPS.length - 1 && (
                  <div style={{ ...s.stepConnector, background: step > i ? "#FFAC41" : "var(--border)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── FORM CARD ── */}
        <div style={s.formCard}>
          <div style={s.formBody}>

            {/* STEP 0 */}
            {step === 0 && (
              <>
                <SectionHead icon={<IconBriefcase size={20} color="#FFAC41" />} title="Basic Information" sub="Job title and company name are required." />
                <div style={s.grid2}>
                  <Field label="Job Title" placeholder="e.g. Software Engineer" value={form.title} onChange={setEv("title")} />
                  <Field label="Company Name" placeholder="e.g. Google" value={form.company_name} onChange={setEv("company_name")} />
                </div>
                <Field label="External Application Link" hint="Optional — students are redirected here to complete their application"
                  placeholder="https://careers.company.com/apply" value={form.external_link} onChange={setEv("external_link")} />
              </>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <SectionHead icon={<IconBarChart size={20} color="#FFAC41" />} title="Eligibility Criteria" sub="Students below these thresholds won't see this listing." />
                <div style={s.grid4}>
                  <Field label="Min CGPA" type="number" step="0.1" placeholder="7.5" value={form.min_cgpa} onChange={setEv("min_cgpa")} />
                  <Field label="Min 10th %" type="number" step="0.1" placeholder="60" value={form.min_tenth} onChange={setEv("min_tenth")} />
                  <Field label="Min 12th %" type="number" step="0.1" placeholder="60" value={form.min_twelfth} onChange={setEv("min_twelfth")} />
                  <Field label="Max Backlogs" type="number" placeholder="0" value={form.max_backlogs} onChange={setEv("max_backlogs")} />
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <SectionHead icon={<IconLayers size={20} color="#FFAC41" />} title="Additional Filters" sub="All optional — used for sharper candidate matching." />
                <div style={s.grid2}>
                  <Field label="Department" hint="Leave blank for all departments" placeholder="e.g. Computer Science" value={form.department} onChange={setEv("department")} />
                  <Field label="Required Skill" hint="Boosts AI match score for students with this skill" placeholder="e.g. Python" value={form.required_skill} onChange={setEv("required_skill")} />
                </div>
                <Field label="Graduating Year" hint="Leave blank to allow all batches" type="number" placeholder="e.g. 2025" value={form.year_required} onChange={setEv("year_required")} />
                <Toggle
                  label="Internship Experience Required"
                  hint="Only students with prior internship experience will be eligible"
                  checked={form.internship_required}
                  onChange={() => set("internship_required")(!form.internship_required)}
                />
              </>
            )}

            {/* STEP 3 — REVIEW */}
            {step === 3 && (
              <>
                <SectionHead icon={<IconRocket size={20} color="#FFAC41" />} title="Review & Publish" sub="Confirm everything looks right before posting." />
                <div style={s.reviewGrid}>
                  <ReviewSection title="Basic Info" icon={<IconBriefcase size={14} color="#FFAC41" />}>
                    <ReviewRow label="Job Title" value={form.title} />
                    <ReviewRow label="Company" value={form.company_name} />
                    <ReviewRow label="External Link" value={form.external_link || "Internal only"} />
                  </ReviewSection>
                  <ReviewSection title="Eligibility" icon={<IconBarChart size={14} color="#FFAC41" />}>
                    <ReviewRow label="Min CGPA" value={form.min_cgpa} />
                    <ReviewRow label="Min 10th %" value={form.min_tenth} />
                    <ReviewRow label="Min 12th %" value={form.min_twelfth} />
                    <ReviewRow label="Max Backlogs" value={form.max_backlogs} />
                  </ReviewSection>
                  <ReviewSection title="Filters" icon={<IconLayers size={14} color="#FFAC41" />}>
                    <ReviewRow label="Department" value={form.department || "All"} />
                    <ReviewRow label="Skill" value={form.required_skill || "Any"} />
                    <ReviewRow label="Year" value={form.year_required || "Any"} />
                    <ReviewRow label="Internship" value={form.internship_required ? "Required" : "Not required"} />
                  </ReviewSection>
                </div>
              </>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div style={s.formFooter}>
            {step > 0 && (
              <button onClick={() => setStep(p => p - 1)} style={s.btnOutline}>
                <IconArrowLeft size={15} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button
                onClick={() => setStep(p => p + 1)}
                disabled={step === 0 && !step0Valid}
                style={{ ...s.btnPrimary, opacity: step === 0 && !step0Valid ? 0.45 : 1 }}>
                Continue <IconArrowRight size={15} />
              </button>
            ) : (
              <button onClick={createJob} disabled={loading}
                style={{ ...s.btnPrimary, opacity: loading ? 0.65 : 1 }}>
                <IconRocket size={15} /> {loading ? "Publishing…" : "Publish Job"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}

function SectionHead({ icon, title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
      <div style={{ width: 40, height: 40, borderRadius: "12px", background: "rgba(255,172,65,0.1)", border: "1px solid rgba(255,172,65,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div>
        <h2 style={{ color: "var(--text)", fontSize: "18px", fontWeight: 800, margin: 0 }}>{title}</h2>
        <p style={{ color: "var(--muted)", fontSize: "13px", margin: 0 }}>{sub}</p>
      </div>
    </div>
  );
}

function ReviewSection({ title, icon, children }) {
  return (
    <div style={{ background: "var(--bg)", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 18px", borderBottom: "1px solid var(--border)", background: "rgba(255,172,65,0.04)" }}>
        {icon}
        <span style={{ color: "var(--text)", fontSize: "13px", fontWeight: 700 }}>{title}</span>
      </div>
      <div style={{ padding: "4px 0" }}>{children}</div>
    </div>
  );
}

const A = "rgba(255,172,65,";

const s = {
  page: { maxWidth: "820px", margin: "0 auto", padding: "36px 24px 80px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" },
  eyebrow: { color: "#FFAC41", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px" },
  pageTitle: { color: "var(--text)", fontSize: "30px", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 6px" },
  pageSub: { color: "var(--muted)", fontSize: "14px", margin: 0 },

  stepperWrap: { display: "flex", alignItems: "flex-start", gap: "0", marginBottom: "28px", padding: "20px 24px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px" },
  stepItem: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" },
  stepCircle: { width: 38, height: 38, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 },
  stepCircleActive: { background: "#FFAC41", border: "2px solid #FFAC41" },
  stepCircleDone: { background: "#FFAC41", border: "2px solid #FFAC41" },
  stepLabel: { fontSize: "11px", fontWeight: 600, marginTop: "6px", letterSpacing: "0.04em" },
  stepConnector: { position: "absolute", top: "19px", left: "calc(50% + 22px)", right: "calc(-50% + 22px)", height: "2px", zIndex: 0 },

  formCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", overflow: "hidden" },
  formBody: { padding: "32px 32px 24px", animation: "fadeUp 0.25s ease" },
  formFooter: { display: "flex", align: "center", gap: "12px", padding: "18px 32px", borderTop: "1px solid var(--border)" },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  grid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" },
  reviewGrid: { display: "flex", flexDirection: "column", gap: "12px" },

  field: { marginBottom: "16px" },
  fieldLabel: { display: "block", color: "var(--muted)", fontSize: "11px", fontWeight: 700, marginBottom: "6px", letterSpacing: "0.06em", textTransform: "uppercase" },
  fieldHint: { color: "var(--muted)", fontSize: "12px", margin: "-2px 0 6px", opacity: 0.7 },
  fieldInput: { width: "100%", padding: "11px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text)", fontSize: "14px", boxSizing: "border-box", marginBottom: 0, outline: "none" },

  toggleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" },
  toggleTrack: { width: 46, height: 24, borderRadius: "999px", position: "relative", transition: "background 0.2s", flexShrink: 0 },
  toggleThumb: { position: "absolute", top: "2px", width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" },

  reviewRow: { display: "flex", justifyContent: "space-between", padding: "8px 18px" },
  reviewLabel: { color: "var(--muted)", fontSize: "13px" },
  reviewValue: { color: "var(--text)", fontSize: "13px", fontWeight: 600, maxWidth: "55%", textAlign: "right", wordBreak: "break-all" },

  btnPrimary: { width: "auto", padding: "11px 22px", background: "#FFAC41", color: "#000", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },
  btnOutline: { width: "auto", padding: "11px 18px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" },

  successCard: { maxWidth: "480px", margin: "80px auto", background: "var(--card)", border: `1px solid ${A}0.25)`, borderRadius: "28px", padding: "52px 40px", textAlign: "center" },
  successIconCircle: { width: 72, height: 72, borderRadius: "50%", background: `${A}0.1)`, border: `1px solid ${A}0.25)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
  successTitle: { color: "var(--text)", fontSize: "26px", fontWeight: 900, margin: "0 0 10px" },
  successSub: { color: "var(--muted)", fontSize: "15px", lineHeight: 1.65, margin: "0 0 32px" },
  successActions: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
};