import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useRef, useState } from "react";
import {
  IconTarget, IconZap, IconBarChart, IconBell,
  IconBuilding, IconBriefcase, IconUsers, IconClipboard,
  IconArrowRight, IconShield, IconCheckCircle,
} from "../components/Icons";

/* ── Typewriter hook ─────────────────────────────────────────── */
function useTypewriter(words, speed = 80, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, charIdx + 1));
        if (charIdx + 1 === word.length) {
          setTimeout(() => setDeleting(true), pause);
        } else setCharIdx(c => c + 1);
      } else {
        setDisplay(word.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setWordIdx(i => (i + 1) % words.length);
          setCharIdx(0);
        } else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return display;
}

/* ── CountUp hook ────────────────────────────────────────────── */
function useCountUp(target, duration = 2000) {
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
      const ease = 1 - Math.pow(1 - progress, 4);
      el.textContent = (Math.round(ease * numeric * 10) / 10) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) requestAnimationFrame(step); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return ref;
}

/* ── Floating Particles ──────────────────────────────────────── */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${p.a})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }
      // draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(251,191,36,${0.07 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 0, opacity: 0.7 }} />;
}

/* ── Tilt card ───────────────────────────────────────────────── */
function TiltCard({ children, style }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`;
  };
  const reset = () => { ref.current.style.transform = "perspective(600px) rotateX(0) rotateY(0) scale(1)"; };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={reset}
      style={{ ...style, transition: "transform 0.15s ease", willChange: "transform" }}>
      {children}
    </div>
  );
}

/* ── Scroll reveal ───────────────────────────────────────────── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

const FEATURES = [
  { icon: IconTarget, title: "AI-Powered Matching", desc: "Scores candidates against job requirements and surfaces best-fit matches in real time.", color: "#f472b6" },
  { icon: IconZap, title: "Smart Resume Parsing", desc: "Upload once — skills, education, and experience extracted automatically.", color: "#fbbf24" },
  { icon: IconBarChart, title: "Real-time Analytics", desc: "Live dashboards on applications, interviews, and offer rates for officers.", color: "#34d399" },
  { icon: IconBell, title: "Instant Notifications", desc: "Students notified the moment a company shortlists them or a job is posted.", color: "#818cf8" },
  { icon: IconBuilding, title: "Company Portal", desc: "Companies post jobs, set eligibility criteria, and track applicants.", color: "#fb923c" },
  { icon: IconClipboard, title: "Interview Scheduling", desc: "Coordinate drive dates, slots, and results without a single email chain.", color: "#2dd4bf" },
];

const ROLES = [
  {
    icon: IconBriefcase, role: "Students", color: "#818cf8",
    perks: ["Browse curated job listings", "AI-matched to roles", "Track all applications", "Resume builder & parser"],
  },
  {
    icon: IconUsers, role: "Placement Officers", color: "#34d399",
    perks: ["Manage placement drives", "Post & approve listings", "View analytics & reports", "Shortlist candidates"],
  },
  {
    icon: IconBuilding, role: "Companies", color: "#fbbf24",
    perks: ["Post jobs with criteria", "Auto-filtered applicants", "Download candidate profiles", "Schedule interviews"],
  },
];

const TYPEWRITER_WORDS = ["Dream Career", "Future Role", "Next Chapter", "Perfect Match"];

export default function Landing() {
  const navigate = useNavigate();
  const typed = useTypewriter(TYPEWRITER_WORDS);

  return (
    <>
      <Navbar />
      <Particles />

      <div style={{ position: "relative", zIndex: 1, overflow: "hidden" }}>

        {/* ── ANIMATED GRADIENT MESH ─────────────────────────── */}
        <div style={orb1} /><div style={orb2} /><div style={orb3} />

        {/* ── HERO ──────────────────────────────────────────── */}
        <section style={s.hero}>
          <div style={s.heroBadge}>
            <span style={s.badgeDot} />
            Smart Campus Placement · Powered by AI
          </div>

          <h1 style={s.heroTitle}>
            Land Your{" "}
            <span style={s.heroGold}>
              {typed}
              <span style={s.cursor}>|</span>
            </span>
            <br />
            <span style={{ color: "var(--text)" }}>with Intelligence</span>
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
              Sign In →
            </button>
          </div>

          {/* Floating badge chips */}
          <div style={s.chips}>
            {["🤖 AI Matching", "📊 Live Analytics", "📧 Auto Emails", "🔒 Secure"].map((c, i) => (
              <span key={c} style={{ ...s.chip, animationDelay: `${i * 0.2}s` }}>{c}</span>
            ))}
          </div>

          {/* STATS */}
          <div style={s.statsGrid}>
            {[
              { v: "500+", l: "Partner Companies" },
              { v: "10000+", l: "Students Placed" },
              { v: "95%", l: "Placement Rate" },
              { v: "12+", l: "Avg Package (LPA)" },
            ].map(({ v, l }) => {
              const ref = useCountUp(v);
              return (
                <div key={l} style={s.statCard}>
                  <h2 ref={ref} style={s.statVal}>{v}</h2>
                  <p style={s.statLbl}>{l}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── MARQUEE STRIP ─────────────────────────────────── */}
        <div style={s.marqueeWrap}>
          <div style={s.marquee}>
            {[...Array(3)].map((_, k) =>
              ["AI Resume Parsing", "Smart Shortlisting", "Company Portal", "Live Dashboards",
                "Email Notifications", "CSV Export", "Role-based Access", "Real-time Sync"].map(t => (
                  <span key={`${t}${k}`} style={s.marqueeItem}>
                    <span style={s.marqueeDot}>◆</span> {t}
                  </span>
                ))
            )}
          </div>
        </div>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <section style={s.section}>
          <Reveal>
            <p style={s.sectionEye}>PLATFORM FEATURES</p>
            <h2 style={s.sectionTitle}>Everything in one platform</h2>
          </Reveal>
          <div style={s.featGrid}>
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <Reveal key={title} delay={i * 0.07}>
                <TiltCard style={{ ...s.featCard, borderTop: `2px solid ${color}30` }}>
                  <div style={{ ...s.featIconBox, background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={22} color={color} />
                  </div>
                  <h3 style={s.featTitle}>{title}</h3>
                  <p style={s.featDesc}>{desc}</p>
                  <div style={{ ...s.featGlow, background: `radial-gradient(circle at 0% 100%, ${color}15, transparent 70%)` }} />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── ROLES ─────────────────────────────────────────── */}
        <section style={s.section}>
          <Reveal>
            <p style={s.sectionEye}>WHO IS IT FOR</p>
            <h2 style={s.sectionTitle}>Built for every stakeholder</h2>
          </Reveal>
          <div style={s.rolesGrid}>
            {ROLES.map(({ icon: Icon, role, perks, color }, i) => (
              <Reveal key={role} delay={i * 0.1}>
                <TiltCard style={{ ...s.roleCard, border: `1px solid ${color}25` }}>
                  <div style={{ ...s.roleIconBox, background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={26} color={color} />
                  </div>
                  <h3 style={{ ...s.roleTitle, color }}>{role}</h3>
                  <ul style={s.roleList}>
                    {perks.map((p, pi) => (
                      <li key={p} style={{ ...s.rolePerk, animationDelay: `${pi * 0.08}s` }}>
                        <IconCheckCircle size={14} color={color} /> {p}
                      </li>
                    ))}
                  </ul>
                  <div style={{ ...s.featGlow, background: `radial-gradient(circle at 50% 110%, ${color}12, transparent 65%)` }} />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── CTA STRIP ─────────────────────────────────────── */}
        <Reveal>
          <section style={s.ctaStrip}>
            <div style={s.ctaGlow1} /><div style={s.ctaGlow2} />
            <p style={s.ctaEye}>START TODAY</p>
            <h2 style={s.ctaTitle}>Ready to accelerate placements?</h2>
            <p style={s.ctaSub}>Join thousands of students and companies already on RecruitX.</p>
            <button onClick={() => navigate("/register")} style={{ ...s.btnPrimary, fontSize: "16px", padding: "15px 36px" }}>
              Create Free Account <IconArrowRight size={16} />
            </button>
          </section>
        </Reveal>

        <footer style={s.footer}>
          <span style={{ color: "var(--muted)", fontSize: "13px" }}>© 2025 RecruitX · Smart Campus Placement Platform</span>
        </footer>
      </div>

      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-60px) scale(1.06); }
          66%      { transform: translate(-25px,30px) scale(0.95); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
        @keyframes chipFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes blink {
          0%,50% { opacity: 1; }
          51%,100% { opacity: 0; }
        }
        @keyframes badgePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.3); }
          50%      { box-shadow: 0 0 0 8px rgba(251,191,36,0); }
        }
        .feat-card:hover { box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
      `}</style>
    </>
  );
}

