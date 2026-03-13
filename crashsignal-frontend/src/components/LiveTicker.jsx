import React from 'react';

export default function LiveTicker({ indicators = [] }) {
  // We duplicate the indicators array to create a seamless scrolling loop
  const tickerItems = [...indicators, ...indicators];

  return (
    <div style={{
      height: '28px',
      width: '100%',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Fixed label on the left */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        padding: '0 12px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '9px',
        color: 'var(--accent)'
      }}>
        ◈ LIVE FEED
      </div>

      {/* Scrolling container */}
      <div
        className="ticker-scroll"
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          paddingLeft: '120px', // Space for the fixed label
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          lineHeight: '28px'
        }}
      >
        <style>
          {`
            .ticker-scroll {
              animation: marquee 50s linear infinite;
            }
            .ticker-scroll:hover {
              animation-play-state: paused;
            }
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
        </style>

        {tickerItems.map((indicator, index) => {
          let arrow = '·';
          if (indicator.change > 0) arrow = '↑';
          if (indicator.change < 0) arrow = '↓';

          const color = indicator.is_stressed ? (indicator.change < 0 ? 'var(--orange)' : 'var(--red)') : 'var(--text-dim)';
          const textShadow = indicator.is_stressed ? `0 0 6px ${color}` : 'none';
          const changeStr = indicator.change != null 
            ? (indicator.change > 0 ? `+${indicator.change}%` : `${indicator.change}%`) 
            : '——%';

          return (
            <span key={index} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--text)', marginRight: '8px' }}>{indicator.key}</span>
              <span style={{ color, textShadow, marginRight: '8px' }}>{indicator.value != null ? indicator.value.toFixed(2) : '——'}</span>
              <span style={{ color, textShadow }}>{arrow} {changeStr}</span>
              <span style={{ margin: '0 16px', color: 'var(--border)' }}>·</span>
            </span>
          );
        })}
        {indicators.length === 0 && (
          <span style={{ color: 'var(--text-dim)' }}>AWAITING SIGNAL INTELLIGENCE...</span>
        )}
      </div>
    </div>
  );
}
