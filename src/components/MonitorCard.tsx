import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Monitor } from "@/types/monitor";
import StatusLED from "./StatusLED";
import LatencySparkline from "./LatencySparkline";
import UptimeBar from "./UptimeBar";

interface MonitorCardProps {
  monitor: Monitor;
  index: number;
  onDelete?: (id: string) => void;
}

const statusLabels = {
  up: "Operational",
  down: "Down",
  slow: "Degraded",
};

const MonitorCard = ({ monitor, index, onDelete }: MonitorCardProps) => {
  const timeSince = Math.round((Date.now() - monitor.lastChecked.getTime()) / 1000);

  return (
    <motion.div
      className="glass-card rim-highlight rounded-lg p-4 group relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.2, 0, 0, 1] }}
      whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
    >
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={() => onDelete(monitor.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
          aria-label="Delete monitor"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

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

      {/* Uptime bar */}
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
