import { Monitor } from "@/types/monitor";
import {
  fetchMonitors as apiFetchMonitors,
  createMonitor as apiCreateMonitor,
  deleteMonitorApi,
  fetchChecks as apiFetchChecks,
  ApiMonitor,
  ApiCheck,
} from "./api";

export interface CheckRecord {
  id: string;
  monitorId: string;
  timestamp: number;
  status: "up" | "down" | "slow";
  latency: number;
}

function apiMonitorToMonitor(m: ApiMonitor): Monitor {
  return {
    id: m.id,
    name: m.name,
    url: m.url,
    status: m.status,
    latency: m.latency,
    uptime: m.uptime,
    latencyHistory: m.latencyHistory || [],
    uptimeHistory: m.uptimeHistory || [],
    lastChecked: m.lastChecked ? new Date(m.lastChecked) : new Date(),
    checkInterval: m.checkInterval,
    location: m.location,
  };
}

function apiCheckToRecord(c: ApiCheck): CheckRecord {
  return {
    id: c.id,
    monitorId: c.monitorId,
    timestamp: c.timestamp,
    status: c.status,
    latency: c.latency,
  };
}

export async function loadMonitors(): Promise<Monitor[]> {
  const data = await apiFetchMonitors();
  return data.map(apiMonitorToMonitor);
}

export async function addMonitor(
  name: string,
  url: string,
  interval: number
): Promise<Monitor> {
  const data = await apiCreateMonitor(name, url, interval);
  return apiMonitorToMonitor(data);
}

export async function deleteMonitor(id: string): Promise<void> {
  await deleteMonitorApi(id);
}

export async function loadChecks(monitorId?: string): Promise<CheckRecord[]> {
  if (!monitorId) return [];
  const data = await apiFetchChecks(monitorId);
  return data.map(apiCheckToRecord);
}
