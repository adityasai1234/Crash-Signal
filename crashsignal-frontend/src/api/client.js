const BASE = process.env.REACT_APP_API_URL
             || "http://localhost:8000"

export async function fetchLive() {
  const r = await fetch(`${BASE}/live`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export async function fetchHistory() {
  const r = await fetch(`${BASE}/history`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export async function fetchHealth() {
  const r = await fetch(`${BASE}/health`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export async function triggerRefresh() {
  const r = await fetch(`${BASE}/refresh`,
                        { method: "POST" })
  return r.json()
}

export function getStressColor(score) {
  if (score <= 25) return "#00ff9d"
  if (score <= 50) return "#00a8ff"
  if (score <= 75) return "#ffc400"
  if (score <= 90) return "#ff6b00"
  return "#ff0040"
}

export function getStressLevel(score) {
  if (score <= 25) return "NOMINAL"
  if (score <= 50) return "ELEVATED"
  if (score <= 75) return "GUARDED"
  if (score <= 90) return "HIGH"
  return "CRITICAL"
}

export function getStressVerdict(score) {
  if (score <= 40)
    return "MARKETS STABLE — NO ACTION REQUIRED"
  if (score <= 65)
    return "ELEVATED RISK — MONITOR CONDITIONS"
  if (score <= 80)
    return "HIGH STRESS — DEFENSIVE POSTURE ADVISED"
  return "CRITICAL ALERT — EXTREME CRASH RISK"
}

export function formatTime(iso) {
  if (!iso) return "--:--"
  return new Date(iso).toLocaleTimeString([],
    { hour: "2-digit", minute: "2-digit",
      second: "2-digit", hour12: false })
}

export function formatValue(val) {
  if (val === null || val === undefined) return "——"
  const abs = Math.abs(val)
  if (abs > 100000) return val.toLocaleString()
  if (abs > 1000)   return val.toLocaleString()
  if (abs > 10)     return val.toFixed(2)
  if (abs > 1)      return val.toFixed(3)
  return val.toFixed(4)
}
