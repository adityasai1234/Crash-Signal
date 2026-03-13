import { useState, useEffect } from 'react';
import { fetchLive, fetchHistory, triggerRefresh, getStressColor, getStressLevel } from '../api/client';

import Header from '../components/Header';
import LiveTicker from '../components/LiveTicker';
import StressMeter from '../components/StressMeter';
import IndicatorPanel from '../components/IndicatorPanel';
import ThreatMap from '../components/ThreatMap';
import StressTimeline from '../components/StressTimeline';
import NewsPanel from '../components/NewsPanel';
import AnalogPanel from '../components/AnalogPanel';

const BOOT_MSGS = [
  'CONNECTING TO FRED API...',
  'AUTHENTICATING DATA FEEDS...',
  'LOADING MARKET INDICATORS...',
  'CALIBRATING STRESS MODEL...',
  'INITIALIZING THREAT ASSESSMENT...',
  'SYSTEM READY'
];

export default function Dashboard() {
  const [live, setLive] = useState(null);
  const [hist, setHist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [bootMsg, setBootMsg] = useState(0);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setBootMsg(m => (m + 1) % BOOT_MSGS.length);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    Promise.all([fetchLive(), fetchHistory()])
      .then(([l, h]) => {
        setLive(l);
        setHist(h);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });

    const iv = setInterval(() => {
      fetchLive().then(setLive).catch(console.error);
    }, 60000);

    return () => clearInterval(iv);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
      const l = await fetchLive();
      setLive(l);
    } catch (e) {
      console.error(e);
    }
    setRefreshing(false);
  };

  const score = live?.stress?.score ?? 0;
  const color = getStressColor(score);
  const level = getStressLevel(score);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px'
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '18px',
          color: 'var(--accent)',
          letterSpacing: '0.3em',
          textShadow: '0 0 10px var(--accent)'
        }}>
          CRASHSIGNAL
        </div>
        <div style={{
          fontSize: '9px',
          color: 'var(--text-dim)',
          letterSpacing: '0.2em'
        }}>
          MARKET STRESS INTELLIGENCE SYSTEM
        </div>
        <div style={{
          width: '200px',
          height: '1px',
          background: 'var(--border)',
          margin: '8px 0'
        }} />
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          color: 'var(--text-dim)',
          letterSpacing: '0.15em',
          minHeight: '14px'
        }}>
          {BOOT_MSGS[bootMsg]}<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
        <div style={{
          width: '24px',
          height: '24px',
          border: '1px solid var(--border)',
          borderTop: '1px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        gap: '16px'
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: 'var(--red)',
          letterSpacing: '0.2em',
          textShadow: '0 0 8px var(--red)'
        }}>
          CONNECTION FAILED
        </div>
        <div style={{
          fontSize: '9px',
          color: 'var(--text-dim)',
          letterSpacing: '0.1em'
        }}>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-dim)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            padding: '6px 16px',
            cursor: 'pointer',
            letterSpacing: '0.1em'
          }}
        >
          [ RETRY ]
        </button>
        <div style={{
          fontSize: '8px',
          color: 'var(--text-dim)',
          opacity: 0.5
        }}>
          ENSURE BACKEND RUNNING ON :8000
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        lastUpdated={live?.last_updated}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        stressScore={score}
      />

      <LiveTicker indicators={live?.indicators ?? []} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '38% 62%',
        gap: '1px',
        background: 'var(--bg)'
      }}>
        <StressMeter
          score={score}
          level={level}
          color={color}
          lastUpdated={live?.last_updated}
        />
        <IndicatorPanel indicators={live?.indicators ?? []} />
      </div>

      <div style={{ margin: '1px 0' }}>
        <ThreatMap indicators={live?.indicators ?? []} />
      </div>

      <div style={{ margin: '1px 0' }}>
        <StressTimeline
          points={hist?.points ?? []}
          crisisPeriods={hist?.crisis_periods ?? []}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
        gap: '1px',
        background: 'var(--bg)'
      }}>
        <NewsPanel
          newsStress={live?.news_stress ?? 50}
          items={live?.news_items ?? []}
        />
        <AnalogPanel analogs={live?.analogs ?? []} />
      </div>
    </div>
  );
}
