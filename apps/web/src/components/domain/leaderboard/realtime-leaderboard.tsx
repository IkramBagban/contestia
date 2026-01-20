import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Users, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealtimeLeaderboardProps {
    contestId: string;
    className?: string;
    compact?: boolean; // For modal/sidebar view
    contestStatus?: "UPCOMING" | "LIVE" | "PAST";
}

export function RealtimeLeaderboard({ contestId, className, compact = false, contestStatus = "LIVE" }: RealtimeLeaderboardProps) {
    const { leaderboard, isConnected } = useLeaderboard(contestId, contestStatus === "LIVE");

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="h-4 w-4 text-yellow-500" />;
            case 1: return <Medal className="h-4 w-4 text-slate-400" />;
            case 2: return <Medal className="h-4 w-4 text-amber-700" />;
            default: return <span className="font-mono font-bold text-muted-foreground/50 text-[10px]">#{index + 1}</span>;
        }
    };

    const Content = () => (
        <div className={cn("flex flex-col h-full", compact ? "" : "max-h-[500px]")}>
            {/* Header for Non-Compact only */}
            {!compact && (
                <div className="flex items-center justify-between pb-4 border-b border-foreground/10 mb-4 px-1">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-foreground">
                        <Trophy className="h-4 w-4 text-primary" />
                        {contestStatus === "UPCOMING" ? "Mission Standing" :
                            contestStatus === "PAST" ? "Final Results" : "Live Feed"}
                    </div>
                    {contestStatus === "LIVE" ? (
                        <Badge variant={isConnected ? "default" : "destructive"} className="text-[9px] font-bold h-5 gap-1.5 px-2 rounded-full border border-foreground/10">
                            {isConnected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                            {isConnected ? "CONNECTED" : "OFFLINE"}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-[9px] font-bold h-5 px-2 rounded-full border-foreground/10 uppercase">
                            {contestStatus === "UPCOMING" ? "Awaiting" : "Concluded"}
                        </Badge>
                    )}
                </div>
            )}

            {leaderboard.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                    <div className="h-10 w-10 rounded-xl border-2 border-foreground/10 flex items-center justify-center opacity-20">
                        <Users className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        {contestStatus === "UPCOMING" ? "Awaiting sync..." :
                            contestStatus === "PAST" ? "No records found" : "No operatives active"}
                    </p>
                </div>
            ) : (
                <div className={cn("overflow-y-auto custom-scrollbar flex-1", compact ? "" : "pr-1")}>
                    <div className="space-y-1">
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-foreground/5">
                            <div className="col-span-2 text-center">Rnk</div>
                            <div className="col-span-10 flex justify-between">
                                <span>Operative</span>
                                <span>Points</span>
                            </div>
                        </div>
                        {leaderboard.map((entry, index) => (
                            <div
                                key={entry.userId}
                                className={cn(
                                    "grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl border border-transparent transition-all hover:bg-muted/50 hover:border-foreground/5",
                                    index < 3 && "bg-primary/[0.03]"
                                )}
                            >
                                <div className="col-span-2 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                <div className="col-span-10 flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="shrink-0 h-6 w-6 rounded-lg border border-foreground/10 bg-secondary flex items-center justify-center text-[9px] font-black text-foreground/70">
                                            {entry.userId?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <span className="truncate text-xs font-bold tracking-tight uppercase text-foreground/80" title={entry.userId}>
                                            {entry.userId}
                                        </span>
                                    </div>
                                    <span className="shrink-0 font-mono font-black text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                        {entry.score}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (compact) {
        return <div className={cn("h-full", className)}><Content /></div>;
    }

    return (
        <Card className={cn("overflow-hidden border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] rounded-2xl", className)}>
            <div className="p-5 h-full flex flex-col">
                <Content />
            </div>
        </Card>
    );
}
