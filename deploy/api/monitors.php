<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = $db->query("SELECT * FROM monitors ORDER BY created_at DESC")->fetchAll();
    $monitors = [];
    foreach ($rows as $r) {
        // latency history (last 30)
        $stmt = $db->prepare("SELECT latency FROM checks WHERE monitor_id=? ORDER BY timestamp DESC LIMIT 30");
        $stmt->execute([$r['id']]);
        $latHist = array_reverse(array_column($stmt->fetchAll(), 'latency'));

        // uptime history (last 60)
        $stmt = $db->prepare("SELECT status FROM checks WHERE monitor_id=? ORDER BY timestamp DESC LIMIT 60");
        $stmt->execute([$r['id']]);
        $upHist = array_reverse(array_column($stmt->fetchAll(), 'status'));

        $monitors[] = [
            'id'             => $r['id'],
            'name'           => $r['name'],
            'url'            => $r['url'],
            'status'         => $r['status'],
            'latency'        => (int)$r['latency'],
            'uptime'         => (float)$r['uptime'],
            'lastChecked'    => $r['last_checked'],
            'checkInterval'  => (int)$r['check_interval'],
            'location'       => $r['location'],
            'latencyHistory' => array_map('intval', $latHist),
            'uptimeHistory'  => $upHist,
        ];
    }
    jsonResponse($monitors);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['name']) || empty($input['url'])) {
        jsonResponse(['error' => 'Name and URL required'], 400);
    }
    $id = 'mon_' . time() . '_' . bin2hex(random_bytes(4));
    $stmt = $db->prepare("INSERT INTO monitors (id, name, url, check_interval) VALUES (?,?,?,?)");
    $stmt->execute([$id, $input['name'], $input['url'], (int)($input['checkInterval'] ?? 60)]);
    jsonResponse(['success' => true, 'id' => $id], 201);

} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $db->prepare("DELETE FROM monitors WHERE id=?")->execute([$id]);
    jsonResponse(['success' => true]);

} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
