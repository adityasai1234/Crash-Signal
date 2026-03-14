import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLive, fetchHistory, getStressColor, getStressLevel } from '../api/client';
import Header from '../components/Header';
import StressVelocity from '../components/StressVelocity';

export default function VelocityPage() {
  const [live, setLive] = useState(null);
  const [hist, setHist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchLive(), fetchHistory()])
      .then(([l, h]) => {
        setLive(l);
        setHist(h);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const score = live?.stress?.score ?? 0;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'JetBrains Mono'", color: 'var(--text-dim)', letterSpacing: '0.2em' }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        lastUpdated={live?.last_updated}
        stressScore={score}
      />
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/" style={{
            color: 'var(--text-dim)',
            textDecoration: 'none',
            fontSize: '9px',
            letterSpacing: '0.1em',
            fontFamily: "'JetBrains Mono'",
            border: '1px solid var(--border)',
            padding: '4px 8px'
          }}>[ BACK TO DASH ]</Link>
        </div>
        <StressVelocity
          currentScore={score}
          histPoints={hist?.points ?? []}
        />
      </div>
    </div>
  );
}
