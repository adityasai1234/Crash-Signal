import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { getStressColor, formatTime } from '../api/client';

const LOCATIONS = [
  { id:"nyc",     city:"NEW YORK", label:"WALL STREET", coords:[-74.006, 40.7128], keys:["vix","credit_spread_hy","credit_spread_ig","sp500","dollar_index","gold_ratio","vvix"] },
  { id:"dc",      city:"WASHINGTON D.C.", label:"FEDERAL RESERVE", coords:[-77.0369, 38.9072], keys:["ted_spread","unemployment_claims","real_rates","bank_stress"] },
  { id:"chi",     city:"CHICAGO", label:"CHICAGO FED / CBOT", coords:[-87.6298, 41.8781], keys:["financial_conditions"] },
  { id:"aa",      city:"ANN ARBOR", label:"UMICH CONSUMER SURVEY", coords:[-83.7430, 42.2808], keys:["consumer_sentiment"] },
  { id:"atl",     city:"ATLANTA", label:"FED MANUFACTURING", coords:[-84.3880, 33.7490], keys:["manufacturing_pmi"] },
  { id:"sf",      city:"SAN FRANCISCO", label:"SF FED / TECH SENTIMENT", coords:[-122.4194, 37.7749], keys:["sp500","vvix"] },
  { id:"dal",     city:"DALLAS", label:"DALLAS FED / ENERGY", coords:[-96.7970, 32.7767], keys:["dollar_index"] },
  { id:"bos",     city:"BOSTON", label:"BOSTON FED", coords:[-71.0589, 42.3601], keys:["real_rates","ted_spread"] },
  { id:"kc",      city:"KANSAS CITY", label:"KC FED / AGRICULTURE", coords:[-94.5786, 39.0997], keys:["financial_conditions"] },
  { id:"mia",     city:"MIAMI", label:"SOUTHEAST MARKETS", coords:[-80.1918, 25.7617], keys:["credit_spread_hy"] },
  { id:"min",     city:"MINNEAPOLIS", label:"MINNEAPOLIS FED", coords:[-93.2650, 44.9778], keys:["consumer_sentiment","manufacturing_pmi"] },
  { id:"sea",     city:"SEATTLE", label:"PACIFIC NORTHWEST", coords:[-122.3321, 47.6062], keys:["vix","sp500"] }
];

