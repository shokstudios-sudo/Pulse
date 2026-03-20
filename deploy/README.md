# Pulse Monitor — Deployment Guide

A self-hosted uptime monitoring dashboard. **No build tools, no npm, no Node.js.**
Just PHP + MySQL — upload and go.

## Quick Start (3 steps)

### 1. Import Database
```bash
mysql -u root -p < deploy/schema.sql
```

### 2. Edit Config
Open `deploy/config.php` and set your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'pulse_monitor');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
```

### 3. Upload & Setup Cron
Upload the entire `deploy/` folder to your web server, then add:
```bash
* * * * * php /var/www/html/deploy/cron.php >> /var/log/pulse.log 2>&1
```

That's it. Visit `https://your-domain.com/deploy/` in your browser.

---

## File Structure

```
deploy/
├── config.php       ← Edit this (DB credentials)
├── schema.sql       ← Import into MySQL once
├── index.html       ← Dashboard (static HTML + JS)
├── detail.php       ← Monitor detail page (PHP)
├── cron.php         ← Server-side pinger (cron job)
├── .htaccess        ← Protects config/cron from web access
└── api/
    ├── monitors.php ← GET/POST/DELETE monitors
    └── checks.php   ← GET check history
```

## Requirements
- PHP 7.4+ with PDO and cURL
- MySQL 5.7+ or MariaDB 10.3+
- Apache with mod_rewrite (or Nginx equivalent)
- Cron access

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `api/monitors.php` | List all monitors |
| POST | `api/monitors.php` | Create monitor `{name, url, checkInterval}` |
| DELETE | `api/monitors.php?id=xxx` | Delete monitor |
| GET | `api/checks.php?monitor_id=xxx` | Check history |
