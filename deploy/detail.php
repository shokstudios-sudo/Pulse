<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Monitor Detail — Pulse</title>
<style>
  :root {
    --bg: #0a0e1a;
    --surface: #111827;
    --border: #1e293b;
    --text: #e2e8f0;
    --muted: #64748b;
    --up: #22c55e;
    --down: #ef4444;
    --slow: #f59e0b;
    --primary: #3b82f6;
    --mono: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:var(--mono); font-size:13px; }
  a { color:var(--primary); text-decoration:none; }
  a:hover { text-decoration:underline; }

  .container { max-width:900px; margin:0 auto; padding:32px 24px; }
  .back { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); margin-bottom:24px; transition:color .15s; }
  .back:hover { color:var(--text); text-decoration:none; }

  .detail-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; }
  .detail-header h1 { font-size:20px; font-weight:600; letter-spacing:-0.5px; }
  .detail-header .url { font-size:11px; color:var(--muted); margin-top:4px; word-break:break-all; }

  .led { width:12px; height:12px; border-radius:50%; display:inline-block; margin-right:8px; vertical-align:middle; }
  .led-up { background:var(--up); box-shadow:0 0 8px var(--up); }
  .led-down { background:var(--down); box-shadow:0 0 8px var(--down); animation:pulse-led 1.5s infinite; }
  .led-slow { background:var(--slow); box-shadow:0 0 8px var(--slow); }
  @keyframes pulse-led { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .badge { font-size:11px; padding:3px 8px; border-radius:6px; font-weight:500; }
  .badge-up { background:rgba(34,197,94,0.1); color:var(--up); }
  .badge-down { background:rgba(239,68,68,0.1); color:var(--down); }
  .badge-slow { background:rgba(245,158,11,0.1); color:var(--slow); }

  .stat-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; margin-bottom:28px; }
  .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:16px; }
  .stat-card label { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.4px; display:block; margin-bottom:4px; }
  .stat-card span { font-size:18px; font-weight:600; font-variant-numeric:tabular-nums; }

  .uptime-bar { display:flex; gap:2px; height:22px; margin-bottom:28px; }
  .uptime-bar .bar { flex:1; border-radius:3px; min-width:3px; }
  .bar-up { background:var(--up); }
  .bar-down { background:var(--down); }
  .bar-slow { background:var(--slow); }
  .bar-empty { background:var(--border); }

  .tabs { display:flex; gap:2px; margin-bottom:16px; background:rgba(30,41,59,0.5); border-radius:8px; padding:3px; width:fit-content; }
  .tab { padding:6px 16px; font-size:12px; border-radius:6px; cursor:pointer; border:none; background:transparent; color:var(--muted); font-family:var(--mono); transition:all .15s; }
  .tab:hover { color:var(--text); }
  .tab.active { background:var(--surface); color:var(--text); }

  .panel { display:none; }
  .panel.active { display:block; }

  .card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:20px; }

  /* Chart */
  .chart-container { height:260px; position:relative; }
  .chart-container svg { width:100%; height:100%; }

  /* Table */
  table { width:100%; border-collapse:collapse; }
  th { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.4px; text-align:left; padding:8px 12px; border-bottom:1px solid var(--border); }
  td { padding:8px 12px; border-bottom:1px solid rgba(30,41,59,0.3); font-size:12px; }
  tr:hover { background:rgba(30,41,59,0.3); }

  /* Incident */
  .incident { display:flex; gap:12px; padding:12px; border-radius:8px; background:rgba(30,41,59,0.3); border:1px solid rgba(30,41,59,0.3); margin-bottom:8px; }
  .incident-dot { width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }

  .loading { text-align:center; padding:40px; color:var(--muted); }

  @media (max-width:640px) { .container { padding:16px; } .stat-cards { grid-template-columns:1fr 1fr; } }
</style>
</head>
<body>

