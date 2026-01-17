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
            case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 1: return <Medal className="h-5 w-5 text-gray-400" />;
            case 2: return <Medal className="h-5 w-5 text-amber-600" />;
            default: return <span className="font-mono font-bold text-muted-foreground ml-1.5 ">#{index + 1}</span>;
        }
    };

    const Content = () => (
        <div className={cn("flex flex-col", compact ? "h-full" : "max-h-[600px]")}>
            {/* Header for Non-Compact only */}
            {!compact && (
                <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-2">
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <Trophy className="h-5 w-5 text-primary" />
                        {contestStatus === "UPCOMING" ? "Leaderboard" :
                            contestStatus === "PAST" ? "Final Standings" : "Live Leaderboard"}
                    </div>
                    {contestStatus === "LIVE" ? (
                        <Badge variant={isConnected ? "default" : "destructive"} className="text-[10px] h-5 gap-1 px-2">
                            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                            {isConnected ? "LIVE" : "OFFLINE"}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] h-5 gap-1 px-2">
                            {contestStatus === "UPCOMING" ? "UPCOMING" : "ENDED"}
                        </Badge>
                    )}
                </div>
            )}

            {leaderboard.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                    <Users className="h-8 w-8 opacity-20" />
                    <p className="text-sm">
                        {contestStatus === "UPCOMING" ? "Waiting for contest to start..." :
                            contestStatus === "PAST" ? "No data available" : "No participants yet"}
                    </p>
                </div>
            ) : (
                <div className={cn("overflow-y-auto custom-scrollbar", compact ? "flex-1" : "")}>
                    <Table>
                        <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-md z-10">
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="w-[60px] text-center font-bold">Rank</TableHead>
                                <TableHead className="font-bold">User</TableHead>
                                <TableHead className="text-right font-bold w-[100px]">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard.map((entry, index) => (
                                <TableRow
                                    key={entry.userId}
                                    className={cn(
                                        "hover:bg-muted/40 transition-colors border-border/40",
                                        index < 3 && "bg-primary/5"
                                    )}
                                >
                                    <TableCell className="text-center py-3 px-2">
                                        <div className="flex justify-center">{getRankIcon(index)}</div>
                                    </TableCell>
                                    <TableCell className="font-medium py-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {entry.userId.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="truncate max-w-[180px] sm:max-w-[240px] text-xs sm:text-sm" title={entry.userId}>
                                                {entry.userId}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-primary py-3 px-2">
                                        {entry.score}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );

    if (compact) {
        return <Content />;
    }

    return (
        <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm", className)}>
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Trophy className="h-5 w-5 text-primary" />
                        {contestStatus === "UPCOMING" ? "Leaderboard" :
                            contestStatus === "PAST" ? "Final Standings" : "Live Leaderboard"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {contestStatus === "LIVE" ? (
                            <Badge variant={isConnected ? "default" : "destructive"} className="text-[10px] h-5 gap-1 px-2">
                                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                {isConnected ? "LIVE" : "OFFLINE"}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] h-5 gap-1 px-2">
                                {contestStatus === "UPCOMING" ? "UPCOMING" : "ENDED"}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-md z-10">
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="w-[60px] text-center font-bold">Rank</TableHead>
                                <TableHead className="font-bold">User</TableHead>
                                <TableHead className="text-right font-bold w-[100px]">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard.map((entry, index) => (
                                <TableRow
                                    key={entry.userId}
                                    className={cn(
                                        "hover:bg-muted/40 transition-colors border-border/40",
                                        index < 3 && "bg-primary/5"
                                    )}
                                >
                                    <TableCell className="text-center py-3">
                                        <div className="flex justify-center">{getRankIcon(index)}</div>
                                    </TableCell>
                                    <TableCell className="font-medium py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {entry.userId.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="truncate max-w-[120px] md:max-w-[180px]">
                                                {entry.userId}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-primary py-3">
                                        {entry.score}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
