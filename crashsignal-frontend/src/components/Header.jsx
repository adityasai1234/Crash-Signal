import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getStressColor, getStressVerdict } from '../api/client';

const NAV_ITEMS = [
  { path: '/', label: 'DASH' },
  { path: '/crash-dna', label: 'DNA', icon: '◆' },
  { path: '/velocity', label: 'VEL', icon: '▲' },
  { path: '/pattern', label: 'PAT', icon: '◈' },
  { path: '/conflicts', label: 'CFG', icon: '⚡' },
];

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: `${scoreColor}14`,
          border: `1px solid ${scoreColor}4d`,
          padding: '6px 16px',
          fontSize: '10px',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.15em',
          color: scoreColor,
          textShadow: `0 0 10px ${scoreColor}`
        }}>
          {verdictStr}
        </div>

        {/* Navigation */}
        <NavButtons />
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

function NavButtons() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '4px 8px',
              fontSize: '8px',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.1em',
              color: isActive ? 'var(--accent)' : 'var(--text-dim)',
              textDecoration: 'none',
              border: isActive ? '1px solid var(--accent)30' : '1px solid transparent',
              background: isActive ? 'var(--accent)08' : 'transparent',
              transition: 'all 0.15s ease',
              opacity: isActive ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)40';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.opacity = 1;
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.opacity = 0.6;
              }
            }}
          >
            {item.icon && <span style={{ fontSize: '7px' }}>{item.icon}</span>}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
