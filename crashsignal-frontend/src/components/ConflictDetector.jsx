const GROUPS = {
  VOLATILITY: ["vix", "vvix"],
  CREDIT: ["credit_spread_hy", "credit_spread_ig", "ted_spread"],
  MACRO: ["unemployment_claims", "consumer_sentiment", "manufacturing_pmi"],
  LIQUIDITY: ["financial_conditions", "bank_stress", "real_rates"],
  MARKET: ["sp500", "dollar_index", "gold_ratio"]
};

export default function ConflictDetector({
  indicators = []
}) {
  const groupStatus = Object.entries(GROUPS)
    .map(([group, keys]) => {
      const groupInds = keys.map(k => indicators.find(i => i.key === k)).filter(Boolean);

      if (groupInds.length === 0) return null;

      const stressedCount = groupInds.filter(i => i.is_stressed).length;
      const ratio = stressedCount / groupInds.length;
      const isStressed = ratio >= 0.5;
      const maxContrib = Math.max(...groupInds.map(i => i.stress_contribution));

      return { group, groupInds, stressedCount, ratio, isStressed, maxContrib };
    })
    .filter(Boolean);

  const stressedGroups = groupStatus.filter(g => g.isStressed);
  const nominalGroups = groupStatus.filter(g => !g.isStressed);

  const hasConflict = stressedGroups.length > 0 && nominalGroups.length > 0;

  const conflictSeverity = stressedGroups.length >= 3 ? "MAJOR" :
                          stressedGroups.length >= 2 ? "MODERATE" : "MINOR";

  const conflictMsg = hasConflict
    ? `${stressedGroups.map(g => g.group).join(", ")} STRESSED — ${nominalGroups.map(g => g.group).join(", ")} NOMINAL`
    : "";

  if (!hasConflict) return null;

  return (
    <div className="panel fade-in" style={{
      padding: "12px 16px",
      borderLeft: "2px solid var(--yellow)",
      borderTop: "1px solid var(--yellow)30",
      boxShadow: "0 0 20px var(--yellow)08"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: "9px",
            letterSpacing: "0.2em",
            color: "var(--yellow)",
            textShadow: "0 0 8px var(--yellow)",
            marginBottom: "4px"
          }}>
            ⚡ SPLIT SIGNAL — {conflictSeverity}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: "8px",
            color: "var(--text-dim)",
            letterSpacing: "0.06em",
            maxWidth: "400px"
          }}>
            {conflictMsg}
          </div>
        </div>

        <div style={{ width: "1px", height: "36px", background: "var(--border)" }} />

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {stressedGroups.map(g => (
            <div key={g.group} style={{
              background: "var(--red)15",
              border: "1px solid var(--red)40",
              padding: "4px 10px",
              fontSize: "8px",
              fontFamily: "'JetBrains Mono'",
              letterSpacing: "0.1em",
              color: "var(--red)"
            }}>
              {g.group} ↑
            </div>
          ))}
          {nominalGroups.map(g => (
            <div key={g.group} style={{
              background: "var(--green)0a",
              border: "1px solid var(--green)25",
              padding: "4px 10px",
              fontSize: "8px",
              fontFamily: "'JetBrains Mono'",
              letterSpacing: "0.1em",
              color: "var(--text-dim)"
            }}>
              {g.group} →
            </div>
          ))}
        </div>

        <div style={{ width: "1px", height: "36px", background: "var(--border)" }} />

        <div style={{
          fontSize: "8px",
          color: "var(--text-dim)",
          fontFamily: "'JetBrains Mono'",
          letterSpacing: "0.06em",
          maxWidth: "220px",
          lineHeight: 1.6
        }}>
          {stressedGroups.length === 1
            ? `ISOLATED STRESS IN ${stressedGroups[0].group}. BROAD MARKET STABLE.`
            : `STRESS SPREADING ACROSS MULTIPLE SECTORS. MONITOR CLOSELY.`
          }
        </div>
      </div>
    </div>
  );
}
