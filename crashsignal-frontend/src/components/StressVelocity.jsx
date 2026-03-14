import { getStressColor } from '../api/client';

export default function StressVelocity({
  currentScore = 0,
  histPoints = []
}) {
  function getScoreNDaysAgo(n) {
    if (histPoints.length === 0) return null;
    const target = new Date();
    target.setDate(target.getDate() - n);
    const targetStr = target.toISOString().slice(0, 10);

    const past = histPoints.filter(p => p.date <= targetStr);
    if (past.length === 0) return null;
    return past[past.length - 1].stress_score;
  }

  const score7d = getScoreNDaysAgo(7);
  const score30d = getScoreNDaysAgo(30);

  const delta7d = score7d !== null ? currentScore - score7d : null;
  const delta30d = score30d !== null ? currentScore - score30d : null;

  const velocity =
    delta7d === null ? "INSUFFICIENT DATA" :
    delta7d > 10 ? "ACCELERATING ↑↑" :
    delta7d > 3 ? "RISING ↑" :
    delta7d < -10 ? "EASING RAPIDLY ↓↓" :
    delta7d < -3 ? "EASING ↓" : "STABLE →";

  const velocityColor =
    delta7d === null ? "var(--text-dim)" :
    delta7d > 10 ? "var(--red)" :
    delta7d > 3 ? "var(--orange)" :
    delta7d < -3 ? "var(--green)" : "var(--text-dim)";

  const projection = delta7d !== null
    ? Math.min(100, Math.max(0, currentScore + (delta7d / 7) * 30))
    : null;

  const isAccelerating = delta7d > 10;
  const isRising = delta7d > 3;

  return (
    <div className="panel" style={{
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: "24px",
      borderTop: isAccelerating ? "1px solid var(--red)" : isRising ? "1px solid var(--orange)" : "1px solid var(--border)",
      boxShadow: isAccelerating ? "0 -2px 12px var(--red)20" : "none"
    }}>
      <div className="panel-label" style={{ marginBottom: 0, whiteSpace: "nowrap" }}>
        STRESS VELOCITY
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "7px", color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: "4px" }}>NOW</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "20px", fontWeight: "700", color: getStressColor(currentScore) }}>
            {currentScore.toFixed(1)}
          </div>
        </div>

        {score7d !== null && (
          <>
            <div style={{ fontSize: "16px", color: delta7d > 0 ? "var(--red)" : "var(--green)", opacity: 0.6 }}>←</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "7px", color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: "4px" }}>7D AGO</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "16px", color: getStressColor(score7d), opacity: 0.7 }}>
                {score7d.toFixed(1)}
              </div>
              <div style={{ fontSize: "8px", fontFamily: "'JetBrains Mono'", color: delta7d > 0 ? "var(--red)" : "var(--green)" }}>
                {delta7d > 0 ? "+" : ""}{delta7d?.toFixed(1)} pts
              </div>
            </div>
          </>
        )}

        {score30d !== null && (
          <>
            <div style={{ fontSize: "16px", color: "var(--border)", opacity: 0.4 }}>←</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "7px", color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: "4px" }}>30D AGO</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "16px", color: getStressColor(score30d), opacity: 0.6 }}>
                {score30d.toFixed(1)}
              </div>
              <div style={{ fontSize: "8px", fontFamily: "'JetBrains Mono'", color: delta30d > 0 ? "var(--red)" : "var(--green)" }}>
                {delta30d > 0 ? "+" : ""}{delta30d?.toFixed(1)} pts
              </div>
            </div>
          </>
        )}

        <div style={{ width: "1px", height: "40px", background: "var(--border)", margin: "0 8px" }} />

        <div>
          <div style={{ fontSize: "7px", color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: "4px" }}>VELOCITY</div>
          <div style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: "11px",
            color: velocityColor,
            textShadow: Math.abs(delta7d ?? 0) > 3 ? `0 0 8px ${velocityColor}` : "none",
            letterSpacing: "0.08em"
          }}>
            {velocity}
          </div>
        </div>

        {projection !== null && (
          <>
            <div style={{ width: "1px", height: "40px", background: "var(--border)", margin: "0 8px" }} />
            <div>
              <div style={{ fontSize: "7px", color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: "4px" }}>PROJECTED +30D</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: getStressColor(projection), letterSpacing: "0.05em" }}>
                {projection.toFixed(1)}{" "}
                <span style={{ fontSize: "8px", color: "var(--text-dim)" }}>(AT CURRENT RATE)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
