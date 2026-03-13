import React, { useState, useEffect } from 'react';
import { getStressColor, getStressVerdict } from '../api/client';

export default function Header({
  lastUpdated,
  onRefresh,
  isRefreshing,
  stressScore,
  stressLevel
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scoreColor = getStressColor(stressScore);
  const verdictStr = getStressVerdict(stressScore);

  const formatUTC = (date) => {
    const h = String(date.getUTCHours()).padStart(2, '0');
    const m = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    return `UTC ${h}:${m}:${s}`;
  };

  return (
    <header style={{
      width: '100%',
      height: '56px',
      position: 'sticky',
      top: 0,
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 100
    }}>
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '16px',
          color: 'var(--accent)',
          letterSpacing: '0.3em',
          fontWeight: 700
        }}>
          CRASHSIGNAL
        </div>
        <div style={{ color: 'var(--border)' }}>/</div>
        <div style={{
          fontSize: '9px',
          color: 'var(--text-dim)',
          letterSpacing: '0.2em'
        }}>
          MARKET STRESS INTELLIGENCE SYSTEM
        </div>
      </div>

      {/* Center section */}
      <div style={{
        background: `${scoreColor}14`, // 8% opacity roughly
        border: `1px solid ${scoreColor}4d`, // 30% opacity
        padding: '6px 20px',
        fontSize: '10px',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.15em',
        color: scoreColor,
        textShadow: `0 0 10px ${scoreColor}`
      }}>
        {verdictStr}
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)' }}>
          {formatUTC(time)}
        </div>
        <div style={{ color: 'var(--border)' }}>|</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulse-dot"></div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            LIVE FEED
          </div>
        </div>
        <div style={{ color: 'var(--border)' }}>|</div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-dim)',
            background: 'transparent',
            fontSize: '10px',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
            padding: '4px 10px',
            cursor: isRefreshing ? 'default' : 'pointer',
            opacity: isRefreshing ? 0.3 : 1,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 255, 157, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-dim)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          [ REFRESH ]
        </button>
      </div>
    </header>
  );
}
