import { getStressColor } from '../api/client';

export default function CrashDNA({
  indicators = [],
  analogs = [],
  importance = []
}) {
  return (
    <div className="panel" style={{
      padding: "16px"
    }}>
      <div className="panel-label">
        CRASH DNA — SIGNAL FINGERPRINT
      </div>
      <div style={{
        color: "var(--text-dim)",
        fontSize: "9px",
        letterSpacing: "0.1em"
      }}>
        COMPUTING...
      </div>
    </div>
  );
}
