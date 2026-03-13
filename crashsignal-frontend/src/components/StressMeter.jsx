import React from 'react';
import { formatTime } from '../api/client';

export default function StressMeter({ score = 0, level = "NOMINAL", color = "#00ff9d", lastUpdated }) {
  const CIRC = 2 * Math.PI * 90;
  const progress = Math.max(0, Math.min(100, score));
  const dashoffset = CIRC - (progress / 100) * CIRC;

  return (
    <div className="panel" style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="grid-overlay" style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.3,
        pointerEvents: 'none'
      }}></div>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '9px',
        color: 'var(--text-dim)',
        letterSpacing: '0.25em',
        textAlign: 'center',
        marginBottom: '24px',
        zIndex: 2
      }}>
        THREAT ASSESSMENT
      </div>

      <div style={{ position: 'relative', width: '260px', height: '260px', zIndex: 2 }}>
        <svg viewBox="0 0 260 260" width="260" height="260">
          <defs>
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Outermost decorative ring */}
          <circle r="118" cx="130" cy="130" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 8" />

          {/* Second decorative ring */}
          <circle r="108" cx="130" cy="130" fill="none" stroke={color} strokeWidth="1" opacity="0.15" />

          {/* Background arc */}
          <circle r="90" cx="130" cy="130" stroke="#0d1f35" strokeWidth="14" fill="none" />

          {/* Progress arc */}
          <circle 
            r="90" cx="130" cy="130" 
            stroke={color} 
            strokeWidth="14" 
            strokeLinecap="butt" 
            fill="none" 
            strokeDasharray={CIRC} 
            strokeDashoffset={dashoffset} 
            transform="rotate(-90 130 130)" 
            style={{ transition: 'stroke-dashoffset 2s ease' }}
            filter="url(#arcGlow)"
          />

          {/* Tick marks (every 10 units = 36°) */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => {
            const angle = (tick / 100) * 360 - 90;
            const x1 = 130 + 96 * Math.cos((angle * Math.PI) / 180);
            const y1 = 130 + 96 * Math.sin((angle * Math.PI) / 180);
            const x2 = 130 + 104 * Math.cos((angle * Math.PI) / 180);
            const y2 = 130 + 104 * Math.sin((angle * Math.PI) / 180);
            
            const isPassed = score >= tick;
            const tickColor = isPassed ? 'var(--text-bright)' : 'var(--text-dim)';

            return (
              <g key={tick}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tickColor} strokeWidth="1.5" />
                {[0, 25, 50, 75, 100].includes(tick) && (
                  <text 
                    x={130 + 114 * Math.cos((angle * Math.PI) / 180)} 
                    y={130 + 114 * Math.sin((angle * Math.PI) / 180)}
                    fill="var(--text-dim)"
                    fontSize="8"
                    fontFamily="'JetBrains Mono', monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {tick}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center crosshair */}
          <line x1="122" y1="130" x2="138" y2="130" stroke="var(--border)" strokeWidth="1.5" />
          <line x1="130" y1="122" x2="130" y2="138" stroke="var(--border)" strokeWidth="1.5" />

          {/* Center score */}
          <text
            x="130"
            y="138"
            fontSize="56"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="700"
            fill={color}
            filter="url(#arcGlow)"
            textAnchor="middle"
          >
            {Math.round(score)}
          </text>

          {/* Level text below score */}
          <text
            x="130"
            y="158"
            fontSize="9"
            letterSpacing="5"
            fill={color}
            opacity="0.9"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
          >
            {level}
          </text>

          {/* Corner coordinates */}
          <text x="5" y="10" fontSize="7" fill="var(--text-dim)" fontFamily="'JetBrains Mono', monospace">SYS//CRASHSIGNAL</text>
          <text x="255" y="10" fontSize="7" fill="var(--text-dim)" fontFamily="'JetBrains Mono', monospace" textAnchor="end">CLF//UNCLASSIFIED</text>
          <text x="5" y="255" fontSize="7" fill="var(--text-dim)" fontFamily="'JetBrains Mono', monospace">VER//4.0.1</text>
          <text x="255" y="255" fontSize="7" fill="var(--text-dim)" fontFamily="'JetBrains Mono', monospace" textAnchor="end">UTC//{formatTime(lastUpdated)}</text>
        </svg>
      </div>

      <div style={{
        width: '80%',
        marginTop: '24px',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ width: '100%', height: '2px', background: 'var(--border)' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: color, transition: 'width 2s ease' }}></div>
        </div>
        <div style={{
          fontSize: '9px',
          color: 'var(--text-dim)',
          fontFamily: "'JetBrains Mono', monospace",
          textAlign: 'center'
        }}>
          LAST UPDATED {formatTime(lastUpdated)}
        </div>
      </div>
    </div>
  );
}