<?php
require_once __DIR__ . '/config.php';
$db = getDB();
$id = $_GET['id'] ?? '';
if (!$id) { echo '<div class="container"><p>No monitor ID provided. <a href="index.html">← Back</a></p></div>'; exit; }
$stmt = $db->prepare("SELECT * FROM monitors WHERE id = ?");
$stmt->execute([$id]);
$monitor = $stmt->fetch();
if (!$monitor) { echo '<div class="container"><p>Monitor not found. <a href="index.html">← Back</a></p></div>'; exit; }
?>

<div class="container">
  <a href="index.html" class="back">← Back to dashboard</a>

  <div class="detail-header">
    <div>
      <h1><span class="led led-<?= htmlspecialchars($monitor['status']) ?>"></span><?= htmlspecialchars($monitor['name']) ?></h1>
      <p class="url"><a href="<?= htmlspecialchars($monitor['url']) ?>" target="_blank"><?= htmlspecialchars($monitor['url']) ?> ↗</a></p>
    </div>
    <span class="badge badge-<?= $monitor['status'] ?>">
      <?= $monitor['status'] === 'up' ? 'Operational' : ($monitor['status'] === 'down' ? 'Down' : 'Degraded') ?>
    </span>
  </div>

  <div class="stat-cards" id="statCards"></div>

  <div id="uptimeBar" class="uptime-bar"></div>

  <div class="tabs">
    <button class="tab active" onclick="switchTab('chart',this)">Response Time</button>
    <button class="tab" onclick="switchTab('history',this)">Check History</button>
    <button class="tab" onclick="switchTab('incidents',this)">Incidents</button>
  </div>

  <div id="panel-chart" class="panel active"><div class="card"><div class="loading">Loading chart...</div></div></div>
  <div id="panel-history" class="panel"><div class="card"><div class="loading">Loading...</div></div></div>
  <div id="panel-incidents" class="panel"><div class="card"><div class="loading">Loading...</div></div></div>
</div>

<script>
const MONITOR_ID = '<?= addslashes($id) ?>';
const API = 'api';
let checks = [];

function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

async function loadData() {
  try {
    const [checksRes, statsRes] = await Promise.all([
      fetch(`${API}/checks.php?monitor_id=${MONITOR_ID}&limit=500`),
      fetch(`${API}/monitors.php`)
    ]);
    checks = await checksRes.json();
    const monitors = await statsRes.json();
    const mon = monitors.find(m => m.id === MONITOR_ID);
    if (mon) renderStats(mon);
    renderUptimeBar(mon ? mon.uptimeHistory : []);
    renderChart();
    renderHistory();
    renderIncidents();
  } catch(e) {
    console.error(e);
  }
}

function renderStats(m) {
  const active = checks.filter(c => c.status !== 'down');
  const avg = active.length ? Math.round(active.reduce((a,c) => a + c.latency, 0) / active.length) : 0;
  const incidents = countIncidents();
  document.getElementById('statCards').innerHTML = `
    <div class="stat-card"><label>Current Latency</label><span>${m.status === 'down' ? '—' : m.latency + 'ms'}</span></div>
    <div class="stat-card"><label>Avg Latency</label><span>${avg}ms</span></div>
    <div class="stat-card"><label>Uptime</label><span>${Number(m.uptime).toFixed(2)}%</span></div>
    <div class="stat-card"><label>Incidents</label><span>${incidents}</span></div>
  `;
}

function renderUptimeBar(history) {
  const el = document.getElementById('uptimeBar');
  const h = history && history.length ? history.slice(-60) : [];
  const total = 60;
  let bars = '';
  for (let i = 0; i < total; i++) {
    bars += `<div class="bar ${h[i] ? 'bar-' + h[i] : 'bar-empty'}"></div>`;
  }
  el.innerHTML = bars;
}

