import { useState } from "react";
import { ArrowRight, Trash2, Plus, Network, Shield, Globe, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface ForwardRule {
    id: string;
    local_port: number;
    remote_address: string;
    active: boolean;
}

interface PortForwardingViewProps {
    rules: ForwardRule[];
    onStartForward: (local: string, remote: string) => Promise<void>;
    onStopForward: (id: string) => Promise<void>;
}

export function PortForwardingView({ rules, onStartForward, onStopForward }: PortForwardingViewProps) {
    const [mode, setMode] = useState<"simple" | "advanced">("simple");

    // Simple Mode State
    const [publicPort, setPublicPort] = useState("");
    const [internalPort, setInternalPort] = useState("");

    // Advanced Mode State
    const [localPort, setLocalPort] = useState("");
    const [remoteIp, setRemoteIp] = useState("");
    const [remotePort, setRemotePort] = useState("");

    const handleStart = async () => {
        if (mode === "simple") {
            if (!publicPort || !internalPort) return;
            // In simple mode, forward Public (0.0.0.0) -> Internal Localhost (127.0.0.1)
            await onStartForward(publicPort, `127.0.0.1:${internalPort}`);
            setPublicPort("");
            setInternalPort("");
        } else {
            if (!localPort || !remoteIp || !remotePort) return;
            await onStartForward(localPort, `${remoteIp}:${remotePort}`);
            setLocalPort("");
            setRemoteIp("");
            setRemotePort("");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Creation Form */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Network className="w-32 h-32" />
                    </div>
                    <CardHeader className="relative z-10 pb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Plus className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xl">New Rule</CardTitle>
                        </div>
                        <div className="flex items-center justify-between">
                            <CardDescription>
                                {mode === "simple" ? "Expose a local service." : "Custom forwarding rule."}
                            </CardDescription>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="mode-switch" className="text-xs font-normal text-muted-foreground">Advanced</Label>
                                <Switch
                                    id="mode-switch"
                                    checked={mode === "advanced"}
                                    onCheckedChange={(c) => setMode(c ? "advanced" : "simple")}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        {mode === "simple" ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Service Port</Label>
                                    <div className="relative group">
                                        <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="e.g. 3000 (React)"
                                            className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all h-11"
                                            type="number"
                                            value={internalPort}
                                            onChange={e => setInternalPort(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">The port your app is running on (localhost).</p>
                                </div>

                                <div className="flex justify-center">
                                    <ArrowRight className="w-5 h-5 text-muted-foreground/50 rotate-90" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Public Access Port</Label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="e.g. 8080"
                                            className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all h-11"
                                            type="number"
                                            value={publicPort}
                                            onChange={e => setPublicPort(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">The port to open to the network (0.0.0.0). Must be available.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Local Listen Port</Label>
                                    <div className="relative group">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="e.g. 8080"
                                            className="pl-10 h-11"
                                            type="number"
                                            value={localPort}
                                            onChange={e => setLocalPort(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Destination</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            placeholder="IP Address"
                                            className="col-span-2 h-11"
                                            value={remoteIp}
                                            onChange={e => setRemoteIp(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Port"
                                            className="h-11"
                                            type="number"
                                            value={remotePort}
                                            onChange={e => setRemotePort(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                            onClick={handleStart}
                            disabled={mode === 'simple' ? (!publicPort || !internalPort) : (!localPort || !remoteIp || !remotePort)}
                        >
                            {mode === 'simple' ? 'Expose Service' : 'Start Forwarding'}
                        </Button>
                    </CardContent>
                </Card>

                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm">
                    <p className="font-semibold flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4" />
                        Security Warning
                    </p>
                    Opening ports makes your service accessible to the entire network.
                </div>
            </div>

            {/* Active Rules List */}
            <div className="lg:col-span-8">
                <Card className="border-none shadow-md bg-card/40 h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Active Tunnels</CardTitle>
                                <CardDescription>Currently forwarding traffic</CardDescription>
                            </div>
                            <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                                {rules.length} Active
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        {rules.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                                <Network className="w-16 h-16 mb-4 stroke-1" />
                                <p className="text-lg font-medium">No active tunnels</p>
                                <p className="text-sm">Create a new rule to see it here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {rules.map(rule => (
                                    <div
                                        key={rule.id}
                                        className="group relative overflow-hidden rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 hover:shadow-lg hover:border-primary/20 transition-all duration-300 p-5 flex items-center justify-between"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Public Port</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-primary font-mono">{rule.local_port}</span>
                                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                                                </div>
                                            </div>

                                            <div className="hidden sm:flex flex-col items-center px-4 opacity-50">
                                                <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
                                                <div className="w-full h-px bg-border mt-1" />
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Target</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-mono font-medium">{rule.remote_address}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-10 w-10 rounded-full"
                                            onClick={() => onStopForward(rule.id)}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
