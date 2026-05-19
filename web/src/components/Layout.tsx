import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="container">
        <nav className="nav">
          <NavLink to="/" className="nav-brand">
            Jaffle Shop
          </NavLink>
          <div className="nav-links">
            <NavLink to="/" end>
              Overview
            </NavLink>
            <NavLink to="/churn">Churn</NavLink>
            <NavLink to="/ltv">LTV</NavLink>
            <NavLink to="/data-quality">Data quality</NavLink>
          </div>
        </nav>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">
        <div className="container">
          <span className="muted">
            Jaffle Shop analytics — built on jafgen, dbt, Dagster, DuckDB,
            Elementary. Source on{" "}
            <a href="https://github.com/febonza/jaffle-shop">GitHub</a>.
          </span>
        </div>
      </footer>
    </>
  );
}
