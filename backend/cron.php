<?php
/**
 * Cron job for server-side monitor pinging.
 * 
 * Add to crontab:
 *   * * * * * php /path/to/backend/cron.php
 * 
 * This runs every minute and checks monitors whose check_interval has elapsed.
 */

require_once __DIR__ . '/config.php';

// Suppress CORS headers in CLI mode
if (php_sapi_name() === 'cli') {
    // Remove headers set by config.php
}

$db = getDB();
$now = time();

$monitors = $db->query("SELECT id, url, check_interval, last_checked FROM monitors")->fetchAll();

foreach ($monitors as $monitor) {
    // Skip if not enough time has passed since last check
    if ($monitor['last_checked']) {
        $lastChecked = strtotime($monitor['last_checked']);
        if (($now - $lastChecked) < $monitor['check_interval']) {
            continue;
        }
    }

    $status = 'up';
    $latency = 0;
    $start = microtime(true);

    $ch = curl_init($monitor['url']);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_NOBODY => true,           // HEAD request
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT => 'PulseMonitor/1.0',
    ]);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    $latency = round((microtime(true) - $start) * 1000); // ms

    if ($error || $httpCode === 0) {
        $status = 'down';
        $latency = 0;
    } elseif ($httpCode >= 400) {
        $status = 'down';
    } elseif ($latency > 500) {
        $status = 'slow';
    }

    // Insert check record
    $checkId = time() . '-' . bin2hex(random_bytes(4));
    $stmt = $db->prepare("INSERT INTO checks (id, monitor_id, timestamp, status, latency) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$checkId, $monitor['id'], $now * 1000, $status, $latency]);

    // Update monitor status
    $stmt = $db->prepare("UPDATE monitors SET status = ?, latency = ?, last_checked = NOW() WHERE id = ?");
    $stmt->execute([$status, $latency, $monitor['id']]);

    // Recompute uptime
    $stmt = $db->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status != 'down' THEN 1 ELSE 0 END) as up_count FROM checks WHERE monitor_id = ?");
    $stmt->execute([$monitor['id']]);
    $stats = $stmt->fetch();
    $uptime = $stats['total'] > 0 ? round(($stats['up_count'] / $stats['total']) * 100, 2) : 100.00;

    $stmt = $db->prepare("UPDATE monitors SET uptime = ? WHERE id = ?");
    $stmt->execute([$uptime, $monitor['id']]);

    echo "[" . date('Y-m-d H:i:s') . "] {$monitor['id']} → {$status} ({$latency}ms)\n";
}

echo "Done. Checked " . count($monitors) . " monitors.\n";
