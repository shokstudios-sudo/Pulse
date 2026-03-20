import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import MonitorCard from "@/components/MonitorCard";
import AddMonitorDialog from "@/components/AddMonitorDialog";
import { useMonitors } from "@/hooks/useMonitors";

const Index = () => {
  const { monitors, loading, addMonitor, deleteMonitor } = useMonitors();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onAddMonitor={() => setDialogOpen(true)} />

      <main className="ml-16 p-8">
        <DashboardHeader monitors={monitors} />

        {monitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground font-mono text-sm mb-2">No monitors yet</p>
            <button
              onClick={() => setDialogOpen(true)}
              className="text-xs font-mono text-primary hover:underline"
            >
              + Add your first monitor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {monitors.map((monitor, i) => (
              <MonitorCard
                key={monitor.id}
                monitor={monitor}
                index={i}
                onDelete={deleteMonitor}
              />
            ))}
          </div>
        )}
      </main>

      <AddMonitorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={addMonitor}
      />
    </div>
  );
};

export default Index;
