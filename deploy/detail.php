<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Monitor Detail — Pulse</title>
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="detail.css">
</head>
<body>

<?php
require_once __DIR__ . '/config.php';
$db = getDB();
$id = $_GET['id'] ?? '';
if (!$id) { echo '<div class="detail-container"><p>No monitor ID provided. <a href="index.html">← Back</a></p></div>'; exit; }
$stmt = $db->prepare("SELECT * FROM monitors WHERE id = ?");
$stmt->execute([$id]);
$monitor = $stmt->fetch();
if (!$monitor) { echo '<div class="detail-container"><p>Monitor not found. <a href="index.html">← Back</a></p></div>'; exit; }
?>

<div class="detail-container">
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

  <div id="uptimeBar" class="detail-uptime-bar"></div>

  <div class="tabs">
    <button class="tab active" onclick="switchTab('chart',this)">Response Time</button>
    <button class="tab" onclick="switchTab('history',this)">Check History</button>
    <button class="tab" onclick="switchTab('incidents',this)">Incidents</button>
  </div>

  <div id="panel-chart" class="panel active"><div class="detail-card"><div class="loading">Loading chart...</div></div></div>
  <div id="panel-history" class="panel"><div class="detail-card"><div class="loading">Loading...</div></div></div>
  <div id="panel-incidents" class="panel"><div class="detail-card"><div class="loading">Loading...</div></div></div>
</div>

<script>
var MONITOR_ID = '<?= addslashes($id) ?>';
var API = 'api';
var checks = [];

function switchTab(name, btn) {
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.panel');
  for (var i = 0; i < tabs.length; i++) tabs[i].className = 'tab';
  for (var i = 0; i < panels.length; i++) panels[i].className = 'panel';
  btn.className = 'tab active';
  document.getElementById('panel-' + name).className = 'panel active';
}

function loadData() {
  var checksReq = new XMLHttpRequest();
  var monsReq = new XMLHttpRequest();
  var checksLoaded = false, monsLoaded = false, monData = null;

  checksReq.open('GET', API + '/checks.php?monitor_id=' + MONITOR_ID + '&limit=500');
  checksReq.onload = function() {
    if (checksReq.status === 200) {
      checks = JSON.parse(checksReq.responseText);
      checksLoaded = true;
      if (monsLoaded) finishLoad(monData);
    }
  };
  checksReq.send();

  monsReq.open('GET', API + '/monitors.php');
  monsReq.onload = function() {
    if (monsReq.status === 200) {
      var monitors = JSON.parse(monsReq.responseText);
      for (var i = 0; i < monitors.length; i++) {
        if (monitors[i].id === MONITOR_ID) { monData = monitors[i]; break; }
      }
      monsLoaded = true;
      if (checksLoaded) finishLoad(monData);
    }
  };
  monsReq.send();
}

function finishLoad(mon) {
  if (mon) renderStats(mon);
  renderUptimeBar(mon ? mon.uptimeHistory : []);
  renderChart();
  renderHistory();
  renderIncidents();
}

function renderStats(m) {
  var active = [];
  for (var i = 0; i < checks.length; i++) {
    if (checks[i].status !== 'down') active.push(checks[i]);
  }
  var avg = 0;
  if (active.length) {
    var sum = 0;
    for (var i = 0; i < active.length; i++) sum += active[i].latency;
    avg = Math.round(sum / active.length);
  }
  var incidents = countIncidents();
  document.getElementById('statCards').innerHTML =
    '<div class="stat-card"><label>Current Latency</label><span>' + (m.status === 'down' ? '—' : m.latency + 'ms') + '</span></div>' +
    '<div class="stat-card"><label>Avg Latency</label><span>' + avg + 'ms</span></div>' +
    '<div class="stat-card"><label>Uptime</label><span>' + Number(m.uptime).toFixed(2) + '%</span></div>' +
    '<div class="stat-card"><label>Incidents</label><span>' + incidents + '</span></div>';
}

function renderUptimeBar(history) {
  var el = document.getElementById('uptimeBar');
  var h = history && history.length ? history.slice(-60) : [];
  var total = 60;
  var bars = '';
  for (var i = 0; i < total; i++) {
    bars += '<div class="bar ' + (h[i] ? 'bar-' + h[i] : 'bar-empty') + '"></div>';
  }
  el.innerHTML = bars;
}

