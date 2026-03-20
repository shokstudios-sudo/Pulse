import { useState, useEffect, useCallback, useRef } from "react";
import { Monitor } from "@/types/monitor";
import {
  loadMonitors,
  addMonitor as storageAddMonitor,
  deleteMonitor as storageDeleteMonitor,
} from "@/services/storage";

const REFRESH_INTERVAL = 10000; // Refresh UI every 10 seconds

export function useMonitors() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await loadMonitors();
      setMonitors(data);
    } catch (err) {
      console.error("Failed to fetch monitors:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + periodic refresh
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const addMonitor = useCallback(
    async (name: string, url: string, interval: number = 60) => {
      try {
        const newMonitor = await storageAddMonitor(name, url, interval);
        setMonitors((prev) => [...prev, newMonitor]);
      } catch (err) {
        console.error("Failed to add monitor:", err);
      }
    },
    []
  );

  const deleteMonitor = useCallback(
    async (id: string) => {
      try {
        await storageDeleteMonitor(id);
        setMonitors((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        console.error("Failed to delete monitor:", err);
      }
    },
    []
  );

  return { monitors, loading, addMonitor, deleteMonitor };
}
