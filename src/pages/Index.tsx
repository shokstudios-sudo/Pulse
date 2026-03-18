import { useState } from "react";
import { Monitor } from "@/types/monitor";
import { mockMonitors } from "@/data/mockMonitors";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import MonitorCard from "@/components/MonitorCard";
import AddMonitorDialog from "@/components/AddMonitorDialog";

const Index = () => {
  const [monitors, setMonitors] = useState<Monitor[]>(mockMonitors);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddMonitor = (name: string, url: string) => {
    const newMonitor: Monitor = {
      id: String(Date.now()),
      name,
      url,
      status: "up",
      latency: 0,
      latencyHistory: [],
      uptime: 100,
      uptimeHistory: Array(60).fill('up'),
      lastChecked: new Date(),
      checkInterval: 60,
      location: "—",
    };
    setMonitors(prev => [...prev, newMonitor]);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onAddMonitor={() => setDialogOpen(true)} />

      <main className="ml-16 p-8">
        <DashboardHeader monitors={monitors} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {monitors.map((monitor, i) => (
            <MonitorCard key={monitor.id} monitor={monitor} index={i} />
          ))}
        </div>
      </main>

      <AddMonitorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddMonitor}
      />
    </div>
  );
};

export default Index;
