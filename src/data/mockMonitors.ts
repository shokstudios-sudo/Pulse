import { Monitor } from "@/types/monitor";

// Generate realistic-looking latency data
function generateLatencyData(baseLatency: number, variance: number, count: number): number[] {
  return Array.from({ length: count }, () => 
    Math.max(5, baseLatency + (Math.random() - 0.5) * variance * 2)
  );
}

// Generate uptime data (60 days, each day is 'up' | 'down' | 'slow')
function generateUptimeData(reliability: number): Array<'up' | 'down' | 'slow'> {
  return Array.from({ length: 60 }, () => {
    const rand = Math.random();
    if (rand > reliability) return 'down';
    if (rand > reliability - 0.03) return 'slow';
    return 'up';
  });
}

export const mockMonitors: Monitor[] = [
  {
    id: "1",
    name: "api.myapp.com",
    url: "https://api.myapp.com",
    status: "up",
    latency: 24,
    latencyHistory: generateLatencyData(24, 8, 30),
    uptime: 99.98,
    uptimeHistory: generateUptimeData(0.99),
    lastChecked: new Date(Date.now() - 30000),
    checkInterval: 60,
    location: "JFK",
  },
  {
    id: "2",
    name: "dashboard.myapp.com",
    url: "https://dashboard.myapp.com",
    status: "up",
    latency: 142,
    latencyHistory: generateLatencyData(142, 40, 30),
    uptime: 99.95,
    uptimeHistory: generateUptimeData(0.98),
    lastChecked: new Date(Date.now() - 15000),
    checkInterval: 60,
    location: "LHR",
  },
  {
    id: "3",
    name: "cdn.myapp.com",
    url: "https://cdn.myapp.com",
    status: "slow",
    latency: 890,
    latencyHistory: generateLatencyData(450, 300, 30),
    uptime: 98.2,
    uptimeHistory: generateUptimeData(0.95),
    lastChecked: new Date(Date.now() - 5000),
    checkInterval: 30,
    location: "NRT",
  },
  {
    id: "4",
    name: "auth.myapp.com",
    url: "https://auth.myapp.com",
    status: "up",
    latency: 35,
    latencyHistory: generateLatencyData(35, 10, 30),
    uptime: 100,
    uptimeHistory: generateUptimeData(0.999),
    lastChecked: new Date(Date.now() - 45000),
    checkInterval: 30,
    location: "AMS",
  },
  {
    id: "5",
    name: "store.myapp.com",
    url: "https://store.myapp.com",
    status: "down",
    latency: 0,
    latencyHistory: [...generateLatencyData(200, 50, 25), 0, 0, 0, 0, 0],
    uptime: 94.3,
    uptimeHistory: generateUptimeData(0.90),
    lastChecked: new Date(Date.now() - 2000),
    checkInterval: 30,
    location: "SFO",
  },
  {
    id: "6",
    name: "blog.myapp.com",
    url: "https://blog.myapp.com",
    status: "up",
    latency: 67,
    latencyHistory: generateLatencyData(67, 20, 30),
    uptime: 99.99,
    uptimeHistory: generateUptimeData(0.995),
    lastChecked: new Date(Date.now() - 60000),
    checkInterval: 120,
    location: "FRA",
  },
];
