import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft, ExternalLink, Clock, Activity, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMonitors } from "@/hooks/useMonitors";
import { loadChecks, CheckRecord } from "@/services/storage";
import StatusLED from "@/components/StatusLED";
import UptimeBar from "@/components/UptimeBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusLabels = {
  up: "Operational",
  down: "Down",
  slow: "Degraded",
};

interface Incident {
  id: string;
  type: "down" | "slow" | "recovery";
  startedAt: number;
  endedAt?: number;
  duration: number;
}

function deriveIncidents(checks: CheckRecord[]): Incident[] {
  const incidents: Incident[] = [];
  let current: Incident | null = null;

  for (const check of checks) {
    if (check.status === "down" || check.status === "slow") {
      if (!current) {
        current = {
          id: check.id,
          type: check.status,
          startedAt: check.timestamp,
          duration: 0,
        };
      }
    } else {
      if (current) {
        current.endedAt = check.timestamp;
        current.duration = current.endedAt - current.startedAt;
        incidents.push(current);
        current = null;
      }
    }
  }
  if (current) {
    current.duration = Date.now() - current.startedAt;
    incidents.push(current);
  }

  return incidents.reverse();
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MonitorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { monitors } = useMonitors();

  const monitor = monitors.find((m) => m.id === id);
  const checks = useMemo(() => (id ? loadChecks(id) : []), [id, monitor?.lastChecked]);
  const incidents = useMemo(() => deriveIncidents(checks), [checks]);

  const chartData = useMemo(
    () =>
      checks.slice(-100).map((c) => ({
        time: formatTime(c.timestamp),
        latency: c.latency,
        status: c.status,
      })),
    [checks]
  );

  if (!monitor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-mono text-sm mb-2">Monitor not found</p>
          <button onClick={() => navigate("/")} className="text-xs font-mono text-primary hover:underline">
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const avgLatency = checks.length
    ? Math.round(checks.filter((c) => c.status !== "down").reduce((a, c) => a + c.latency, 0) / checks.filter((c) => c.status !== "down").length || 0)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to dashboard
          </button>

          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <StatusLED status={monitor.status} />
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">{monitor.name}</h1>
                <a
                  href={monitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                >
                  {monitor.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <span
              className={`text-xs font-mono px-2 py-1 rounded ${
                monitor.status === "up"
                  ? "bg-status-up/10 text-status-up"
                  : monitor.status === "down"
                  ? "bg-status-down/10 text-status-down"
                  : "bg-status-slow/10 text-status-slow"
              }`}
            >
              {statusLabels[monitor.status]}
            </span>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {[
            { label: "Current Latency", value: monitor.status === "down" ? "—" : `${Math.round(monitor.latency)}ms`, icon: Activity },
            { label: "Avg Latency", value: `${avgLatency}ms`, icon: Clock },
            { label: "Uptime", value: `${monitor.uptime.toFixed(2)}%`, icon: Activity },
            { label: "Incidents", value: `${incidents.length}`, icon: AlertTriangle },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rim-highlight rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-lg font-mono font-tabular text-foreground">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Uptime bar */}
        <motion.div
          className="glass-card rim-highlight rounded-lg p-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <p className="text-xs text-muted-foreground mb-3 font-mono">Uptime (last 60 checks)</p>
          <UptimeBar history={monitor.uptimeHistory} />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="bg-secondary/50 mb-4">
              <TabsTrigger value="chart" className="font-mono text-xs">Response Time</TabsTrigger>
              <TabsTrigger value="history" className="font-mono text-xs">Check History</TabsTrigger>
              <TabsTrigger value="incidents" className="font-mono text-xs">Incidents</TabsTrigger>
            </TabsList>

            {/* Response time chart */}
            <TabsContent value="chart">
              <div className="glass-card rim-highlight rounded-lg p-4">
                {chartData.length === 0 ? (
                  <p className="text-muted-foreground text-xs font-mono text-center py-12">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 19% 14%)" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: "hsl(215 20% 55%)", fontFamily: "JetBrains Mono" }}
                        tickLine={false}
                        axisLine={{ stroke: "hsl(217 19% 14%)" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "hsl(215 20% 55%)", fontFamily: "JetBrains Mono" }}
                        tickLine={false}
                        axisLine={{ stroke: "hsl(217 19% 14%)" }}
                        unit="ms"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 47% 7%)",
                          border: "1px solid hsl(217 19% 14%)",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontFamily: "JetBrains Mono",
                        }}
                        labelStyle={{ color: "hsl(215 20% 55%)" }}
                        itemStyle={{ color: "hsl(142 70% 45%)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="latency"
                        stroke="hsl(142 70% 45%)"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 3, fill: "hsl(142 70% 45%)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            {/* Check history table */}
            <TabsContent value="history">
              <div className="glass-card rim-highlight rounded-lg overflow-hidden">
                {checks.length === 0 ? (
                  <p className="text-muted-foreground text-xs font-mono text-center py-12">No checks recorded</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="font-mono text-xs">Time</TableHead>
                        <TableHead className="font-mono text-xs">Status</TableHead>
                        <TableHead className="font-mono text-xs text-right">Latency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...checks]
                        .reverse()
                        .slice(0, 100)
                        .map((check) => (
                          <TableRow key={check.id} className="border-border/30">
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {formatDateTime(check.timestamp)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-mono ${
                                  check.status === "up"
                                    ? "text-status-up"
                                    : check.status === "down"
                                    ? "text-status-down"
                                    : "text-status-slow"
                                }`}
                              >
                                {statusLabels[check.status]}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-right text-foreground">
                              {check.status === "down" ? "—" : `${check.latency}ms`}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* Incidents log */}
            <TabsContent value="incidents">
              <div className="glass-card rim-highlight rounded-lg p-4">
                {incidents.length === 0 ? (
                  <p className="text-muted-foreground text-xs font-mono text-center py-12">No incidents recorded 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {incidents.slice(0, 50).map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-secondary/30 border border-border/30"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            incident.type === "down" ? "bg-status-down" : "bg-status-slow"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-mono font-medium ${
                                incident.type === "down" ? "text-status-down" : "text-status-slow"
                              }`}
                            >
                              {incident.type === "down" ? "Outage" : "Degraded Performance"}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              {formatDuration(incident.duration)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {formatDateTime(incident.startedAt)}
                            {incident.endedAt ? ` → ${formatDateTime(incident.endedAt)}` : " → Ongoing"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default MonitorDetail;
