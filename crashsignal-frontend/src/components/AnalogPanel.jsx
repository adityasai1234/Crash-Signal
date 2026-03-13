import React from 'react';

export default function AnalogPanel({ analogs = [] }) {
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
          analogs.map((analog, idx) => {
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
          })
        )}
      </div>
    </div>
  );
}
