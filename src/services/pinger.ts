import { Monitor } from "@/types/monitor";
import { CheckRecord, saveCheck, loadChecks } from "./storage";

const SLOW_THRESHOLD = 500; // ms

export async function pingMonitor(monitor: Monitor): Promise<{
  status: "up" | "down" | "slow";
  latency: number;
}> {
  const start = performance.now();

  try {
    // Use no-cors mode since we're pinging arbitrary URLs from the browser.
    // This won't give us response status, but a successful fetch = host is up.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    await fetch(monitor.url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);
    const status = latency > SLOW_THRESHOLD ? "slow" : "up";
    return { status, latency };
  } catch {
    const latency = Math.round(performance.now() - start);
    // If aborted (timeout) or network error → down
    return { status: "down", latency: 0 };
  }
}

export function computeMonitorStats(monitorId: string): {
  latencyHistory: number[];
  uptimeHistory: Array<"up" | "down" | "slow">;
  uptime: number;
} {
  const checks = loadChecks(monitorId);
  const recent = checks.slice(-60);

  const latencyHistory = checks.slice(-30).map((c) => c.latency);
  const uptimeHistory = recent.map((c) => c.status);
  const totalChecks = checks.length;
  const upChecks = checks.filter((c) => c.status !== "down").length;
  const uptime = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 100;

  return { latencyHistory, uptimeHistory, uptime };
}

export function createCheckRecord(
  monitorId: string,
  status: "up" | "down" | "slow",
  latency: number
): CheckRecord {
  const record: CheckRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    monitorId,
    timestamp: Date.now(),
    status,
    latency,
  };
  saveCheck(record);
  return record;
}
