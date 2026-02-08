import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LayoutDashboard, ArrowRightLeft, Settings, ShieldCheck, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

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

function App() {
  const [activePorts, setActivePorts] = useState<PortInfo[]>([]);
  const [rules, setRules] = useState<ForwardRule[]>([]);
  const [filter, setFilter] = useState("");
  const [newRule, setNewRule] = useState({ local_port: "", remote_address: "" });

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

  const handleStartForward = async () => {
    if (!newRule.local_port || !newRule.remote_address) return;
    const rule: ForwardRule = {
      id: Math.random().toString(36).substr(2, 9),
      local_port: parseInt(newRule.local_port),
      remote_address: newRule.remote_address,
      active: true,
    };
    try {
      await invoke("start_forward", { rule });
      fetchRules();
      setNewRule({ local_port: "", remote_address: "" });
    } catch (e) {
      alert(e);
    }
  };

  const handleStopForward = async (id: string) => {
    try {
      await invoke("stop_forward", { id });
      fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPorts = activePorts.filter(p =>
    p.port.toString().includes(filter) ||
    p.process_name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.pid?.toString().includes(filter)
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card/50 backdrop-blur-xl flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PortWarden</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <Button variant="ghost" className="justify-start gap-3 h-11 px-4 bg-primary/10 text-primary">
            <LayoutDashboard className="w-4 h-4" />
            Active Ports
          </Button>
          <Button variant="ghost" className="justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-primary">
            <ArrowRightLeft className="w-4 h-4" />
            Port Forwarding
          </Button>
          <Button variant="ghost" className="justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-primary">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </nav>

        <div className="mt-auto p-4 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">System Status</p>
          <p className="text-sm font-bold">Authenticated as Root</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="h-20 border-b flex items-center justify-between px-8 bg-card/30 backdrop-blur-md">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by port, name, or PID..."
              className="pl-10 h-10 bg-muted/50 border-none ring-offset-transparent focus-visible:ring-1 focus-visible:ring-primary/20"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" className="gap-2 h-10 px-4 border-muted-foreground/20">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Button>
            <Button size="sm" className="h-10 px-6 shadow-lg shadow-primary/20" onClick={fetchPorts}>
              Refresh Data
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 p-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-[400px] grid-cols-2 h-12 p-1 bg-muted/50">
                <TabsTrigger value="active" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">Active Connections</TabsTrigger>
                <TabsTrigger value="forward" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">Forwarding Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6 border-none p-0 focus-visible:ring-0">
                <Card className="border-muted-foreground/10 bg-card/50 shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold">Network Listeners</CardTitle>
                    <CardDescription>Live monitoring of all processes listening on local ports.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-muted-foreground/10">
                          <TableHead className="w-[120px]">Protocol</TableHead>
                          <TableHead>Port</TableHead>
                          <TableHead>PID</TableHead>
                          <TableHead>Process</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPorts.map((p, i) => (
                          <TableRow key={i} className="group border-muted-foreground/5 hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.protocol === 'TCP' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                {p.protocol}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-primary">{p.port}</TableCell>
                            <TableCell className="text-muted-foreground font-mono">{p.pid || "-"}</TableCell>
                            <TableCell className="font-medium">{p.process_name || "-"}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10">
                                Terminate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forward" className="mt-6 border-none p-0 focus-visible:ring-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <Card className="border-muted-foreground/10 bg-card/50 shadow-md sticky top-8">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">Create Rule</CardTitle>
                        <CardDescription>Expose internal ports to your network.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="localPort">Local Port</Label>
                          <Input
                            id="localPort"
                            placeholder="e.g. 9090"
                            className="bg-muted/50 border-none"
                            value={newRule.local_port}
                            onChange={e => setNewRule({ ...newRule, local_port: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="target">Remote Address (IP:Port)</Label>
                          <Input
                            id="target"
                            placeholder="127.0.0.1:8080"
                            className="bg-muted/50 border-none"
                            value={newRule.remote_address}
                            onChange={e => setNewRule({ ...newRule, remote_address: e.target.value })}
                          />
                        </div>
                        <Button className="w-full mt-2 h-11" onClick={handleStartForward}>Start Forwarding</Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-4">
                    <Card className="border-muted-foreground/10 bg-card/50 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">Active Rules</CardTitle>
                        <CardDescription>Managing active port forwarding tunnels.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {rules.length === 0 ? (
                          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 grayscale">
                            <ArrowRightLeft className="w-12 h-12 mb-4 text-muted-foreground" />
                            <p className="text-sm">No active forwarding rules found.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {rules.map(rule => (
                              <div key={rule.id} className="p-4 rounded-xl border border-muted-foreground/10 bg-muted/20 flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Tunnel</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-primary font-bold">{rule.local_port}</span>
                                      <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                                      <span className="font-mono text-muted-foreground">{rule.remote_address}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => handleStopForward(rule.id)}
                                >
                                  Stop
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

export default App;
