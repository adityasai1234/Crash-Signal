import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceArea, Tooltip
} from 'recharts';
import { getStressColor } from '../api/client';

export default function StressTimeline({ points = [], crisisPeriods = [] }) {
  const [range, setRange] = useState('ALL');

  let filteredPoints = points;
  if (points.length > 0) {
    const latestDate = new Date(points[points.length - 1].date);
    if (range !== 'ALL') {
      const years = parseInt(range.replace('Y', ''));
      const cutoff = new Date(latestDate);
      cutoff.setFullYear(latestDate.getFullYear() - years);
      filteredPoints = points.filter(p => new Date(p.date) >= cutoff);
    }
  }

  const lastPoint = filteredPoints.length > 0 ? filteredPoints[filteredPoints.length - 1] : null;
  const color = lastPoint ? getStressColor(lastPoint.stress_score) : "#00a8ff";

  const renderButtons = () => {
    return ['1Y', '5Y', '10Y', 'ALL'].map(r => {
      const isActive = range === r;
      return (
        <button
          key={r}
          onClick={() => setRange(r)}
          style={{
            background: 'transparent',
            border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
            color: isActive ? 'var(--accent)' : 'var(--text-dim)',
            boxShadow: isActive ? '0 0 8px rgba(0,255,157,0.2)' : 'none',
            fontSize: '9px',
            fontFamily: "'JetBrains Mono', monospace",
            padding: '2px 8px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          [{r}]
        </button>
      );
    });
  };

  return (
    <div className="panel" style={{ width: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="panel-label" style={{ marginBottom: 0 }}>
          HISTORICAL THREAT RECORD  [30Y]
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {renderButtons()}
        </div>
      </div>

      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="#0a1628" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#3a5068", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
              tickFormatter={(val) => {
                if (!val) return '';
                return new Date(val).getFullYear();
              }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#3a5068", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              width={28}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "#040810",
                border: "1px solid #0d1f35",
                borderRadius: 0,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "#c8d8e8"
              }}
              labelStyle={{ color: "#3a5068", fontSize: 9 }}
              formatter={(value) => [`${Number(value).toFixed(1)}`, "STRESS"]}
              labelFormatter={(label) => {
                if (!label) return '';
                return label.split('T')[0];
              }}
              isAnimationActive={false}
            />
            
            {crisisPeriods.map((period, idx) => {
              // Ensure periods are somewhat within range visually
              const severityColor = period.severity === 2 ? "#ff0040" : "#ff6b00";
              const opacity = period.severity === 2 ? 0.08 : 0.05;
              
              return (
                <ReferenceArea
                  key={idx}
                  x1={period.start}
                  x2={period.end}
                  fill={severityColor}
                  fillOpacity={opacity}
                  stroke={severityColor}
                  strokeWidth={0.5}
                  strokeOpacity={0.3}
                />
              );
            })}

            <ReferenceLine
              y={75}
              stroke="#ff6b00"
              strokeDasharray="3 6"
              strokeWidth={1}
              strokeOpacity={0.5}
              label={{ position: 'insideTopLeft', value: "HIGH", fill: "#ff6b00", fontSize: 8, fontFamily: "'JetBrains Mono', monospace" }}
            />
            <ReferenceLine
              y={50}
              stroke="#ffc400"
              strokeDasharray="3 6"
              strokeWidth={1}
              strokeOpacity={0.4}
              label={{ position: 'insideTopLeft', value: "GUARDED", fill: "#ffc400", fontSize: 8, fontFamily: "'JetBrains Mono', monospace" }}
            />
            
            <Area
              type="monotone"
              dataKey="stress_score"
              stroke={color}
              strokeWidth={1.5}
              fill="url(#threatGrad)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: "var(--bg)" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
