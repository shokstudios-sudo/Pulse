# Pulse Monitor

A real-time uptime monitoring dashboard built with React + PHP + MySQL.

<img width="1278" height="914" alt="Screenshot 2026-03-23 at 17-06-10 Pulse — Uptime Monitor" src="https://github.com/user-attachments/assets/f668bfb6-5cc0-4778-90c5-950a1349b44c" />

<img width="1278" height="914" alt="Screenshot 2026-03-23 at 17-06-23 Monitor Detail — Pulse" src="https://github.com/user-attachments/assets/1ffa207e-b47c-41bd-a38b-af96f1e27074" />


## Architecture

- **Frontend**: React + Vite + Tailwind CSS (SPA)
- **Backend**: PHP REST API with MySQL database
- **Cron**: PHP CLI script for server-side URL pinging

## Setup & Deployment

### 1. Database Setup

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `pulse_monitor` database with `monitors` and `checks` tables.

### 2. Configure PHP Backend

Edit `backend/config.php` with your MySQL credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'pulse_monitor');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
```

Also update the CORS origin header for production:

```php
header('Access-Control-Allow-Origin: https://your-domain.com');
```

### 3. Deploy Backend

Copy the `backend/` folder to your web server (Apache or Nginx with PHP-FPM).

The `.htaccess` file handles URL rewriting for Apache. For Nginx, add equivalent rewrite rules.

### 4. Setup Cron Job

Add a cron job to ping monitors at regular intervals:

```bash
* * * * * php /path/to/backend/cron.php >> /var/log/pulse-cron.log 2>&1
```

This runs every minute. The script respects each monitor's individual `check_interval` setting and skips monitors that were checked too recently.

### 5. Build & Deploy Frontend

```bash
# Set the API URL (adjust to your backend location)
echo "VITE_API_BASE_URL=https://your-domain.com/backend/api" > .env

npm install
npm run build
```

Serve the `dist/` folder as static files from your web server.

### 6. Directory Structure

```
backend/
  schema.sql        # MySQL table definitions
  config.php        # Database config + CORS + helpers
  .htaccess         # Apache URL rewriting
  cron.php          # Server-side ping cron job
  api/
    monitors.php    # GET (list), POST (create), DELETE
    checks.php      # GET check history for a monitor
    stats.php       # GET computed stats for a monitor
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/monitors.php` | List all monitors with stats |
| POST | `/api/monitors.php` | Create a new monitor |
| DELETE | `/api/monitors.php?id=xxx` | Delete a monitor |
| GET | `/api/checks.php?monitor_id=xxx` | Get check history |
| GET | `/api/stats.php?monitor_id=xxx` | Get computed statistics |
