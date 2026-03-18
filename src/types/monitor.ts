export interface Monitor {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'slow';
  latency: number;
  latencyHistory: number[];
  uptime: number;
  uptimeHistory: Array<'up' | 'down' | 'slow'>;
  lastChecked: Date;
  checkInterval: number;
  location: string;
}
