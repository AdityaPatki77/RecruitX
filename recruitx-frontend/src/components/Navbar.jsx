import { Link, useNavigate, useLocation } from "react-router-dom";
import { getRole } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import { IconSun, IconMoon, IconLogout } from "./Icons";

/* ─── role meta ───────────────────────────────────────────────── */
const ROLE_LINKS = {
  student: [{ to: "/student", label: "Dashboard" },
  { to: "/student/jobs", label: "Jobs" }],
  placement: [{ to: "/placement", label: "Dashboard" },
  { to: "/placement/create", label: "Create Job" }],
  company: [{ to: "/company", label: "Dashboard" },
  { to: "/company/create", label: "Create Job" }],
};

const ROLE_COLORS = {
  student: { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.45)", text: "#818cf8" },
  placement: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.45)", text: "#34d399" },
  company: { bg: "rgba(255,172,65,0.15)", border: "rgba(255,172,65,0.45)", text: "#FFAC41" },
};

/* ─── component ───────────────────────────────────────────────── */
export default function Navbar() {
  const role = getRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const isDark = theme === "dark";
  const links = ROLE_LINKS[role] ?? [];
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.company;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* ── inject scoped styles ── */}
      <style>{`
        .nx-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 4px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--muted);
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nx-nav-link::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          border-radius: 2px;
          background: var(--accent);
          transition: width 0.25s ease;
        }
        .nx-nav-link:hover {
          color: var(--text);
        }
        .nx-nav-link:hover::after {
          width: 100%;
        }
        .nx-nav-link.active {
          color: var(--accent);
          font-weight: 600;
        }
        .nx-nav-link.active::after {
          width: 100%;
        }

        .nx-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          width: auto;
          transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
          line-height: 1;
        }
        .nx-icon-btn:hover {
          border-color: var(--accent);
          color: var(--text);
          background: rgba(255,172,65,0.07);
          transform: translateY(-1px);
        }
        .nx-icon-btn.danger:hover {
          border-color: #f87171;
          color: #f87171;
          background: rgba(248,113,113,0.07);
        }

        .nx-logo-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #FFAC41 0%, #ff7c00 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: 900;
          font-size: 17px;
          box-shadow: 0 0 12px rgba(255,172,65,0.35);
          transition: box-shadow 0.3s, transform 0.2s;
          flex-shrink: 0;
        }
        .nx-logo-wrap:hover .nx-logo-box {
          box-shadow: 0 0 22px rgba(255,172,65,0.55);
          transform: rotate(-5deg) scale(1.07);
        }
        .nx-logo-wrap:hover .nx-logo-text {
          background: linear-gradient(90deg, #FFAC41, #ff7c00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nx-logo-text {
          font-weight: 800;
          font-size: 18px;
          color: #FFAC41;
          transition: color 0.2s;
          letter-spacing: -0.3px;
        }

        .nx-sep {
          width: 1px;
          height: 22px;
          background: var(--border);
          border-radius: 1px;
        }

        @keyframes nx-slide-down {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        header.nx-header {
          animation: nx-slide-down 0.35s ease;
        }
      `}</style>

      <header
        className="nx-header"
        style={{
          height: "68px",
          width: "100%",
          background: isDark
            ? "rgba(10,10,10,0.88)"
            : "rgba(245,245,245,0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "background 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            height: "100%",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* ── LEFT: logo + nav links ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {/* Logo */}
            <div
              className="nx-logo-wrap"
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <div className="nx-logo-box">R</div>
              <span className="nx-logo-text">RecruitX</span>
            </div>

            {/* divider */}
            {links.length > 0 && <div className="nx-sep" />}

            {/* Nav links */}
            <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {links.map(({ to, label }) => {
                const isActive = location.pathname === to ||
                  (to !== "/" && location.pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`nx-nav-link${isActive ? " active" : ""}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── RIGHT: role badge + theme + logout ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Role badge */}
            {role && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: roleStyle.bg,
                  border: `1px solid ${roleStyle.border}`,
                  color: roleStyle.text,
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                {role}
              </span>
            )}

            <div className="nx-sep" />

            {/* Theme toggle */}
            <button
              className="nx-icon-btn"
              onClick={toggle}
              title={isDark ? "Switch to Light" : "Switch to Dark"}
            >
              {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>

            {/* Logout */}
            {role && (
              <button
                className="nx-icon-btn danger"
                onClick={logout}
                title="Sign out"
              >
                <IconLogout size={16} />
                <span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}