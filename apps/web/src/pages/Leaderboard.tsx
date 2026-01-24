import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Crown, Medal, Trophy, Wifi, WifiOff } from "lucide-react"
import { useLeaderboard } from "@/hooks/use-leaderboard"
import { useContestForAttempt } from "@/hooks/use-queries"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function LeaderboardPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { leaderboard, isConnected } = useLeaderboard(id || "", true)
    const { data: contestData } = useContestForAttempt(id || "")

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="h-6 w-6 text-yellow-500" strokeWidth={3} />;
            case 1: return <Medal className="h-6 w-6 text-slate-400" strokeWidth={3} />;
            case 2: return <Medal className="h-6 w-6 text-amber-700" strokeWidth={3} />;
            default: return <span className="font-mono font-black text-muted-foreground/40 text-sm">#{index + 1}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-all duration-300 selection:bg-primary selection:text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/95 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground transition-all rounded-full border border-transparent hover:border-foreground/10 h-10 px-4"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>

                    <div className="flex items-center gap-3">
                        <Badge variant={isConnected ? "default" : "destructive"} className="text-[10px] font-bold h-6 gap-1.5 px-3 rounded-full border border-foreground shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                            {isConnected ? "LIVE" : "OFFLINE"}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 relative z-10">

                <div className="text-center space-y-4 mb-16">
                    <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                        Global Standing
                    </Badge>
                    <h1 className="font-display text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        Real-time <span className="text-primary">Leaderboard</span>
                    </h1>
                    <p className="text-muted-foreground font-bold italic tracking-tight uppercase text-sm">
                        {contestData?.title || "Arena Mission"} Status
                    </p>
                </div>

                <div className="rounded-[2.5rem] border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-muted/30 border-b-2 border-foreground text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-8">User Operative</div>
                        <div className="col-span-2 text-right">Points</div>
                    </div>

                    <div className="divide-y-2 divide-foreground/5">
                        {leaderboard.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <Crown className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                                <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Waiting for data sync...</p>
                            </div>
                        ) : (
                            leaderboard.map((entry, index) => (
                                <div
                                    key={entry.userId}
                                    className={cn(
                                        "grid grid-cols-12 gap-4 items-center px-8 py-6 transition-colors hover:bg-muted/50",
                                        index < 3 && "bg-primary/[0.02]"
                                    )}
                                >
                                    <div className="col-span-2 flex justify-center">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="col-span-8 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl border-2 border-foreground bg-secondary flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {entry.email?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                                                {entry.email}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Verified Operative</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border-2 border-foreground bg-background font-mono font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {entry.score}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="mt-16 text-center opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                        Dominate the System. Calibrate Success.
                    </p>
                </div>
            </main>
        </div>
    )
}
