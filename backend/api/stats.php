<?php
require_once __DIR__ . '/../config.php';

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$monitorId = $_GET['monitor_id'] ?? null;
if (!$monitorId) {
    jsonError('monitor_id is required');
}

// Overall stats
$stmt = $db->prepare("
    SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN status != 'down' THEN 1 ELSE 0 END) as up_checks,
        AVG(CASE WHEN status != 'down' THEN latency ELSE NULL END) as avg_latency,
        MAX(CASE WHEN status != 'down' THEN latency ELSE NULL END) as max_latency,
        MIN(CASE WHEN status != 'down' THEN latency ELSE NULL END) as min_latency
    FROM checks WHERE monitor_id = ?
");
$stmt->execute([$monitorId]);
$stats = $stmt->fetch();

// Incident count (transitions to down or slow)
$stmt = $db->prepare("
    SELECT COUNT(*) as incident_count FROM (
        SELECT status, LAG(status) OVER (ORDER BY timestamp) as prev_status
        FROM checks WHERE monitor_id = ?
    ) t WHERE status IN ('down', 'slow') AND (prev_status = 'up' OR prev_status IS NULL)
");
$stmt->execute([$monitorId]);
$incidentRow = $stmt->fetch();

$uptime = $stats['total_checks'] > 0
    ? round(($stats['up_checks'] / $stats['total_checks']) * 100, 2)
    : 100.00;

jsonResponse([
    'totalChecks' => (int)$stats['total_checks'],
    'uptime' => $uptime,
    'avgLatency' => round((float)($stats['avg_latency'] ?? 0)),
    'maxLatency' => (int)($stats['max_latency'] ?? 0),
    'minLatency' => (int)($stats['min_latency'] ?? 0),
    'incidentCount' => (int)$incidentRow['incident_count'],
]);
