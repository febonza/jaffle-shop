import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/ltv", label: "LTV", stub: true },
  { to: "/churn", label: "Churn", stub: true },
  { to: "/data-quality", label: "Data quality", stub: true },
];

function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const onAbout = useLocation().pathname === "/about";

  return (
    <nav className={`topnav${menuOpen ? " nav-open" : ""}`}>
      <NavLink className="brand" to="/" onClick={() => setMenuOpen(false)}>
        <svg className="mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <g transform="translate(10, 10)">
            <path d="M0 0 L0 44 L44 44" stroke="#111111" strokeWidth="2" strokeLinecap="square" />
            <circle cx="10" cy="34" r="3" fill="#111111" />
            <circle cx="24" cy="22" r="3" fill="#111111" />
            <circle cx="38" cy="8" r="3.5" fill="var(--accent)" />
            <path d="M10 34 L24 22 L38 8" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
        <div>
          <div className="wordmark">Jaffle Shop Analytics</div>
          <div className="tag">BONZANINI CONSULTING · PORTFOLIO</div>
        </div>
      </NavLink>

      <div className="nav-links">
        {NAV_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
            {l.stub && <span className="stub">·wip</span>}
          </NavLink>
        ))}
      </div>

      <div className="nav-right">
        <div className="env">
          <span className="dot" />
          <span>duckdb · prod · v0.4.2</span>
        </div>
        <NavLink className="about-btn" to={onAbout ? "/" : "/about"} onClick={() => setMenuOpen(false)}>
          {onAbout ? "Back to dashboard" : "About this dashboard"} <span aria-hidden="true">→</span>
        </NavLink>
      </div>

      <button
        className="menu-btn"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {menuOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5 H17 M3 10 H17 M3 15 H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        )}
      </button>
    </nav>
  );
}

function SiteFoot() {
  return (
    <footer className="site-foot">
      <div className="left">
        <span>© 2026 Bonzanini Consulting</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span>Synthetic data — Jaffle Shop</span>
      </div>
      <div className="left">
        <a href="https://github.com/febonza/jaffle-shop" target="_blank" rel="noreferrer">
          Source
        </a>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <a href="mailto:felipe@bonzanini.consulting">Contact</a>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      {children}
      <SiteFoot />
    </>
  );
}
