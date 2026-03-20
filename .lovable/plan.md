

# Plan: PHP + MySQL Backend for Monitor App

## Overview
Create a PHP REST API backend with MySQL database, and refactor the React frontend to call it instead of using localStorage.

## Part 1: MySQL Schema — `backend/schema.sql`
- `monitors` table: id, name, url, status (enum), latency, uptime, last_checked, check_interval, location, created_at
- `checks` table: id, monitor_id (FK), timestamp, status (enum), latency, created_at, with indexes

## Part 2: PHP Backend — `backend/api/`

**`backend/config.php`** — Database credentials (host, user, pass, dbname), PDO connection helper, CORS headers.

**`backend/api/monitors.php`** — REST endpoint:
- `GET` — list all monitors with computed stats
- `POST` — create a monitor
- `DELETE ?id=xxx` — delete monitor + cascading checks

**`backend/api/checks.php`** — REST endpoint:
- `GET ?monitor_id=xxx` — return check history for a monitor

**`backend/api/stats.php`** — REST endpoint:
- `GET ?monitor_id=xxx` — computed uptime percentage, avg latency, incident count

**`backend/cron.php`** — CLI script intended for cron job (`* * * * * php /path/to/cron.php`):
- Queries all monitors from DB
- For each, does a `curl` HEAD request with timeout
- Records result in `checks` table
- Updates `monitors.status`, `monitors.latency`, `monitors.last_checked`
- Respects each monitor's `check_interval` (skips if last check was too recent)

**`backend/.htaccess`** — Basic URL rewriting for clean API paths (optional).

## Part 3: Frontend Changes

**`src/services/api.ts`** (new) — Fetch wrapper pointing to configurable `API_BASE_URL` (e.g., `http://localhost/backend/api`). Functions: `fetchMonitors()`, `createMonitor()`, `deleteMonitor()`, `fetchChecks()`, `fetchStats()`.

**`src/services/storage.ts`** — Rewrite all functions to async, delegating to `api.ts`.

**`src/services/pinger.ts`** — Remove browser-side ping logic. `computeMonitorStats` calls the backend stats endpoint.

**`src/hooks/useMonitors.ts`** — Add loading state, fetch monitors on mount, poll for UI refresh every few seconds (no client-side pinging). All operations become async.

**`src/pages/MonitorDetail.tsx`** — Convert `loadChecks` to async API call.

**`src/components/AddMonitorDialog.tsx`** — Ensure it calls async `addMonitor`.

## Part 4: Deployment Instructions (README update)

1. Import `schema.sql` into MySQL
2. Edit `backend/config.php` with DB credentials
3. Deploy `backend/` to a PHP-capable web server (Apache/Nginx + PHP-FPM)
4. Add cron job: `* * * * * php /path/to/backend/cron.php`
5. Build React frontend (`npm run build`), serve the `dist/` folder
6. Set `API_BASE_URL` to point to the PHP backend

## Files Created/Modified

| File | Action |
|------|--------|
| `backend/schema.sql` | Create |
| `backend/config.php` | Create |
| `backend/api/monitors.php` | Create |
| `backend/api/checks.php` | Create |
| `backend/api/stats.php` | Create |
| `backend/cron.php` | Create |
| `src/services/api.ts` | Create |
| `src/services/storage.ts` | Rewrite (async) |
| `src/services/pinger.ts` | Rewrite (remove browser ping) |
| `src/hooks/useMonitors.ts` | Rewrite (async + loading state) |
| `src/pages/MonitorDetail.tsx` | Update async calls |