export default function ThreatMap({ indicators = [] }) {
  const [selectedLoc, setSelectedLoc] = useState(null);
  const now = new Date();

  const locationData = LOCATIONS.map((loc) => {
    const locIndicators = loc.keys
      .map((k) => indicators.find((i) => i.key === k))
      .filter(Boolean);

    const stressedCount = locIndicators.filter((i) => i.is_stressed).length;

    const maxContrib = locIndicators.length > 0
      ? Math.max(...locIndicators.map((i) => i.stress_contribution || 0))
      : 0;

    const isHot = stressedCount > 0;
    const color = getStressColor(maxContrib);

    return { ...loc, locIndicators, stressedCount, maxContrib, isHot, color };
  });

  const totalIndicators = indicators.length;
  const totalStressed = indicators.filter(i => i.is_stressed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Map Container */}
      <div className="panel" style={{ padding: '16px', position: 'relative', height: '500px' }}>
        <div className="grid-overlay" style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          pointerEvents: 'none',
          zIndex: 1
        }}></div>

        {/* Corner labels */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)', zIndex: 2 }}>
          CONUS THREAT ASSESSMENT
        </div>
        <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--green)', zIndex: 2 }}>
          CLASSIFICATION: UNCLASSIFIED
        </div>
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', fontSize: '8px', color: 'var(--text-dim)', zIndex: 2 }}>
          SOURCE: FRED/NYSE/CBOT
        </div>
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', fontSize: '8px', color: 'var(--text-dim)', zIndex: 2 }}>
          AUTO-REFRESH: 60s
        </div>

        {/* SVG Defs for Glow */}
        <svg width="0" height="0">
          <defs>
            <filter id="pinGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* The Map */}
        <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%' }}>
          <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 900 }} width={900} height={460} style={{ width: '100%', height: '100%', outline: 'none' }}>
            <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#040810"
                    stroke="#0d1f35"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#080f1a", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {locationData.map((loc, index) => (
              <Marker key={loc.id} coordinates={loc.coords} onClick={() => setSelectedLoc(loc)}>
                {loc.isHot && (
                  <circle
                    r={16}
                    fill="none"
                    stroke={loc.color}
                    strokeWidth={1}
                    opacity={0.6}
                    style={{
                      animation: 'ping 2s ease-out infinite',
                      animationDelay: `${index * 0.15}s`,
                      transformOrigin: '0 0'
                    }}
                  />
                )}
                {loc.stressedCount > 1 && (
                  <circle
                    r={22}
                    fill="none"
                    stroke={loc.color}
                    strokeWidth={0.5}
                    opacity={0.3}
                    style={{
                      animation: 'ping 2.5s ease-out infinite',
                      animationDelay: `${index * 0.15 + 0.5}s`,
                      transformOrigin: '0 0'
                    }}
                  />
                )}
                <circle
                  r={5}
                  fill={loc.color}
                  stroke="var(--bg)"
                  strokeWidth={1.5}
                  filter="url(#pinGlow)"
                  style={{ cursor: 'pointer' }}
                />
                <text
                  dy={-14}
                  fontSize={7}
                  fill="var(--text-dim)"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing={1.5}
                  textAnchor="middle"
                >
                  {loc.city}
                </text>
                {loc.stressedCount > 0 && (
                  <g transform="translate(0, 18)">
                    <rect x="-6" y="-6" width="12" height="12" fill={`${loc.color}33`} stroke={loc.color} strokeWidth="0.5" />
                    <text
                      dy={2.5}
                      fontSize={7}
                      fill={loc.color}
                      fontFamily="'JetBrains Mono', monospace"
                      textAnchor="middle"
                    >
                      {loc.stressedCount}
                    </text>
                  </g>
                )}
              </Marker>
            ))}
          </ComposableMap>
        </div>

        {/* Location detail panel */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          padding: '16px',
          zIndex: 10,
          transform: selectedLoc ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedLoc ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent)', letterSpacing: '0.1em' }}>
                    ◈ {selectedLoc.city}
                  </div>
                  <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {selectedLoc.label}
                  </div>
                </div>
                <div
                  onClick={() => setSelectedLoc(null)}
                  style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  [ × ]
                </div>
              </div>

              <div style={{ width: '100%', height: '1px', background: 'var(--border-dim)', margin: '16px 0' }}></div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedLoc.locIndicators.length === 0 ? (
                  <div style={{ fontSize: '9px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '20px' }}>
                    NO SIGNAL DATA
                  </div>
                ) : (
                  selectedLoc.locIndicators.map((ind, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-dim)',
                      color: ind.is_stressed ? 'var(--text-bright)' : 'var(--text-dim)',
                      textShadow: ind.is_stressed ? `0 0 6px ${ind.color}` : 'none'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '8px', textTransform: 'uppercase' }}>{ind.key.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: ind.color }}>
                          {ind.value !== null && ind.value !== undefined ? Number(ind.value).toFixed(2) : '——'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '2px', background: 'var(--border)' }}>
                        <div style={{ width: `${Math.min(100, ind.stress_contribution || 0)}%`, height: '100%', background: ind.color, boxShadow: ind.is_stressed ? `0 0 4px ${ind.color}` : 'none' }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0 }}>
              {/* Invisible content when panel is hidden but preserves DOM structure for smooth transitions */}
            </div>
          )}
        </div>

        {/* Default empty instruction when no selection - placed outside the sliding panel */}
        {!selectedLoc && (
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '9px',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-dim)',
            textAlign: 'center',
            zIndex: 4,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
            <div>SELECT NODE TO INSPECT</div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div style={{
        width: '100%',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '9px',
        fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--text-dim)',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          MONITORING {totalIndicators} SIGNALS ACROSS {LOCATIONS.length} NODES
        </div>
        <div style={{
          color: totalStressed > 0 ? 'var(--orange)' : 'var(--green)',
          textShadow: totalStressed > 0 ? '0 0 6px var(--orange)' : 'none'
        }}>
          {totalStressed} SIGNALS ELEVATED
        </div>
        <div>
          LAST SWEEP {formatTime(now)}
        </div>
      </div>
    </div>
  );
}
