import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LayoutDashboard, ArrowRightLeft, Settings, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ActivePortsView } from "@/components/ActivePortsView";
import { PortForwardingView } from "@/components/PortForwardingView";

// Import Logo
// import logo from "@/assets/logo.png"; // We don't have this yet, acts as placeholder or we use the public dir

interface PortInfo {
  port: number;
  pid: number | null;
  process_name: string | null;
  protocol: string;
}

interface ForwardRule {
  id: string;
  local_port: number;
  remote_address: string;
  active: boolean;
}

import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { SettingsView } from "@/components/SettingsView";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

function App() {
  const [activeView, setActiveView] = useState<'ports' | 'forwarding' | 'settings'>('ports');
  const [activePorts, setActivePorts] = useState<PortInfo[]>([]);
  const [rules, setRules] = useState<ForwardRule[]>([]);
  const [filter, setFilter] = useState("");

  const fetchPorts = async () => {
    try {
      const ports = await invoke<PortInfo[]>("get_active_ports");
      setActivePorts(ports);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRules = async () => {
    try {
      const r = await invoke<ForwardRule[]>("get_forward_rules");
      setRules(r);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPorts();
    fetchRules();
    const interval = setInterval(fetchPorts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartForward = async (local: string, remote: string) => {
    if (!local || !remote) return;

    // Check if rule already exists for this local port
    if (rules.some(r => r.local_port === parseInt(local) && r.active)) {
      toast.error(`Port ${local} is already being forwarded.`);
      return;
    }

    const rule: ForwardRule = {
      id: Math.random().toString(36).substr(2, 9),
      local_port: parseInt(local),
      remote_address: remote,
      active: true,
    };
    try {
      await invoke("start_forward", { rule });
      toast.success(`Forwarding port ${local} to ${remote}`);
      fetchRules();
    } catch (e) {
      toast.error("Failed to start forwarding", {
        description: typeof e === 'string' ? e : "Unknown error occurred"
      });
    }
  };

  const handleStopForward = async (id: string) => {
    try {
      await invoke("stop_forward", { id });
      toast.info("Forwarding rule stopped");
      fetchRules();
    } catch (e) {
      console.error(e);
      toast.error("Failed to stop rule");
    }
  };

  const filteredPorts = activePorts.filter(p =>
    p.port.toString().includes(filter) ||
    p.process_name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.pid?.toString().includes(filter)
  );

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 border-r bg-card/50 backdrop-blur-xl flex-col p-6 gap-8 shrink-0">
          <div className="flex items-center gap-3 px-2">
            {/* Logo */}
            <img src="/icon.png" alt="PortWarden Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <h1 className="text-xl font-bold tracking-tight">PortWarden</h1>
          </div>

          <nav className="flex flex-col gap-2">
            <Button
              variant={activeView === 'ports' ? "secondary" : "ghost"}
              className={`justify-start gap-3 h-11 px-4 ${activeView === 'ports' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary'}`}
              onClick={() => setActiveView('ports')}
            >
              <LayoutDashboard className="w-4 h-4" />
              Active Ports
            </Button>
            <Button
              variant={activeView === 'forwarding' ? "secondary" : "ghost"}
              className={`justify-start gap-3 h-11 px-4 ${activeView === 'forwarding' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary'}`}
              onClick={() => setActiveView('forwarding')}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Port Forwarding
            </Button>
            <Button
              variant={activeView === 'settings' ? "secondary" : "ghost"}
              className={`justify-start gap-3 h-11 px-4 ${activeView === 'settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary'}`}
              onClick={() => setActiveView('settings')}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </nav>

          <div className="mt-auto p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">System Status</p>
            <p className="text-sm font-bold">Authenticated as Root</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-20 border-b flex items-center justify-between px-8 bg-card/30 backdrop-blur-md shrink-0">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by port, name, or PID..."
                className="pl-10 h-10 bg-muted/50 border-none ring-offset-transparent focus-visible:ring-1 focus-visible:ring-primary/20 w-full"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="flex gap-4 ml-4 items-center">
              <ModeToggle />
              <div className="h-6 w-px bg-border hidden sm:block" />
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 h-10 px-4 border-muted-foreground/20">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button size="sm" className="h-10 px-6 shadow-lg shadow-primary/20 whitespace-nowrap" onClick={fetchPorts}>
                Refresh
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 pb-12">
              {activeView === 'ports' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ActivePortsView ports={filteredPorts} />
                </div>
              )}
              {activeView === 'forwarding' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <PortForwardingView
                    rules={rules}
                    onStartForward={handleStartForward}
                    onStopForward={handleStopForward}
                  />
                </div>
              )}
              {activeView === 'settings' && (
                <SettingsView />
              )}
            </div>
          </ScrollArea>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