function renderChart() {
  var panel = document.getElementById('panel-chart');
  var data = checks.slice(-100);
  if (!data.length) { panel.innerHTML = '<div class="detail-card"><p style="text-align:center;color:var(--muted);padding:40px;">No data yet</p></div>'; return; }

  var maxLat = 1;
  for (var i = 0; i < data.length; i++) { if (data[i].latency > maxLat) maxLat = data[i].latency; }
  var w = 800, h = 240, pad = 40;
  var plotW = w - pad * 2, plotH = h - pad * 2;

  var path = '';
  for (var i = 0; i < data.length; i++) {
    var x = pad + (i / (data.length - 1)) * plotW;
    var y = pad + plotH - (data[i].latency / maxLat) * plotH;
    path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  }

  var yVals = [0, Math.round(maxLat/2), maxLat];
  var yLabels = '';
  for (var i = 0; i < yVals.length; i++) {
    var yy = pad + plotH - (yVals[i] / maxLat) * plotH;
    yLabels += '<text x="' + (pad-8) + '" y="' + (yy+4) + '" text-anchor="end" fill="var(--muted)" font-size="10">' + yVals[i] + 'ms</text>';
    yLabels += '<line x1="' + pad + '" x2="' + (w-pad) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--border)" stroke-dasharray="3,3"/>';
  }

  panel.innerHTML = '<div class="detail-card"><div class="chart-container">' +
    '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
    yLabels +
    '<path d="' + path + '" fill="none" stroke="var(--up)" stroke-width="2" stroke-linejoin="round"/>' +
    '</svg></div></div>';
}

function renderHistory() {
  var panel = document.getElementById('panel-history');
  if (!checks.length) { panel.innerHTML = '<div class="detail-card"><p style="text-align:center;color:var(--muted);padding:40px;">No checks recorded</p></div>'; return; }
  var reversed = checks.slice().reverse().slice(0, 100);
  var rows = '';
  for (var i = 0; i < reversed.length; i++) {
    var c = reversed[i];
    var statusText = c.status === 'up' ? 'Operational' : c.status === 'down' ? 'Down' : 'Degraded';
    rows += '<tr>' +
      '<td style="color:var(--muted)">' + fmtDate(c.timestamp) + '</td>' +
      '<td><span style="color:var(--' + c.status + ')">' + statusText + '</span></td>' +
      '<td style="text-align:right">' + (c.status === 'down' ? '—' : c.latency + 'ms') + '</td>' +
      '</tr>';
  }
  panel.innerHTML = '<div class="detail-card" style="padding:0;overflow:hidden;"><table><thead><tr><th>Time</th><th>Status</th><th style="text-align:right">Latency</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function renderIncidents() {
  var panel = document.getElementById('panel-incidents');
  var incidents = deriveIncidents();
  if (!incidents.length) { panel.innerHTML = '<div class="detail-card"><p style="text-align:center;color:var(--muted);padding:40px;">No incidents recorded 🎉</p></div>'; return; }
  var html = '';
  var max = Math.min(incidents.length, 50);
  for (var i = 0; i < max; i++) {
    var inc = incidents[i];
    var title = inc.type === 'down' ? 'Outage' : 'Degraded Performance';
    var timeStr = fmtDate(inc.start) + (inc.end ? ' → ' + fmtDate(inc.end) : ' → Ongoing');
    html += '<div class="incident">' +
      '<div class="incident-dot" style="background:var(--' + inc.type + ')"></div>' +
      '<div style="flex:1">' +
      '<div class="incident-header"><span class="incident-title" style="color:var(--' + inc.type + ')">' + title + '</span>' +
      '<span class="incident-duration">' + fmtDuration(inc.duration) + '</span></div>' +
      '<p class="incident-time">' + timeStr + '</p>' +
      '</div></div>';
  }
  panel.innerHTML = '<div class="detail-card">' + html + '</div>';
}

function deriveIncidents() {
  var incidents = [];
  var cur = null;
  for (var i = 0; i < checks.length; i++) {
    var c = checks[i];
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
  incidents.reverse();
  return incidents;
}

function countIncidents() { return deriveIncidents().length; }

function fmtDate(ts) {
  return new Date(ts).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function fmtDuration(ms) {
  var s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  var m = Math.floor(s / 60);
  if (m < 60) return m + 'm ' + (s % 60) + 's';
  return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
}

loadData();
setInterval(loadData, 15000);
</script>
</body>
</html>
