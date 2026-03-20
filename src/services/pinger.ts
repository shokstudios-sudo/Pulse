// Pinging is now handled server-side by backend/cron.php
// This module is kept for type compatibility but has no browser-side logic.

import { fetchStats } from "./api";

export async function computeMonitorStats(monitorId: string) {
  return fetchStats(monitorId);
}
