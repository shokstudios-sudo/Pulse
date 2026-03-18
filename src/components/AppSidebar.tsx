import { Activity, Globe, Bell, Settings, Plus } from "lucide-react";

interface AppSidebarProps {
  onAddMonitor: () => void;
}

const AppSidebar = ({ onAddMonitor }: AppSidebarProps) => {
  const navItems = [
    { icon: Activity, label: "Dashboard", active: true },
    { icon: Globe, label: "Monitors" },
    { icon: Bell, label: "Alerts" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 z-50">
      {/* Logo */}
      <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center mb-8">
        <Activity className="w-4 h-4 text-primary" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              active 
                ? 'bg-sidebar-accent text-foreground' 
                : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent'
            }`}
            title={label}
          >
            <Icon className="w-[18px] h-[18px]" />
          </button>
        ))}
      </nav>

      {/* Add button */}
      <button
        onClick={onAddMonitor}
        className="w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
        title="Add Monitor"
      >
        <Plus className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
};

export default AppSidebar;