/* ── ORB backgrounds ─────────────────────────────────────────── */
const orbBase = {
  position: "fixed", borderRadius: "50%", pointerEvents: "none",
  filter: "blur(80px)", animation: "orbFloat linear infinite", zIndex: 0,
};
const orb1 = {
  ...orbBase, width: 700, height: 700, top: -200, left: -200,
  background: "radial-gradient(circle, rgba(251,191,36,0.12), transparent 65%)",
  animationDuration: "20s"
};
const orb2 = {
  ...orbBase, width: 500, height: 500, top: "40%", right: -180,
  background: "radial-gradient(circle, rgba(129,140,248,0.1), transparent 65%)",
  animationDuration: "28s", animationDelay: "-10s"
};
const orb3 = {
  ...orbBase, width: 400, height: 400, bottom: "5%", left: "30%",
  background: "radial-gradient(circle, rgba(52,211,153,0.08), transparent 65%)",
  animationDuration: "22s", animationDelay: "-5s"
};

/* ── Styles ──────────────────────────────────────────────────── */
const s = {
  hero: {
    maxWidth: "1160px", margin: "0 auto", padding: "120px 24px 80px",
    position: "relative", textAlign: "center",
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "7px 18px", borderRadius: "999px",
    border: "1px solid rgba(251,191,36,0.35)",
    background: "rgba(251,191,36,0.07)", backdropFilter: "blur(8px)",
    color: "#fbbf24", fontSize: "13px", fontWeight: 600,
    marginBottom: "32px", animation: "badgePulse 2.5s ease infinite",
  },
  badgeDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#22c55e", boxShadow: "0 0 8px #22c55e",
    display: "inline-block", animation: "blink 1.2s ease infinite",
  },
  heroTitle: {
    color: "var(--text)", fontSize: "clamp(46px,7vw,88px)",
    fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.035em",
    margin: "0 0 24px",
  },
  heroGold: {
    background: "linear-gradient(135deg,#fbbf24 0%,#f59e0b 40%,#fb923c 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  cursor: {
    display: "inline-block", WebkitTextFillColor: "#fbbf24",
    animation: "blink 0.8s ease infinite", marginLeft: "2px",
  },
  heroSub: {
    color: "var(--muted)", fontSize: "19px", maxWidth: "580px",
    lineHeight: 1.75, margin: "0 auto 44px",
  },
  ctaRow: { display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "48px", justifyContent: "center" },
  chips: { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "64px" },
  chip: {
    padding: "7px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--muted)", backdropFilter: "blur(8px)",
    animation: "chipFloat 3s ease infinite",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px" },
  statCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
    borderRadius: "20px", padding: "28px 22px", textAlign: "center",
    backdropFilter: "blur(12px)",
  },
  statVal: { color: "#fbbf24", fontSize: "38px", fontWeight: 900, margin: "0 0 6px" },
  statLbl: { color: "var(--muted)", fontSize: "13px", margin: 0 },

  // Marquee
  marqueeWrap: {
    borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
    overflow: "hidden", padding: "14px 0", background: "rgba(255,255,255,0.015)",
  },
  marquee: {
    display: "flex", gap: "0", whiteSpace: "nowrap",
    animation: "marquee 22s linear infinite",
  },
  marqueeItem: { padding: "0 28px", color: "var(--muted)", fontSize: "13px", fontWeight: 600 },
  marqueeDot: { color: "#fbbf24", marginRight: "10px" },

  section: { maxWidth: "1160px", margin: "0 auto", padding: "80px 24px" },
  sectionEye: { color: "#fbbf24", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", margin: "0 0 12px" },
  sectionTitle: {
    color: "var(--text)", fontSize: "clamp(28px,4vw,44px)",
    fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 48px",
  },

  // Feature cards
  featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: "18px" },
  featCard: {
    background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)",
    borderRadius: "22px", padding: "30px", position: "relative", overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  featIconBox: {
    width: 48, height: 48, borderRadius: "14px",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "18px",
  },
  featTitle: { color: "var(--text)", fontSize: "17px", fontWeight: 700, margin: "0 0 10px" },
  featDesc: { color: "var(--muted)", fontSize: "14px", lineHeight: 1.7, margin: 0 },
  featGlow: { position: "absolute", inset: 0, pointerEvents: "none", borderRadius: "22px" },

  // Role cards
  rolesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: "18px" },
  roleCard: {
    background: "rgba(255,255,255,0.025)", borderRadius: "24px",
    padding: "36px 28px", position: "relative", overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  roleIconBox: {
    width: 56, height: 56, borderRadius: "16px",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "20px",
  },
  roleTitle: { fontSize: "22px", fontWeight: 800, margin: "0 0 18px" },
  roleList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" },
  rolePerk: { display: "flex", alignItems: "center", gap: "9px", color: "var(--muted)", fontSize: "14px" },

  // CTA strip
  ctaStrip: {
    margin: "40px 24px 52px", borderRadius: "28px",
    background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.18)",
    textAlign: "center", padding: "80px 24px", position: "relative", overflow: "hidden",
    backdropFilter: "blur(12px)",
  },
  ctaGlow1: {
    position: "absolute", width: 500, height: 350, top: -150, left: "50%",
    transform: "translateX(-50%)", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(251,191,36,0.14), transparent 65%)",
    pointerEvents: "none",
  },
  ctaGlow2: {
    position: "absolute", width: 300, height: 200, bottom: -80, right: "10%",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(129,140,248,0.1), transparent 65%)",
    pointerEvents: "none",
  },
  ctaEye: { color: "#fbbf24", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", margin: "0 0 12px", position: "relative" },
  ctaTitle: {
    color: "var(--text)", fontSize: "clamp(26px,4vw,44px)",
    fontWeight: 900, letterSpacing: "-0.025em", margin: "0 0 14px", position: "relative",
  },
  ctaSub: { color: "var(--muted)", fontSize: "17px", margin: "0 0 36px", position: "relative" },

  footer: { textAlign: "center", padding: "24px", borderTop: "1px solid var(--border)" },

  btnPrimary: {
    width: "auto", padding: "13px 28px",
    background: "linear-gradient(135deg,#fbbf24 0%,#f59e0b 60%,#fb923c 100%)",
    color: "#000", border: "none", borderRadius: "14px", fontWeight: 800,
    fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center",
    gap: "8px", boxShadow: "0 0 24px rgba(251,191,36,0.3)",
    transition: "box-shadow 0.2s, transform 0.2s",
  },
  btnOutline: {
    width: "auto", padding: "13px 28px",
    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)",
    color: "var(--text)", border: "1px solid var(--border)",
    borderRadius: "14px", fontWeight: 600, fontSize: "15px", cursor: "pointer",
  },
};
