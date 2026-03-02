import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  IconBriefcase, IconUsers, IconBuilding,
  IconMail, IconEye, IconEyeOff, IconArrowRight,
  IconShield, IconTarget, IconBell, IconZap, IconCheckCircle,
} from "../components/Icons";

const ROLES = [
  { key: "student", label: "Student", Icon: IconBriefcase, desc: "Browse jobs & track applications" },
  { key: "placement", label: "Placement Officer", Icon: IconUsers, desc: "Manage campus placement drives" },
  { key: "company", label: "Company", Icon: IconBuilding, desc: "Post jobs & discover talent" },
];

const FEATURES = [
  { Icon: IconTarget, text: "AI-powered job matching" },
  { Icon: IconBarChart, text: "Real-time application tracking" },
  { Icon: IconBell, text: "Instant placement notifications" },
  { Icon: IconShield, text: "Secure & private by design" },
];

import { IconBarChart } from "../components/Icons";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) return setError("Please fill in all fields.");
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", null, { params: { email, password } });
      localStorage.setItem("token", res.data.access_token);
      window.location.href = `/${role}`;
    } catch { setError("Invalid credentials. Please try again."); }
    finally { setLoading(false); }
  };

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
          <h2 style={s.leftHeading}>Your career<br />journey starts here.</h2>
          <p style={s.leftSub}>The smartest campus placement platform — built for students, officers, and companies.</p>
          <div style={s.featureList}>
            {FEATURES.map(({ Icon, text }) => (
              <div key={text} style={s.featureRow}>
                <div style={s.featureIcon}><Icon size={16} color="#FFAC41" /></div>
                <span style={s.featureText}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Welcome back</h2>
          <p style={s.cardSub}>Sign in to continue</p>

          <p style={s.label}>I am a…</p>
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
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrap}>
              <IconShield size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
              <input style={s.input} type={showPw ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
              <button onClick={() => setShowPw(p => !p)} style={s.eyeBtn}>
                {showPw ? <IconEyeOff size={16} color="var(--muted)" /> : <IconEye size={16} color="var(--muted)" />}
              </button>
            </div>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <button onClick={login} disabled={loading} style={{ ...s.submit, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in…" : <>Sign In <IconArrowRight size={16} /></>}
          </button>

          {role === "student" ? (
            <p style={s.switchText}>
              Students are auto-registered via the official spreadsheet.{" "}
              Sign in with your <strong style={{ color: "var(--text)" }}>college email</strong> and default password <strong style={{ color: "var(--text)" }}>1234</strong>.
            </p>
          ) : (
            <p style={s.switchText}>
              New to RecruitX?{" "}
              <span style={s.switchLink} onClick={() => navigate("/register")}>Create an account</span>
            </p>
          )}
        </div>
      </div>

      <style>{anim}</style>
    </div>
  );
}

const anim = `@keyframes leftGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.8;transform:scale(1.1)}}`;
const A = "rgba(255,172,65,";

const s = {
  page: { display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", fontFamily: "'Inter',sans-serif" },
  left: { position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#1a1200 0%,#0c0c0c 60%,#0a0a0a 100%)", display: "flex", alignItems: "center", padding: "60px" },
  leftGlow: { position: "absolute", width: 500, height: 500, top: -100, left: -100, borderRadius: "50%", background: `radial-gradient(circle,${A}0.15),transparent 65%)`, animation: "leftGlow 8s ease-in-out infinite", pointerEvents: "none" },
  leftInner: { position: "relative", zIndex: 1 },
  logo: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "48px" },
  logoBox: { width: 40, height: 40, borderRadius: "12px", background: "#FFAC41", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "18px", color: "#000" },
  logoName: { color: "#FFAC41", fontSize: "22px", fontWeight: 800 },
  leftHeading: { color: "#fff", fontSize: "36px", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 14px" },
  leftSub: { color: "#78716c", fontSize: "14px", lineHeight: 1.7, margin: "0 0 40px", maxWidth: "300px" },
  featureList: { display: "flex", flexDirection: "column", gap: "14px" },
  featureRow: { display: "flex", alignItems: "center", gap: "12px" },
  featureIcon: { width: 32, height: 32, borderRadius: "8px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  featureText: { color: "#a8a29e", fontSize: "14px" },

  right: { background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" },
  card: { width: "100%", maxWidth: "420px" },
  cardTitle: { color: "var(--text)", fontSize: "28px", fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.02em" },
  cardSub: { color: "var(--muted)", fontSize: "14px", margin: "0 0 28px" },

  roleGrid: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" },
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
  errorBox: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", marginBottom: "14px" },
  submit: { width: "100%", padding: "13px", background: "linear-gradient(135deg,#FFAC41,#FF3366)", color: "#000", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: "pointer", marginBottom: "18px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  switchText: { textAlign: "center", color: "var(--muted)", fontSize: "14px", margin: 0 },
  switchLink: { color: "#FFAC41", fontWeight: 600, cursor: "pointer" },
};
