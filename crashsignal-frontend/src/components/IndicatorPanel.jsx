import React from 'react';

export default function IndicatorPanel({ indicators = [] }) {
  const nStressed = indicators.filter(i => i.is_stressed).length;

  return (
    <div className="panel" style={{ height: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-label">
        SIGNAL INTELLIGENCE [{indicators.length}]
      </div>
      
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '9px',
        color: 'var(--text-dim)',
        marginBottom: '8px'
      }}>
        {nStressed} SIGNALS ELEVATED
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px' }}>
        <style>
          {`
            .indicator-row {
              display: grid;
              grid-template-columns: 3fr 1fr 1fr 60px;
              height: 36px;
              align-items: center;
              border-bottom: 1px solid var(--border-dim);
              transition: background 0.2s ease;
            }
            .indicator-row:hover {
              background: var(--bg-card) !important;
            }
          `}
        </style>
        {indicators.map((ind, idx) => {
          let arrow = '·';
          let changeColor = 'var(--text-dim)';
          let changePrefix = '';
          
          if (ind.change > 0) {
            arrow = '↑';
            changeColor = 'var(--green)';
            changePrefix = '+';
          } else if (ind.change < 0) {
            arrow = '↓';
            changeColor = 'var(--red)';
            changePrefix = '';
          }

          const rowStyle = ind.is_stressed ? {
            background: `${ind.color}08`, 
            borderLeft: `2px solid ${ind.color}`
          } : {
            borderLeft: '2px solid transparent'
          };

          return (
            <div key={idx} className="indicator-row" style={rowStyle}>
              {/* Col 1 - Name */}
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                paddingLeft: ind.is_stressed ? '6px' : '8px',
                color: ind.is_stressed ? 'var(--text-bright)' : 'var(--text-dim)',
                textShadow: ind.is_stressed ? `0 0 6px ${ind.color}` : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {ind.key.replace(/_/g, ' ')}
              </div>

              {/* Col 2 - Value */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: ind.color,
                textShadow: ind.is_stressed ? `0 0 6px ${ind.color}` : 'none'
              }}>
                {ind.value !== undefined && ind.value !== null ? ind.value.toFixed(2) : '——'}
              </div>

              {/* Col 3 - Change */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                color: changeColor
              }}>
                {arrow} {changePrefix}{ind.change !== undefined && ind.change !== null ? ind.change.toFixed(2) : '0'}%
              </div>

              {/* Col 4 - Bar */}
              <div style={{ width: '56px', height: '3px', background: 'var(--border)', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(100, ind.stress_contribution || 0)}%`,
                  background: ind.color,
                  boxShadow: ind.is_stressed ? `0 0 4px ${ind.color}` : 'none'
                }}></div>
              </div>
            </div>
          );
        })}
        {indicators.length === 0 && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            color: 'var(--text-dim)',
            textAlign: 'center',
            marginTop: '32px'
          }}>
            AWAITING DATA STREAM...
          </div>
        )}
      </div>
    </div>
  );
}
