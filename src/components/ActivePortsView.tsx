import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface PortInfo {
    port: number;
    pid: number | null;
    process_name: string | null;
    protocol: string;
}

interface ActivePortsViewProps {
    ports: PortInfo[];
    onTerminate: (pid: number) => void;
}

type SortKey = keyof PortInfo;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

export function ActivePortsView({ ports, onTerminate }: ActivePortsViewProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'port', direction: 'asc' });

    const sortedPorts = useMemo(() => {
        const sorted = [...ports];
        sorted.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null && bValue === null) return 0;
            if (aValue === null) return 1;
            if (bValue === null) return -1;

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [ports, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortConfig.key !== column) {
            return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-50" />;
        }
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="ml-2 h-4 w-4 text-primary" />
            : <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
    };

    const HeaderCell = ({ column, label, className = "" }: { column: SortKey, label: string, className?: string }) => (
        <TableHead
            className={`cursor-pointer group select-none hover:text-primary transition-colors ${className}`}
            onClick={() => requestSort(column)}
        >
            <div className={`flex items-center ${className.includes("text-right") ? "justify-end" : ""}`}>
                {label}
                <SortIcon column={column} />
            </div>
        </TableHead>
    );

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
                            <HeaderCell column="protocol" label="Protocol" className="w-[120px]" />
                            <HeaderCell column="port" label="Port" />
                            <HeaderCell column="pid" label="PID" />
                            <HeaderCell column="process_name" label="Process" />
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPorts.map((p, i) => (
                            <TableRow key={`${p.port}-${p.protocol}-${i}`} className="group border-muted-foreground/5 hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.protocol === 'TCP' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                        {p.protocol}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-primary">{p.port}</TableCell>
                                <TableCell className="text-muted-foreground font-mono">{p.pid || "-"}</TableCell>
                                <TableCell className="font-medium">{p.process_name || "-"}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                        onClick={() => p.pid && onTerminate(p.pid)}
                                        disabled={!p.pid}
                                    >
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
