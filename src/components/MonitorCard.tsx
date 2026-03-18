import { motion } from "framer-motion";
import { Monitor } from "@/types/monitor";
import StatusLED from "./StatusLED";
import LatencySparkline from "./LatencySparkline";
import UptimeBar from "./UptimeBar";

interface MonitorCardProps {
  monitor: Monitor;
  index: number;
}

const statusLabels = {
  up: "Operational",
  down: "Down",
  slow: "Degraded",
};

const MonitorCard = ({ monitor, index }: MonitorCardProps) => {
  const timeSince = Math.round((Date.now() - monitor.lastChecked.getTime()) / 1000);

  return (
    <motion.div
      className="glass-card rim-highlight rounded-lg p-4 cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.2, 0, 0, 1] }}
      whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusLED status={monitor.status} />
          <span className="text-sm font-medium text-foreground tracking-tight">{monitor.name}</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono font-tabular">{monitor.location}</span>
      </div>

      {/* Metrics row */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Latency</p>
          <p className="text-xl font-mono font-tabular text-foreground tracking-tight leading-none">
            {monitor.status === 'down' ? '—' : `${Math.round(monitor.latency)}ms`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Uptime</p>
          <p className="text-xl font-mono font-tabular text-foreground tracking-tight leading-none">
            {monitor.uptime.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mb-3">
        <LatencySparkline data={monitor.latencyHistory} status={monitor.status} width={280} height={28} />
      </div>

      {/* Uptime bar (60 days) */}
      <div className="mb-2">
        <UptimeBar history={monitor.uptimeHistory} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-mono ${
          monitor.status === 'up' ? 'text-status-up' : 
          monitor.status === 'down' ? 'text-status-down' : 'text-status-slow'
        }`}>
          {statusLabels[monitor.status]}
        </span>
        <span className="text-xs text-muted-foreground font-mono font-tabular">
          {timeSince}s ago
        </span>
      </div>
    </motion.div>
  );
};

export default MonitorCard;
