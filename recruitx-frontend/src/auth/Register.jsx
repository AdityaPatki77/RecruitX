import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  IconBriefcase, IconUsers, IconBuilding,
  IconMail, IconEye, IconEyeOff, IconArrowRight, IconCheckCircle,
  IconShield, IconTarget, IconZap, IconRocket, IconBarChart,
} from "../components/Icons";

const ROLES = [
  { key: "student", label: "Student", Icon: IconBriefcase, desc: "Find jobs & track applications" },
  { key: "placement", label: "Placement Officer", Icon: IconUsers, desc: "Manage campus placement drives" },
  { key: "company", label: "Company", Icon: IconBuilding, desc: "Post jobs & discover talent" },
];

const PERKS = [
  { Icon: IconRocket, text: "Get started in under 2 minutes" },
  { Icon: IconTarget, text: "AI matches you to perfect roles" },
  { Icon: IconShield, text: "Your data is always secure" },
  { Icon: IconBarChart, text: "Real-time placement analytics" },
];

export default function Register() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    if (!email || !password) return setError("Please fill in all fields.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true); setError("");
    try {
      await api.post("/auth/register", { email, password, role });
      navigate("/login");
    } catch { setError("Registration failed. This email may already be in use."); }
    finally { setLoading(false); }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["transparent", "#ef4444", "#FF3366", "#FFAC41"];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

  return (
    <div style={s.page}>
      {/* LEFT PANEL */}
      <div style={s.left}>
        <div style={s.leftGlow} />
        <div style={s.leftInner}>
          <div style={s.logo} onClick={() => navigate("/")}>
            <div style={s.logoBox}>R</div>
            <span style={s.logoName}>RecruitX</span>
          </div>
          <h2 style={s.leftHeading}>Create your future,<br />starting today.</h2>
          <p style={s.leftSub}>Join thousands of students placed in top companies through intelligent, data-driven recruitment.</p>
          <div style={s.perkList}>
            {PERKS.map(({ Icon, text }) => (
              <div key={text} style={s.perkRow}>
                <div style={s.perkIcon}><Icon size={16} color="#FFAC41" /></div>
                <span style={s.perkText}>{text}</span>
              </div>
            ))}
          </div>
          <div style={s.statsRow}>
            {[["10K+", "Placed"], ["500+", "Companies"], ["95%", "Rate"]].map(([v, l]) => (
              <div key={l} style={s.statBox}>
                <span style={s.statVal}>{v}</span>
                <span style={s.statLbl}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Create account</h2>
          <p style={s.cardSub}>Free forever. No credit card required.</p>

          <p style={s.label}>I am joining as…</p>
          <div style={s.roleGrid}>
            {ROLES.map(({ key, label, Icon, desc }) => (
              <button key={key} onClick={() => setRole(key)}
                style={{ ...s.roleBtn, ...(role === key ? s.roleBtnActive : {}) }}>
                <div style={{ ...s.roleIconBox, ...(role === key ? s.roleIconBoxActive : {}) }}>
                  <Icon size={18} color={role === key ? "#FFAC41" : "var(--muted)"} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <span style={{ ...s.roleName, color: role === key ? "var(--text)" : "var(--muted)" }}>{label}</span>
                  <span style={s.roleDesc}>{desc}</span>
                </div>
                {role === key && (
                  <div style={s.roleCheck}><IconCheckCircle size={14} color="#000" /></div>
                )}
              </button>
            ))}
          </div>

          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <div style={s.inputWrap}>
              <IconMail size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
              <input style={s.input} placeholder="you@university.edu" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && register()} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrap}>
              <IconShield size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
              <input style={s.input} type={showPw ? "text" : "password"} placeholder="Min. 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && register()} />
              <button onClick={() => setShowPw(p => !p)} style={s.eyeBtn}>
                {showPw ? <IconEyeOff size={16} color="var(--muted)" /> : <IconEye size={16} color="var(--muted)" />}
              </button>
            </div>
            {password.length > 0 && (
              <div style={s.strengthRow}>
                <div style={s.strengthBar}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ ...s.seg, background: i <= strength ? strengthColors[strength] : "var(--border)" }} />
                  ))}
                </div>
                <span style={{ ...s.strengthLbl, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <button onClick={register} disabled={loading}
            style={{ ...s.submit, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating account…" : <>Create Account <IconArrowRight size={16} /></>}
          </button>

          <p style={s.terms}>By signing up you agree to our Terms of Service and Privacy Policy.</p>

          <p style={s.switchText}>
            Already have an account?{" "}
            <span style={s.switchLink} onClick={() => navigate("/login")}>Sign in instead</span>
          </p>
        </div>
      </div>

      <style>{`@keyframes leftGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.8;transform:scale(1.1)}}`}</style>
    </div>
  );
}

const A = "rgba(255,172,65,";

const s = {
  page: { display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", fontFamily: "'Inter',sans-serif" },
  left: { position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#0d1a0d 0%,#0c0c0c 60%,#0a0a0a 100%)", display: "flex", alignItems: "center", padding: "60px" },
  leftGlow: { position: "absolute", width: 500, height: 500, top: -100, left: -100, borderRadius: "50%", background: `radial-gradient(circle,${A}0.12),transparent 65%)`, animation: "leftGlow 9s ease-in-out infinite", pointerEvents: "none" },
  leftInner: { position: "relative", zIndex: 1, width: "100%" },
  logo: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "48px" },
  logoBox: { width: 40, height: 40, borderRadius: "12px", background: "#FFAC41", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "18px", color: "#000" },
  logoName: { color: "#FFAC41", fontSize: "22px", fontWeight: 800 },
  leftHeading: { color: "#fff", fontSize: "34px", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 14px" },
  leftSub: { color: "#78716c", fontSize: "14px", lineHeight: 1.7, margin: "0 0 36px", maxWidth: "300px" },
  perkList: { display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" },
  perkRow: { display: "flex", alignItems: "center", gap: "12px" },
  perkIcon: { width: 32, height: 32, borderRadius: "8px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  perkText: { color: "#a8a29e", fontSize: "14px" },
  statsRow: { display: "flex", gap: "20px" },
  statBox: { display: "flex", flexDirection: "column" },
  statVal: { color: "#FFAC41", fontWeight: 900, fontSize: "22px", lineHeight: 1 },
  statLbl: { color: "#57534e", fontSize: "12px", marginTop: "2px" },

  right: { background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" },
  card: { width: "100%", maxWidth: "420px" },
  cardTitle: { color: "var(--text)", fontSize: "28px", fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.02em" },
  cardSub: { color: "var(--muted)", fontSize: "14px", margin: "0 0 24px" },

  roleGrid: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "22px" },
  roleBtn: { position: "relative", width: "100%", padding: "12px 14px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "border-color 0.2s" },
  roleBtnActive: { borderColor: "#FFAC41", background: `${A}0.06)` },
  roleIconBox: { width: 36, height: 36, borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" },
  roleIconBoxActive: { background: `${A}0.1)`, border: `1px solid ${A}0.3)` },
  roleName: { display: "block", fontWeight: 700, fontSize: "13px" },
  roleDesc: { display: "block", color: "var(--muted)", fontSize: "12px", marginTop: "1px" },
  roleCheck: { width: 24, height: 24, borderRadius: "50%", background: "#FFAC41", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  field: { marginBottom: "16px" },
  label: { display: "block", color: "var(--muted)", fontSize: "11px", fontWeight: 700, marginBottom: "7px", letterSpacing: "0.06em", textTransform: "uppercase" },
  inputWrap: { display: "flex", alignItems: "center", gap: "10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "11px", padding: "0 14px" },
  input: { flex: 1, padding: "13px 0", background: "transparent", border: "none", color: "var(--text)", fontSize: "14px", outline: "none", marginBottom: 0, width: "100%" },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px", width: "auto", display: "flex", alignItems: "center", justifyContent: "center" },
  strengthRow: { display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" },
  strengthBar: { display: "flex", gap: "5px", flex: 1 },
  seg: { height: "3px", flex: 1, borderRadius: "2px", transition: "background 0.3s" },
  strengthLbl: { fontSize: "11px", fontWeight: 700, minWidth: "40px" },
  errorBox: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", marginBottom: "14px" },
  submit: { width: "100%", padding: "13px", background: "linear-gradient(135deg,#FFAC41,#FF3366)", color: "#000", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: "pointer", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  terms: { textAlign: "center", color: "var(--muted)", fontSize: "12px", margin: "0 0 14px", lineHeight: 1.5 },
  switchText: { textAlign: "center", color: "var(--muted)", fontSize: "14px", margin: 0 },
  switchLink: { color: "#FFAC41", fontWeight: 600, cursor: "pointer" },
};
