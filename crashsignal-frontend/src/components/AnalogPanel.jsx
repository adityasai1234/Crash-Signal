import React from 'react';

export default function AnalogPanel({ analogs = [] }) {
  const best = analogs.length > 0 ? analogs[0] : null;

  function timeAgoLabel(dateStr) {
    if (!dateStr) return "";
    const then = new Date(dateStr);
    const now = new Date();
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 365) return `${diffDays}D AGO`;
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return months > 0 ? `${years}Y ${months}M AGO` : `${years}Y AGO`;
  }

  const eventLabel = best?.label === "CRISIS" ? "CRISIS PERIOD" :
                     best?.label === "STRESS" ? "STRESS PERIOD" : "NORMAL PERIOD";

  const eventColor = best?.label === "CRISIS" ? "var(--red)" :
                     best?.label === "STRESS" ? "var(--orange)" : "var(--blue)";

  return (
    <div className="panel" style={{ width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-label">
        PATTERN RECOGNITION — HISTORICAL MATCH
      </div>

      <div style={{
        fontSize: '8px',
        color: 'var(--text-dim)',
        fontFamily: "'JetBrains Mono', monospace",
        marginBottom: '12px'
      }}>
        CURRENT CONDITIONS MATCH PRECEDENT:
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {analogs.length === 0 ? (
          <div style={{
            color: 'var(--text-dim)',
            textAlign: 'center',
            fontSize: '9px',
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: '24px'
          }}>
            NO PATTERN MATCH DATA
          </div>
        ) : (
          <>
            {best && (
              <div style={{
                background: `${eventColor}0a`,
                border: `1px solid ${eventColor}40`,
                padding: '12px 14px',
                marginBottom: '12px'
              }}>
                <div style={{
                  fontSize: '7px',
                  fontFamily: "'JetBrains Mono'",
                  letterSpacing: '0.2em',
                  color: eventColor,
                  marginBottom: '8px',
                  textShadow: `0 0 6px ${eventColor}`
                }}>
                  ◈ LAST TIME THIS HAPPENED
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono'",
                  fontSize: '12px',
                  color: 'var(--text-bright)',
                  marginBottom: '6px',
                  lineHeight: 1.5
                }}>
                  {best.date}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                    {timeAgoLabel(best.date)} · STRESS {best.stress_score.toFixed(1)} · {(best.similarity * 100).toFixed(0)}% MATCH
                  </div>
                  <span style={{
                    background: `${eventColor}20`,
                    border: `1px solid ${eventColor}50`,
                    color: eventColor,
                    fontSize: '7px',
                    fontFamily: "'JetBrains Mono'",
                    letterSpacing: '0.12em',
                    padding: '2px 8px'
                  }}>
                    {eventLabel}
                  </span>
                </div>
                <div style={{ height: '2px', background: 'var(--border)', marginTop: '10px' }}>
                  <div style={{ height: '100%', width: `${best.similarity * 100}%`, background: eventColor, boxShadow: `0 0 6px ${eventColor}` }} />
                </div>
              </div>
            )}

            {analogs.length > 1 && (
              <div style={{
                fontSize: '7px',
                fontFamily: "'JetBrains Mono'",
                letterSpacing: '0.18em',
                color: 'var(--text-dim)',
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-dim)'
              }}>
                OTHER PATTERN MATCHES
              </div>
            )}

            {analogs.slice(1).map((analog, idx) => {
            let labelColor = 'var(--text-dim)';
            const labelStr = (analog.label || 'NORMAL').toUpperCase();
            
            if (labelStr === 'CRISIS' || labelStr === 'CRITICAL') {
              labelColor = 'var(--red)';
            } else if (labelStr === 'STRESS' || labelStr === 'HIGH' || labelStr === 'ELEVATED') {
              labelColor = 'var(--orange)';
            } else if (labelStr === 'NORMAL' || labelStr === 'NOMINAL') {
              labelColor = 'var(--blue)';
            } else {
              labelColor = 'var(--yellow)';
            }

            const simPercent = Math.round((analog.similarity || 0) * 100);
            const isHighMatch = simPercent > 80;

            return (
              <div key={idx} style={{
                borderLeft: `2px solid ${labelColor}`,
                background: 'var(--bg-card)',
                padding: '12px 14px',
                marginBottom: '6px'
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text)'
                  }}>
                    ◈ {analog.date || '----'}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: labelColor,
                    textShadow: isHighMatch ? `0 0 8px ${labelColor}` : 'none'
                  }}>
                    {simPercent}% MATCH
                  </div>
                </div>

                {/* Middle row */}
                <div style={{
                  fontSize: '9px',
                  color: 'var(--text-dim)',
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  STRESS IDX: {(analog.stress_score || 0).toFixed(1)}
                </div>

                {/* Label badge */}
                <div style={{
                  display: 'inline-block',
                  background: `${labelColor}1f`, // ~12% opacity
                  border: `1px solid ${labelColor}66`, // ~40% opacity
                  color: labelColor,
                  fontSize: '8px',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.15em',
                  padding: '2px 8px',
                  marginTop: '6px'
                }}>
                  {labelStr}
                </div>

                {/* Similarity bar */}
                <div style={{
                  width: '100%',
                  height: '2px',
                  background: 'var(--border)',
                  marginTop: '8px'
                }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, simPercent))}%`,
                    height: '100%',
                    background: labelColor
                  }}></div>
                </div>
              </div>
            );
          })}
          </>
        )}
      </div>
    </div>
  );
}
