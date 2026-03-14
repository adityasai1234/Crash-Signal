import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLive, fetchHistory, getStressColor, getStressLevel } from '../api/client';
import Header from '../components/Header';
import CrashDNA from '../components/CrashDNA';

export default function CrashDNAPage() {
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLive()
      .then(setLive)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        stressScore={live?.stress?.score ?? 0}
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
        <CrashDNA
          indicators={live?.indicators ?? []}
          analogs={live?.analogs ?? []}
          importance={live?.variable_importance ?? []}
        />
      </div>
    </div>
  );
}
