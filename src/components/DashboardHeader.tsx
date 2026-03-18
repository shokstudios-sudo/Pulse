import { Monitor } from "@/types/monitor";

interface DashboardHeaderProps {
  monitors: Monitor[];
}

const DashboardHeader = ({ monitors }: DashboardHeaderProps) => {
  const upCount = monitors.filter(m => m.status === 'up').length;
  const downCount = monitors.filter(m => m.status === 'down').length;
  const slowCount = monitors.filter(m => m.status === 'slow').length;
  const avgLatency = Math.round(
    monitors.filter(m => m.status !== 'down').reduce((acc, m) => acc + m.latency, 0) / 
    Math.max(monitors.filter(m => m.status !== 'down').length, 1)
  );

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-medium text-foreground tracking-tight">Pulse</h1>
        <span className="text-xs font-mono text-muted-foreground">v1.0</span>
      </div>

      <div className="flex items-center gap-8">
        <div>
          <p className="text-xs text-muted-foreground font-mono mb-1">Monitors</p>
          <p className="text-2xl font-mono font-tabular text-foreground leading-none">{monitors.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-mono mb-1">Operational</p>
          <p className="text-2xl font-mono font-tabular text-status-up leading-none">{upCount}</p>
        </div>
        {downCount > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-mono mb-1">Down</p>
            <p className="text-2xl font-mono font-tabular text-status-down leading-none">{downCount}</p>
          </div>
        )}
        {slowCount > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-mono mb-1">Degraded</p>
            <p className="text-2xl font-mono font-tabular text-status-slow leading-none">{slowCount}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground font-mono mb-1">Avg Latency</p>
          <p className="text-2xl font-mono font-tabular text-foreground leading-none">{avgLatency}ms</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
