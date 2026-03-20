#!/usr/bin/env php
<?php
/**
 * Server-side monitor pinger — run via cron:
 *   * * * * * php /path/to/deploy/cron.php >> /var/log/pulse.log 2>&1
 */

require_once __DIR__ . '/config.php';

$db  = getDB();
$now = time();

$monitors = $db->query("SELECT id, url, check_interval, last_checked FROM monitors")->fetchAll();

foreach ($monitors as $m) {
    if ($m['last_checked']) {
        $elapsed = $now - strtotime($m['last_checked']);
        if ($elapsed < (int)$m['check_interval']) continue;
    }

    $start = microtime(true);
    $ch = curl_init($m['url']);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_NOBODY         => true,
        CURLOPT_TIMEOUT        => PING_TIMEOUT,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_USERAGENT      => 'PulseMonitor/1.0',
    ]);
    curl_exec($ch);
    $code  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err   = curl_error($ch);
    curl_close($ch);

    $latency = round((microtime(true) - $start) * 1000);

    if ($err || $code === 0)       { $status = 'down'; $latency = 0; }
    elseif ($code >= 400)          { $status = 'down'; }
    elseif ($latency > SLOW_THRESHOLD) { $status = 'slow'; }
    else                           { $status = 'up'; }

    $cid = time() . '-' . bin2hex(random_bytes(4));
    $db->prepare("INSERT INTO checks (id,monitor_id,timestamp,status,latency) VALUES(?,?,?,?,?)")
       ->execute([$cid, $m['id'], $now * 1000, $status, $latency]);

    $db->prepare("UPDATE monitors SET status=?, latency=?, last_checked=NOW() WHERE id=?")
       ->execute([$status, $latency, $m['id']]);

    // Recompute uptime
    $s = $db->prepare("SELECT COUNT(*) t, SUM(status!='down') u FROM checks WHERE monitor_id=?");
    $s->execute([$m['id']]);
    $st = $s->fetch();
    $up = $st['t'] > 0 ? round(($st['u'] / $st['t']) * 100, 2) : 100;
    $db->prepare("UPDATE monitors SET uptime=? WHERE id=?")->execute([$up, $m['id']]);

    echo date('Y-m-d H:i:s') . " {$m['id']} → $status ({$latency}ms)\n";
}