function renderChart() {
  const panel = document.getElementById('panel-chart');
  const data = checks.slice(-100);
  if (!data.length) { panel.innerHTML = '<div class="card"><p style="text-align:center;color:var(--muted);padding:40px;">No data yet</p></div>'; return; }

  const maxLat = Math.max(...data.map(c => c.latency), 1);
  const w = 800, h = 240, pad = 40;
  const plotW = w - pad * 2, plotH = h - pad * 2;

  let path = '';
  data.forEach((c, i) => {
    const x = pad + (i / (data.length - 1)) * plotW;
    const y = pad + plotH - (c.latency / maxLat) * plotH;
    path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  });

  // Y-axis labels
  const yLabels = [0, Math.round(maxLat/2), maxLat].map(v => {
    const y = pad + plotH - (v / maxLat) * plotH;
    return `<text x="${pad-8}" y="${y+4}" text-anchor="end" fill="var(--muted)" font-size="10">${v}ms</text><line x1="${pad}" x2="${w-pad}" y1="${y}" y2="${y}" stroke="var(--border)" stroke-dasharray="3,3"/>`;
  }).join('');

  panel.innerHTML = `<div class="card"><div class="chart-container">
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      ${yLabels}
      <path d="${path}" fill="none" stroke="var(--up)" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  </div></div>`;
}

function renderHistory() {
  const panel = document.getElementById('panel-history');
  if (!checks.length) { panel.innerHTML = '<div class="card"><p style="text-align:center;color:var(--muted);padding:40px;">No checks recorded</p></div>'; return; }
  const rows = [...checks].reverse().slice(0, 100).map(c => `
    <tr>
      <td style="color:var(--muted)">${fmtDate(c.timestamp)}</td>
      <td><span style="color:var(--${c.status})">${c.status === 'up' ? 'Operational' : c.status === 'down' ? 'Down' : 'Degraded'}</span></td>
      <td style="text-align:right">${c.status === 'down' ? '—' : c.latency + 'ms'}</td>
    </tr>
  `).join('');
  panel.innerHTML = `<div class="card" style="padding:0;overflow:hidden;"><table><thead><tr><th>Time</th><th>Status</th><th style="text-align:right">Latency</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderIncidents() {
  const panel = document.getElementById('panel-incidents');
  const incidents = deriveIncidents();
  if (!incidents.length) { panel.innerHTML = '<div class="card"><p style="text-align:center;color:var(--muted);padding:40px;">No incidents recorded 🎉</p></div>'; return; }
  const html = incidents.slice(0, 50).map(inc => `
    <div class="incident">
      <div class="incident-dot" style="background:var(--${inc.type})"></div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between">
          <span style="font-size:12px;font-weight:500;color:var(--${inc.type})">${inc.type === 'down' ? 'Outage' : 'Degraded Performance'}</span>
          <span style="font-size:11px;color:var(--muted)">${fmtDuration(inc.duration)}</span>
        </div>
        <p style="font-size:11px;color:var(--muted);margin-top:2px">${fmtDate(inc.start)}${inc.end ? ' → ' + fmtDate(inc.end) : ' → Ongoing'}</p>
      </div>
    </div>
  `).join('');
  panel.innerHTML = `<div class="card">${html}</div>`;
}

function deriveIncidents() {
  const incidents = [];
  let cur = null;
  for (const c of checks) {
    if (c.status === 'down' || c.status === 'slow') {
      if (!cur) cur = { type: c.status, start: c.timestamp, duration: 0 };
    } else if (cur) {
      cur.end = c.timestamp;
      cur.duration = cur.end - cur.start;
      incidents.push(cur);
      cur = null;
    }
  }
  if (cur) { cur.duration = Date.now() - cur.start; incidents.push(cur); }
  return incidents.reverse();
}

function countIncidents() { return deriveIncidents().length; }

function fmtDate(ts) {
  return new Date(ts).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function fmtDuration(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ' + (s % 60) + 's';
  return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
}

loadData();
setInterval(loadData, 15000);
</script>
</body>
</html>
