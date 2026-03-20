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

$limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 1000) : 500;

$stmt = $db->prepare("SELECT id, monitor_id AS monitorId, timestamp, status, latency FROM checks WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT ?");
$stmt->execute([$monitorId, $limit]);
$checks = $stmt->fetchAll();

// Return in chronological order
$checks = array_reverse($checks);

// Cast numeric fields
foreach ($checks as &$check) {
    $check['timestamp'] = (int)$check['timestamp'];
    $check['latency'] = (int)$check['latency'];
}
unset($check);

jsonResponse($checks);
