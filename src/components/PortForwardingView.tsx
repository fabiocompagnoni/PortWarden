import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    const [newRule, setNewRule] = useState({ local_port: "", remote_address: "" });

    const handleStart = async () => {
        await onStartForward(newRule.local_port, newRule.remote_address);
        setNewRule({ local_port: "", remote_address: "" });
    };

    return (
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
                        <Button className="w-full mt-2 h-11" onClick={handleStart}>Start Forwarding</Button>
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
                                            onClick={() => onStopForward(rule.id)}
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
    );
}
