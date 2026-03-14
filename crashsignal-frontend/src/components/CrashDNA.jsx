import { getStressColor } from '../api/client';

export default function CrashDNA({
  indicators = [],
  analogs = [],
  importance = []
}) {
  const stressed = indicators
    .filter(i => i.is_stressed)
    .sort((a, b) => b.stress_contribution - a.stress_contribution);

  const leading = stressed.slice(0, 3);
  const lagging = stressed.slice(3, 6);
  const nominal = indicators
    .filter(i => !i.is_stressed)
    .slice(0, 3);

  const bestAnalog = analogs.length > 0 ? analogs[0] : null;

  const dnaLabel = leading.length === 0
    ? "NO STRESS SIGNAL DETECTED — MARKETS NOMINAL"
    : `LEADING: ${leading.map(i => i.name.toUpperCase()).join(", ")} · `
      + (lagging.length > 0
        ? `LAGGING: ${lagging.map(i => i.name.toUpperCase()).join(", ")}`
        : "NO LAGGING SIGNALS YET");

  return (
    <div className="panel" style={{ padding: "16px" }}>
      <div className="panel-label">
        CRASH DNA — SIGNAL FINGERPRINT
      </div>

      <div style={{
        fontFamily: "'JetBrains Mono'",
        fontSize: "10px",
        color: "var(--text-dim)",
        letterSpacing: "0.08em",
        marginBottom: "8px"
      }}>
        {dnaLabel}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "1px",
        background: "var(--border)"
      }}>
        {[
          { title: "LEADING SIGNALS", items: leading, accent: "var(--red)" },
          { title: "LAGGING SIGNALS", items: lagging, accent: "var(--orange)" },
          { title: "NOMINAL", items: nominal, accent: "var(--text-dim)" }
        ].map(col => (
          <div key={col.title} style={{
            background: "var(--bg-card)",
            padding: "12px"
          }}>
            <div style={{
              fontSize: "8px",
              fontFamily: "'JetBrains Mono'",
              letterSpacing: "0.15em",
              color: col.accent,
              marginBottom: "10px",
              textShadow: col.accent !== "var(--text-dim)" ? `0 0 6px ${col.accent}` : "none"
            }}>
              {col.title}
            </div>

            {col.items.length === 0 ? (
              <div style={{ fontSize: "9px", color: "var(--text-dim)", opacity: 0.5 }}>—</div>
            ) : (
              col.items.map(ind => (
                <div key={ind.key} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "8px", color: "var(--text-dim)", letterSpacing: "0.05em" }}>
                      {ind.name.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: ind.color }}>
                      {ind.stress_contribution.toFixed(0)}
                    </span>
                  </div>
                  <div style={{ height: "2px", background: "var(--border)" }}>
                    <div style={{
                      height: "100%",
                      width: `${ind.stress_contribution}%`,
                      background: col.accent,
                      boxShadow: col.accent !== "var(--text-dim)" ? `0 0 4px ${col.accent}` : "none"
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {bestAnalog && (
        <div style={{
          marginTop: "12px",
          padding: "10px 14px",
          background: "var(--bg-card)",
          borderLeft: `2px solid ${
            bestAnalog.label === "CRISIS" ? "var(--red)" :
            bestAnalog.label === "STRESS" ? "var(--orange)" : "var(--blue)"
          }`
        }}>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.08em" }}>
            THIS PATTERN MOST RESEMBLES{" "}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "var(--text-bright)" }}>
            {bestAnalog.date}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "var(--text-dim)" }}>
            {" "}— STRESS INDEX{" "}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: getStressColor(bestAnalog.stress_score) }}>
            {bestAnalog.stress_score.toFixed(1)}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "var(--text-dim)" }}>
            {" "}({(bestAnalog.similarity * 100).toFixed(0)}% MATCH)
          </span>
        </div>
      )}
    </div>
  );
}
