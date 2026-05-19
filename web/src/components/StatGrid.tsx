interface Stat {
  label: string;
  value: string;
  sublabel?: string;
}

export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="stat-grid">
      {stats.map((s) => (
        <div key={s.label} className="stat">
          <div className="stat-label">{s.label}</div>
          <div className="stat-value">{s.value}</div>
          {s.sublabel ? <div className="stat-sublabel">{s.sublabel}</div> : null}
        </div>
      ))}
    </div>
  );
}
