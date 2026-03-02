import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useRef } from "react";
import {
  IconTarget, IconZap, IconBarChart, IconBell,
  IconBuilding, IconBriefcase, IconUsers, IconClipboard,
  IconArrowRight, IconShield, IconCheckCircle,
} from "../components/Icons";

function useCountUp(target, duration = 1800) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * numeric) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) requestAnimationFrame(step); }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return ref;
}

function Stat({ value, label }) {
  const ref = useCountUp(value);
  return (
    <div style={s.statCard}>
      <h2 ref={ref} style={s.statVal}>{value}</h2>
      <p style={s.statLbl}>{label}</p>
    </div>
  );
}

const FEATURES = [
  { icon: IconTarget, title: "AI-Powered Matching", desc: "Scores candidates against job requirements and surfaces best-fit matches in real time." },
  { icon: IconZap, title: "Smart Resume Parsing", desc: "Upload once — skills, education, and experience are extracted automatically." },
  { icon: IconBarChart, title: "Real-time Analytics", desc: "Live dashboards on applications, interviews, and offer rates for placement officers." },
  { icon: IconBell, title: "Instant Notifications", desc: "Students are notified the moment a company shortlists them or a matching job is posted." },
  { icon: IconBuilding, title: "Company Portal", desc: "Companies post jobs, set eligibility criteria, and track applicants through a dedicated view." },
  { icon: IconClipboard, title: "Interview Scheduling", desc: "Coordinate drive dates, slots, and results without a single email chain." },
];

