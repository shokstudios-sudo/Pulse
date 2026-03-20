<?php
require_once __DIR__ . '/../config.php';

$db = getDB();
$monitorId = $_GET['monitor_id'] ?? '';
if (!$monitorId) jsonResponse(['error' => 'monitor_id required'], 400);

$limit = min((int)($_GET['limit'] ?? 500), 1000);
$stmt = $db->prepare("SELECT id, monitor_id AS monitorId, timestamp, status, latency FROM checks WHERE monitor_id=? ORDER BY timestamp DESC LIMIT ?");
$stmt->execute([$monitorId, $limit]);
$rows = array_reverse($stmt->fetchAll());

foreach ($rows as &$r) {
    $r['timestamp'] = (int)$r['timestamp'];
    $r['latency'] = (int)$r['latency'];
}
jsonResponse($rows);
