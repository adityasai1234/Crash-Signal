import React from 'react';
import { getStressColor, getStressLevel } from '../api/client';

export default function NewsPanel({ newsStress = 50, items = [] }) {
  const color = getStressColor(newsStress);
  const glow = newsStress > 50 ? `0 0 10px ${color}80` : 'none';

  return (
    <div className="panel" style={{ width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-label">
        SIGNALS INTELLIGENCE — NEWS
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{
          fontSize: '28px',
          fontFamily: "'JetBrains Mono', monospace",
          color: color,
          textShadow: glow,
          lineHeight: 1
        }}>
          {newsStress.toFixed(1)}
        </div>
        <div style={{
          fontSize: '9px',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.2rem',
          color: 'var(--text-dim)',
          marginTop: '4px'
        }}>
          {getStressLevel(newsStress)}
        </div>
        
        <div style={{
          width: '100%',
          height: '2px',
          background: 'var(--border)',
          marginTop: '8px'
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, newsStress))}%`,
            height: '100%',
            background: color,
            boxShadow: glow
          }}></div>
        </div>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'var(--border-dim)', margin: '8px 0' }}></div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <style>
          {`
            .news-item {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid var(--border-dim);
              transition: background 0.2s ease;
            }
            .news-item:hover {
              background: var(--bg-card);
            }
          `}
        </style>
        {items.length === 0 ? (
          <div style={{
            color: 'var(--text-dim)',
            textAlign: 'center',
            fontSize: '9px',
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: '24px'
          }}>
            NO FEED DATA AVAILABLE
          </div>
        ) : (
          items.slice(0, 8).map((item, idx) => {
            let sentimentChar = '·';
            let sentimentColor = 'var(--text-dim)';
            let sentimentStyle = {};

            if (item.score > 0.1) {
              sentimentChar = '▲';
              sentimentColor = 'var(--green)';
            } else if (item.score < -0.1) {
              sentimentChar = '▼';
              sentimentColor = 'var(--red)';
            }

            const isNegative = item.score < -0.1;
            const headlineColor = isNegative ? 'var(--text-bright)' : 'var(--text)';

            return (
              <div key={idx} className="news-item">
                <div style={{ width: '20px', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: sentimentColor, paddingTop: '2px' }}>
                  {sentimentChar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '11px',
                    color: headlineColor,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    marginBottom: '4px'
                  }}>
                    {item.headline || item.title}
                  </div>
                  <div style={{
                    fontSize: '8px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text-dim)'
                  }}>
                    {item.sentiment || (item.score > 0 ? 'POSITIVE' : item.score < 0 ? 'NEGATIVE' : 'NEUTRAL')} {(Math.abs(item.score || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
