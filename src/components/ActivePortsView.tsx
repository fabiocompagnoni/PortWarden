import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PortInfo {
    port: number;
    pid: number | null;
    process_name: string | null;
    protocol: string;
}

interface ActivePortsViewProps {
    ports: PortInfo[];
}

export function ActivePortsView({ ports }: ActivePortsViewProps) {
    return (
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
                        {ports.map((p, i) => (
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
    );
}
