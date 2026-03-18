import { Monitor } from "@/types/monitor";

const MONITORS_KEY = "pulse_monitors";
const CHECKS_KEY = "pulse_checks";

export interface CheckRecord {
  id: string;
  monitorId: string;
  timestamp: number;
  status: "up" | "down" | "slow";
  latency: number;
}

export function loadMonitors(): Monitor[] {
  try {
    const raw = localStorage.getItem(MONITORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: any) => ({
      ...m,
      lastChecked: new Date(m.lastChecked),
    }));
  } catch {
    return [];
  }
}

export function saveMonitors(monitors: Monitor[]) {
  localStorage.setItem(MONITORS_KEY, JSON.stringify(monitors));
}

export function loadChecks(monitorId?: string): CheckRecord[] {
  try {
    const raw = localStorage.getItem(CHECKS_KEY);
    if (!raw) return [];
    const all: CheckRecord[] = JSON.parse(raw);
    return monitorId ? all.filter((c) => c.monitorId === monitorId) : all;
  } catch {
    return [];
  }
}

export function saveCheck(check: CheckRecord) {
  const checks = loadChecks();
  checks.push(check);
  // Keep last 5000 check records total
  const trimmed = checks.slice(-5000);
  localStorage.setItem(CHECKS_KEY, JSON.stringify(trimmed));
}

export function deleteMonitor(id: string) {
  const monitors = loadMonitors().filter((m) => m.id !== id);
  saveMonitors(monitors);
  // Remove associated checks
  const checks = loadChecks().filter((c) => c.monitorId !== id);
  localStorage.setItem(CHECKS_KEY, JSON.stringify(checks));
}
