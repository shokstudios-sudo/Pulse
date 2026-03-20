// API base URL - change this to your PHP backend URL when deploying
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/backend/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface ApiMonitor {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "slow";
  latency: number;
  uptime: number;
  latencyHistory: number[];
  uptimeHistory: Array<"up" | "down" | "slow">;
  lastChecked: string | null;
  checkInterval: number;
  location: string;
}

export interface ApiCheck {
  id: string;
  monitorId: string;
  timestamp: number;
  status: "up" | "down" | "slow";
  latency: number;
}

export interface ApiStats {
  totalChecks: number;
  uptime: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
  incidentCount: number;
}

export async function fetchMonitors(): Promise<ApiMonitor[]> {
  return request<ApiMonitor[]>("monitors.php");
}

export async function createMonitor(
  name: string,
  url: string,
  checkInterval: number
): Promise<ApiMonitor> {
  return request<ApiMonitor>("monitors.php", {
    method: "POST",
    body: JSON.stringify({ name, url, checkInterval }),
  });
}

export async function deleteMonitorApi(id: string): Promise<void> {
  await request<{ success: boolean }>(`monitors.php?id=${id}`, {
    method: "DELETE",
  });
}

export async function fetchChecks(monitorId: string, limit = 500): Promise<ApiCheck[]> {
  return request<ApiCheck[]>(`checks.php?monitor_id=${monitorId}&limit=${limit}`);
}

export async function fetchStats(monitorId: string): Promise<ApiStats> {
  return request<ApiStats>(`stats.php?monitor_id=${monitorId}`);
}
