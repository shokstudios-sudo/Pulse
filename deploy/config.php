<?php
/**
 * Pulse Monitor — Configuration
 * 
 * Edit the values below to match your MySQL database, then upload
 * the entire deploy/ folder to your web server. That's it.
 */

// ─── Database ───────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'pulse_monitor');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// ─── App Settings ───────────────────────────────────────────────
define('APP_NAME', 'Pulse');
define('APP_VERSION', '1.0');
define('SLOW_THRESHOLD', 500);   // ms — latency above this = "slow"
define('PING_TIMEOUT', 10);       // seconds — curl timeout per check

// ─── Database Connection (don't edit below) ─────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function jsonResponse($data, int $code = 200): void {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($data);
    exit;
}
