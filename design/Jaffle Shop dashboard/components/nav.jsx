/* Top nav — shared across all pages.
   Usage: render <TopNav active="app" />
   Active values: home | app | ltv | churn | dq                  */

function TopNav({ active }) {
  const { NAV_LINKS } = window.JS_DATA;
  return (
    <nav className="topnav">
      <a className="brand" href="index.html">
        <svg className="mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <g transform="translate(10, 10)">
            <path d="M0 0 L0 44 L44 44" stroke="#111111" strokeWidth="2" strokeLinecap="square"></path>
            <circle cx="10" cy="34" r="3" fill="#111111"></circle>
            <circle cx="24" cy="22" r="3" fill="#111111"></circle>
            <circle cx="38" cy="8" r="3.5" fill="var(--accent)"></circle>
            <path d="M10 34 L24 22 L38 8" stroke="#111111" strokeWidth="1.5" strokeLinecap="round"></path>
          </g>
        </svg>
        <div>
          <div className="wordmark">Jaffle Shop Analytics</div>
          <div className="tag">BONZANINI CONSULTING · PORTFOLIO</div>
        </div>
      </a>
      <div className="nav-links">
        {NAV_LINKS.map(l => (
          <a key={l.key} href={l.href} className={active === l.key ? 'active' : ''}>
            {l.label}
            {l.stub && <span className="stub">·wip</span>}
          </a>
        ))}
      </div>
      <div className="env">
        <span className="dot"></span>
        <span>duckdb · prod</span>
        <span style={{ color: 'var(--ink-4)' }}>·</span>
        <span>v0.4.2</span>
      </div>
    </nav>
  );
}

function SiteFoot() {
  return (
    <footer className="site-foot">
      <div className="left">
        <span>© 2026 Bonzanini Consulting</span>
        <span style={{ color: 'var(--ink-4)' }}>·</span>
        <span>Synthetic data — Jaffle Shop</span>
      </div>
      <div className="left">
        <a href="https://github.com" target="_blank" rel="noreferrer">Source</a>
        <span style={{ color: 'var(--ink-4)' }}>·</span>
        <a href="mailto:hi@example.com">Contact</a>
      </div>
    </footer>
  );
}

Object.assign(window, { TopNav, SiteFoot });