const ROLES = [
  { icon: IconBriefcase, role: "Students", perks: ["Browse curated job listings", "AI-matched to roles", "Track all applications", "Resume builder"] },
  { icon: IconUsers, role: "Placement Officers", perks: ["Manage placement drives", "Post & manage listings", "View analytics & reports", "Shortlist candidates"] },
  { icon: IconBuilding, role: "Companies", perks: ["Post jobs with criteria", "Auto-filtered applicants", "Download candidate profiles", "Schedule interviews"] },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* orbs */}
        <div style={{ ...orb, width: 600, height: 600, top: -180, left: -150, animationDuration: "18s" }} />
        <div style={{ ...orb, width: 450, height: 450, top: 200, right: -120, animationDelay: "-8s", animationDuration: "24s", opacity: 0.5 }} />

        {/* HERO */}
        <section style={s.hero}>
          <div style={s.heroBadge}>Smart Campus Placement Platform</div>
          <h1 style={s.heroTitle}>
            Land Your <span style={s.heroGold}>Dream Career</span><br />with Intelligence
          </h1>
          <p style={s.heroSub}>
            Connecting students with top companies through AI-powered matching,
            automated shortlisting, and seamless application tracking — all in one place.
          </p>
          <div style={s.ctaRow}>
            <button onClick={() => navigate("/register")} style={s.btnPrimary}>
              Get Started Free <IconArrowRight size={16} />
            </button>
            <button onClick={() => navigate("/login")} style={s.btnOutline}>
              Sign In to Dashboard
            </button>
          </div>
          <div style={s.statsGrid}>
            <Stat value="500+" label="Partner Companies" />
            <Stat value="10000+" label="Students Placed" />
            <Stat value="95%" label="Placement Rate" />
            <Stat value="12+" label="Avg Package (LPA)" />
          </div>
        </section>

        {/* FEATURES */}
        <section style={s.section}>
          <p style={s.sectionEye}>PLATFORM FEATURES</p>
          <h2 style={s.sectionTitle}>Everything in one platform</h2>
          <div style={s.featGrid}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} style={{ ...s.featCard, animationDelay: `${i * 0.08}s` }}>
                <div style={s.featIconBox}><Icon size={20} color="#fbbf24" /></div>
                <h3 style={s.featTitle}>{title}</h3>
                <p style={s.featDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ROLES */}
        <section style={s.section}>
          <p style={s.sectionEye}>WHO IS IT FOR</p>
          <h2 style={s.sectionTitle}>Built for every stakeholder</h2>
          <div style={s.rolesGrid}>
            {ROLES.map(({ icon: Icon, role, perks }) => (
              <div key={role} style={s.roleCard}>
                <div style={s.roleIconBox}><Icon size={22} color="#fbbf24" /></div>
                <h3 style={s.roleTitle}>{role}</h3>
                <ul style={s.roleList}>
                  {perks.map(p => (
                    <li key={p} style={s.rolePerk}>
                      <IconCheckCircle size={13} color="#fbbf24" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA STRIP */}
        <section style={s.ctaStrip}>
          <div style={s.ctaStripGlow} />
          <h2 style={s.ctaTitle}>Ready to accelerate placements?</h2>
          <p style={s.ctaSub}>Join thousands of students and companies already using RecruitX.</p>
          <button onClick={() => navigate("/register")} style={{ ...s.btnPrimary, fontSize: "16px", padding: "14px 32px" }}>
            Create Free Account <IconArrowRight size={16} />
          </button>
        </section>

        <footer style={s.footer}>
          <span style={{ color: "var(--muted)", fontSize: "13px" }}>© 2025 RecruitX · Smart Campus Placement</span>
        </footer>
      </div>

      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-40px) scale(1.04)} 66%{transform:translate(-18px,20px) scale(0.97)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  );
}

const A = "rgba(251,191,36,";

const orb = {
  position: "absolute", borderRadius: "50%", pointerEvents: "none",
  background: `radial-gradient(circle, ${A}0.1), transparent 70%)`,
  animation: "orbFloat linear infinite",
};

const s = {
  hero: { maxWidth: "1200px", margin: "0 auto", padding: "110px 24px 80px", position: "relative" },
  heroBadge: { display: "inline-block", padding: "6px 16px", borderRadius: "999px", border: `1px solid ${A}0.3)`, background: `${A}0.08)`, color: "#fbbf24", fontSize: "13px", fontWeight: 600, marginBottom: "28px" },
  heroTitle: { color: "var(--text)", fontSize: "clamp(44px,6vw,76px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", margin: "0 0 20px" },
  heroGold: { background: "linear-gradient(135deg,#fbbf24 0%,#f59e0b 50%,#d97706 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { color: "var(--muted)", fontSize: "18px", maxWidth: "560px", lineHeight: 1.7, margin: "0 0 40px" },
  ctaRow: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "72px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px" },
  statCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "28px 22px", textAlign: "center" },
  statVal: { color: "#fbbf24", fontSize: "34px", fontWeight: 900, margin: "0 0 6px" },
  statLbl: { color: "var(--muted)", fontSize: "13px", margin: 0 },

  section: { maxWidth: "1200px", margin: "0 auto", padding: "72px 24px" },
  sectionEye: { color: "#fbbf24", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 12px" },
  sectionTitle: { color: "var(--text)", fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 44px" },
  featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px" },
  featCard: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "28px", animation: "fadeUp 0.5s ease both" },
  featIconBox: { width: 44, height: 44, borderRadius: "12px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  featTitle: { color: "var(--text)", fontSize: "16px", fontWeight: 700, margin: "0 0 8px" },
  featDesc: { color: "var(--muted)", fontSize: "13px", lineHeight: 1.7, margin: 0 },

  rolesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "16px" },
  roleCard: { background: "var(--card)", border: `1px solid ${A}0.15)`, borderRadius: "22px", padding: "32px 26px" },
  roleIconBox: { width: 52, height: 52, borderRadius: "14px", background: `${A}0.1)`, border: `1px solid ${A}0.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" },
  roleTitle: { color: "var(--text)", fontSize: "20px", fontWeight: 800, margin: "0 0 16px" },
  roleList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" },
  rolePerk: { display: "flex", alignItems: "center", gap: "8px", color: "var(--muted)", fontSize: "14px" },

  ctaStrip: { position: "relative", margin: "40px 24px 52px", borderRadius: "24px", background: `${A}0.07)`, border: `1px solid ${A}0.2)`, textAlign: "center", padding: "64px 24px", overflow: "hidden" },
  ctaStripGlow: { position: "absolute", width: 400, height: 300, top: -100, left: "50%", transform: "translateX(-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${A}0.12), transparent 65%)`, pointerEvents: "none" },
  ctaTitle: { color: "var(--text)", fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 12px", position: "relative" },
  ctaSub: { color: "var(--muted)", fontSize: "16px", margin: "0 0 28px", position: "relative" },

  footer: { textAlign: "center", padding: "22px", borderTop: "1px solid var(--border)" },

  btnPrimary: { width: "auto", padding: "13px 26px", background: "linear-gradient(135deg,#fbbf24,#f59e0b)", color: "#000", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  btnOutline: { width: "auto", padding: "13px 26px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "12px", fontWeight: 600, fontSize: "15px", cursor: "pointer" },
};
