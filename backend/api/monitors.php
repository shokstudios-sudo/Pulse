<?php
require_once __DIR__ . '/../config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // List all monitors with computed stats
        $monitors = $db->query("SELECT * FROM monitors ORDER BY created_at DESC")->fetchAll();

        foreach ($monitors as &$monitor) {
            // Compute uptime from checks
            $stmt = $db->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status != 'down' THEN 1 ELSE 0 END) as up_count FROM checks WHERE monitor_id = ?");
            $stmt->execute([$monitor['id']]);
            $stats = $stmt->fetch();
            $monitor['uptime'] = $stats['total'] > 0
                ? round(($stats['up_count'] / $stats['total']) * 100, 2)
                : 100.00;

            // Latency history (last 30)
            $stmt = $db->prepare("SELECT latency FROM checks WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 30");
            $stmt->execute([$monitor['id']]);
            $monitor['latencyHistory'] = array_reverse(array_column($stmt->fetchAll(), 'latency'));

            // Uptime history (last 60)
            $stmt = $db->prepare("SELECT status FROM checks WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 60");
            $stmt->execute([$monitor['id']]);
            $monitor['uptimeHistory'] = array_reverse(array_column($stmt->fetchAll(), 'status'));

            // Format last_checked as ISO string
            $monitor['lastChecked'] = $monitor['last_checked'];
            $monitor['checkInterval'] = (int)$monitor['check_interval'];
            $monitor['latency'] = (int)$monitor['latency'];
            unset($monitor['last_checked'], $monitor['check_interval']);
        }
        unset($monitor);

        jsonResponse($monitors);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['name']) || empty($input['url'])) {
            jsonError('Name and URL are required');
        }

        $id = 'mon_' . time() . '_' . bin2hex(random_bytes(4));
        $name = $input['name'];
        $url = $input['url'];
        $interval = isset($input['checkInterval']) ? (int)$input['checkInterval'] : 60;

        $stmt = $db->prepare("INSERT INTO monitors (id, name, url, check_interval) VALUES (?, ?, ?, ?)");
        $stmt->execute([$id, $name, $url, $interval]);

        jsonResponse([
            'id' => $id,
            'name' => $name,
            'url' => $url,
            'status' => 'up',
            'latency' => 0,
            'uptime' => 100,
            'latencyHistory' => [],
            'uptimeHistory' => [],
            'lastChecked' => null,
            'checkInterval' => $interval,
            'location' => 'Local',
        ], 201);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            jsonError('Monitor ID is required');
        }

        $stmt = $db->prepare("DELETE FROM monitors WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}
