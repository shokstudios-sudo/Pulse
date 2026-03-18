import { useState, useEffect, useCallback, useRef } from "react";
import { Monitor } from "@/types/monitor";
import { loadMonitors, saveMonitors, deleteMonitor as removeMonitor } from "@/services/storage";
import { pingMonitor, createCheckRecord, computeMonitorStats } from "@/services/pinger";

export function useMonitors() {
  const [monitors, setMonitors] = useState<Monitor[]>(() => loadMonitors());
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Persist whenever monitors change
  useEffect(() => {
    saveMonitors(monitors);
  }, [monitors]);

  const runCheck = useCallback(async (monitor: Monitor) => {
    const { status, latency } = await pingMonitor(monitor);
    createCheckRecord(monitor.id, status, latency);
    const stats = computeMonitorStats(monitor.id);

    setMonitors((prev) =>
      prev.map((m) =>
        m.id === monitor.id
          ? {
              ...m,
              status,
              latency,
              lastChecked: new Date(),
              latencyHistory: stats.latencyHistory,
              uptimeHistory: stats.uptimeHistory,
              uptime: Math.round(stats.uptime * 100) / 100,
            }
          : m
      )
    );
  }, []);

  const startPolling = useCallback(
    (monitor: Monitor) => {
      // Run immediately
      runCheck(monitor);
      // Then at interval
      const id = setInterval(() => {
        // Get fresh monitor state from current monitors
        setMonitors((prev) => {
          const current = prev.find((m) => m.id === monitor.id);
          if (current) runCheck(current);
          return prev;
        });
      }, monitor.checkInterval * 1000);
      intervalsRef.current.set(monitor.id, id);
    },
    [runCheck]
  );

  const stopPolling = useCallback((monitorId: string) => {
    const id = intervalsRef.current.get(monitorId);
    if (id) {
      clearInterval(id);
      intervalsRef.current.delete(monitorId);
    }
  }, []);

  // Start polling for all monitors on mount
  useEffect(() => {
    monitors.forEach((m) => {
      if (!intervalsRef.current.has(m.id)) {
        startPolling(m);
      }
    });
    return () => {
      intervalsRef.current.forEach((id) => clearInterval(id));
      intervalsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMonitor = useCallback(
    (name: string, url: string) => {
      const newMonitor: Monitor = {
        id: `mon_${Date.now()}`,
        name,
        url,
        status: "up",
        latency: 0,
        latencyHistory: [],
        uptime: 100,
        uptimeHistory: [],
        lastChecked: new Date(),
        checkInterval: 60,
        location: "Local",
      };
      setMonitors((prev) => [...prev, newMonitor]);
      startPolling(newMonitor);
    },
    [startPolling]
  );

  const deleteMonitor = useCallback(
    (id: string) => {
      stopPolling(id);
      removeMonitor(id);
      setMonitors((prev) => prev.filter((m) => m.id !== id));
    },
    [stopPolling]
  );

  return { monitors, addMonitor, deleteMonitor, runCheck };
}
