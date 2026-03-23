# Pulse Monitor — Self-Hosted Uptime Dashboard

Zero-dependency uptime monitoring. **No npm, no Node.js, no build step.**  
Just PHP + MySQL — upload and go.

---

## Requirements

- PHP 7.4+ with `pdo_mysql` and `curl` extensions
- MySQL 5.7+ or MariaDB 10.3+
- Apache with `mod_rewrite` (or Nginx equivalent)
- Cron access

---

## Quick Start

### 1. Import the Database

```bash
mysql -u root -p < schema.sql
```

This creates the `pulse_monitor` database with `monitors` and `checks` tables.

### 2. Edit Config

Open `config.php` and set your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'pulse_monitor');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
```

### 3. Upload

Upload the entire `deploy/` folder to your web server's document root.

### 4. Setup Cron

Add a cron job to ping your monitors every minute:

```bash
* * * * * php /var/www/html/deploy/cron.php >> /var/log/pulse.log 2>&1
```

Adjust the path to match your server. The script respects each monitor's individual check interval and skips monitors checked too recently.

### 5. Visit

Open `https://your-domain.com/deploy/` in your browser. Done!

---

## File Structure

```
deploy/
├── config.php          ← Edit this (DB credentials + settings)
├── schema.sql          ← Import into MySQL once
├── index.html          ← Dashboard (vanilla HTML/CSS/JS)
├── detail.php          ← Monitor detail page (PHP + JS)
├── style.css           ← Shared dashboard styles
├── detail.css          ← Detail page styles
├── cron.php            ← Server-side pinger (cron job)
├── .htaccess           ← Protects config/cron from web access
├── README.md           ← This file
└── api/
    ├── monitors.php    ← GET / POST / DELETE monitors
    └── checks.php      ← GET check history for a monitor
```

---

## API Reference

All endpoints return JSON.

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `GET` | `api/monitors.php` | — | List all monitors with recent history |
| `POST` | `api/monitors.php` | `{ name, url, checkInterval }` | Create a new monitor |
| `DELETE` | `api/monitors.php?id=xxx` | — | Delete monitor + all check history |
| `GET` | `api/checks.php?monitor_id=xxx` | — | Get check history for a monitor |

### Example: Create a Monitor

```bash
curl -X POST https://your-domain.com/deploy/api/monitors.php \
  -H "Content-Type: application/json" \
  -d '{"name": "My API", "url": "https://api.example.com", "checkInterval": 60}'
```

### Example: List All Monitors

```bash
curl https://your-domain.com/deploy/api/monitors.php
```

---

## Configuration Options

| Constant | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_NAME` | `pulse_monitor` | Database name |
| `DB_USER` | `root` | Database user |
| `DB_PASS` | _(empty)_ | Database password |
| `SLOW_THRESHOLD` | `500` | Latency (ms) above which status = "slow" |
| `PING_TIMEOUT` | `10` | Curl timeout (seconds) per check |

---

## How It Works

1. **Dashboard** (`index.html`) — Vanilla JS fetches monitors from the PHP API and renders cards with status LEDs, uptime bars, and latency sparklines. Auto-refreshes every 10 seconds.

2. **Detail Page** (`detail.php`) — Click "View" on any monitor to see a full history with response time chart, uptime timeline, and incident log.

3. **Cron Pinger** (`cron.php`) — Runs server-side via cron. For each monitor, performs a `curl` HEAD request, records status + latency in `checks`, and updates the monitor's current state and uptime percentage.

---

## Nginx Users

If using Nginx instead of Apache, add this to your server block to protect sensitive files:

```nginx
location ~ (config\.php|cron\.php|schema\.sql) {
    deny all;
    return 404;
}
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Failed to connect to backend" | Check `config.php` DB credentials and that MySQL is running |
| Monitors never update | Verify cron is running: `crontab -l` and check `/var/log/pulse.log` |
| 403 on API calls | Ensure Apache `mod_rewrite` is enabled and `.htaccess` is allowed |
| All monitors show "down" | Check that `php-curl` extension is installed: `php -m \| grep curl` |

---

## License

MIT
