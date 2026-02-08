import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Globe, Shield, Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SettingsView() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">Manage application preferences and view information.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Appearance Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize how PortWarden looks on your device.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Theme</Label>
                                <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
                            </div>
                            <ModeToggle />
                        </div>
                    </CardContent>
                </Card>

                {/* Application Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            About PortWarden
                        </CardTitle>
                        <CardDescription>Version and build information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Version</Label>
                            <Badge variant="outline">v0.1.0</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label>Build Environment</Label>
                            <span className="text-sm text-muted-foreground">Production</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label>License</Label>
                            <span className="text-sm text-muted-foreground">MIT</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Network Info (Mock) */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Network Configuration
                        </CardTitle>
                        <CardDescription>Current network interface settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                            <p className="text-sm font-mono text-muted-foreground">
                                Interface monitoring and advanced network settings will be available in a future update.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
