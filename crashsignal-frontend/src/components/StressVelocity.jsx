export default function StressVelocity({
  currentScore = 0,
  histPoints = []
}) {
  return (
    <div className="panel" style={{
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: "24px"
    }}>
      <div className="panel-label"
           style={{ marginBottom: 0 }}>
        STRESS VELOCITY
      </div>
      <div style={{
        color: "var(--text-dim)",
        fontSize: "9px"
      }}>
        COMPUTING...
      </div>
    </div>
  );
}
