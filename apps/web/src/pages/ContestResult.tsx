import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useContestForAttempt } from "@/hooks/use-queries";
import {
    Trophy,
    CheckCircle2,
    XCircle,
    Circle,
    ArrowLeft,
    LayoutDashboard,
    TrendingUp,
    Zap,
    BarChart3,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const ContestResultPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: contestData, isLoading, error, refetch } = useContestForAttempt(id || "");

    // Force a refetch on mount to ensure we have the most recent submission status
    useEffect(() => {
        if (id) refetch();
    }, [id, refetch]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background transform transition-all duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-xl border-4 border-foreground" />
                    <p className="font-display font-black italic uppercase tracking-widest text-muted-foreground">Finalizing Mission...</p>
                </div>
            </div>
        );
    }

    if (error || !contestData) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
                <div className="h-20 w-20 rounded-2xl border-2 border-foreground bg-destructive/10 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <XCircle className="h-10 w-10 text-destructive" strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-2">Sync Error</h1>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">Your performance data couldn't be synchronized. The arena connection is unstable.</p>
                <Button onClick={() => navigate("/dashboard")} className="h-14 rounded-xl border-2 border-foreground bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all">
                    Return to Hub
                </Button>
            </div>
        );
    }

    const submission = contestData.submission;
    const totalQuestions = contestData.questions.length;
    const totalPoints = contestData.questions.reduce((acc: number, q: any) => acc + (q.question.points || 10), 0);
    const userScore = submission?.score || 0;

    const answersMap = (submission?.answers as Record<string, any>) || {};
    const stats = contestData.questions.reduce((acc: any, q: any) => {
        const questionId = q.question.id;
        const entry = answersMap[questionId];
        if (!entry) {
            acc.unattempted++;
        } else if (entry.isCorrect === true) {
            acc.correct++;
        } else {
            acc.incorrect++;
        }
        return acc;
    }, { correct: 0, incorrect: 0, unattempted: 0 });

    const accuracy = totalQuestions > 0 ? Math.round((stats.correct / totalQuestions) * 100) : 0;

    return (
        <div className="min-h-screen bg-background text-foreground transition-all duration-300 selection:bg-primary selection:text-white">

            <header className="sticky top-0 z-30 border-b-2 border-foreground bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm font-black uppercase italic tracking-tighter text-muted-foreground hover:text-foreground transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Exit Arena
                    </Link>
                    <div className="flex items-center gap-3 px-3 py-1 bg-yellow-400 border-2 border-foreground rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Verified Submission</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">

                {/* Result Hero */}
                <div className="relative overflow-hidden rounded-[2rem] border-2 border-foreground bg-card p-8 sm:p-14 mb-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] group">
                    <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] pointer-events-none transition-opacity group-hover:opacity-100" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="text-center md:text-left space-y-6">
                            <Badge className="bg-primary hover:bg-primary text-primary-foreground border-2 border-foreground px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                Ranked Match Over
                            </Badge>
                            <h1 className="font-display text-5xl sm:text-7xl font-black italic tracking-tighter leading-none uppercase">
                                Mission <br /> <span className="text-primary">Accomplished.</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-bold max-w-md italic tracking-tight">
                                Data extraction for <span className="text-foreground underline decoration-primary decoration-4 underline-offset-4">{contestData.title}</span> complete.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-10">
                            <div className="relative">
                                {/* <div className="flex flex-col items-center justify-center h-44 w-44 rounded-full border-[10px] border-muted border-t-primary shadow-xl">
                                    <span className="text-5xl font-black italic tracking-tighter">{accuracy}%</span>
                                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Accuracy</span>
                                </div> */}
                                <div className="absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-yellow-400 border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                                    <Trophy className="h-6 w-6 text-foreground" strokeWidth={3} />
                                </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-start space-y-2">
                                <div className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Final Standing</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-8xl font-black text-foreground tabular-nums tracking-tighter">{userScore}</span>
                                    <span className="text-3xl font-black text-muted-foreground">/{totalPoints}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    <div className="lg:col-span-8 space-y-12">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {[
                                { label: 'Correct', value: stats.correct, color: 'text-green-500', bg: 'bg-green-500/10', borderColor: 'border-green-500' },
                                { label: 'Incorrect', value: stats.incorrect, color: 'text-red-500', bg: 'bg-red-500/10', borderColor: 'border-red-500' },
                                { label: 'Skipped', value: stats.unattempted, color: 'text-zinc-500', bg: 'bg-zinc-500/10', borderColor: 'border-foreground/20' }
                            ].map((s, idx) => (
                                <div key={idx} className={cn(
                                    "bg-card border-2 rounded-2xl p-8 flex items-center justify-between group transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]",
                                    s.borderColor,
                                    idx !== 2 && "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                                )}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{s.label}</p>
                                        <p className={cn("text-4xl font-black tabular-nums italic", s.color)}>{s.value}</p>
                                    </div>
                                    <div className={cn("h-14 w-14 rounded-xl border-2 border-foreground flex items-center justify-center transition-transform group-hover:rotate-6", s.bg)}>
                                        {s.label === 'Correct' ? <CheckCircle2 className={cn("h-8 w-8", s.color)} strokeWidth={3} /> :
                                            s.label === 'Incorrect' ? <XCircle className={cn("h-8 w-8", s.color)} strokeWidth={3} /> :
                                                <Circle className={cn("h-8 w-8", s.color)} strokeWidth={3} />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Performance Review */}
                        <div className="space-y-8">
                            <h2 className="font-display text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <BarChart3 className="h-10 w-10 text-primary" strokeWidth={3} />
                                Breakdown
                            </h2>

                            <div className="space-y-4">
                                {contestData.questions.map((q: any, idx: number) => {
                                    const qData = q.question;
                                    const submissionEntry = answersMap[qData.id];
                                    const isCorrect = submissionEntry?.isCorrect === true;
                                    const isAttempted = !!submissionEntry;

                                    return (
                                        <div key={qData.id} className={cn(
                                            "group relative overflow-hidden rounded-[1.5rem] border-2 border-foreground bg-card transition-all p-6 pl-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0_rgba(255,255,255,1)]",
                                            isAttempted ? (isCorrect ? "bg-green-50/10" : "bg-red-50/10") : ""
                                        )}>
                                            {/* Left indicator bar */}
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-3 border-r-2 border-foreground",
                                                isAttempted
                                                    ? isCorrect ? "bg-green-500" : "bg-red-500"
                                                    : "bg-muted"
                                            )} />

                                            <div className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-8">
                                                    <span className="text-xl font-black text-muted-foreground/30 font-mono tracking-tighter italic italic">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                    <div>
                                                        <h4 className="text-xl font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors line-clamp-1">{qData.title}</h4>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <Badge variant="outline" className="border-2 border-foreground rounded-lg font-black text-[9px] uppercase transition-colors group-hover:bg-foreground group-hover:text-background">
                                                                {qData.type}
                                                            </Badge>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">
                                                                {Number(submissionEntry?.points || 0)} / {qData.points} Pts Earned
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    {isAttempted ? (
                                                        isCorrect ? (
                                                            <CheckCircle2 className="h-8 w-8 text-green-500" strokeWidth={3} />
                                                        ) : (
                                                            <XCircle className="h-8 w-8 text-red-500" strokeWidth={3} />
                                                        )
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 italic">Skipped</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8 sticky top-32 h-fit">
                        <div className="rounded-[2.5rem] border-2 border-foreground bg-card p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                            <h3 className="font-display text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <TrendingUp className="h-8 w-8 text-primary" strokeWidth={3} />
                                Navigate
                            </h3>

                            <div className="space-y-5">
                                <Button
                                    onClick={() => navigate(`/leaderboard/${id}`)}
                                    className="w-full h-16 rounded-2xl border-2 border-foreground bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase tracking-tighter text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-between px-8 group"
                                >
                                    Leaderboard
                                    <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" strokeWidth={3} />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/dashboard")}
                                    className="w-full h-16 rounded-2xl border-2 border-foreground bg-background text-foreground font-black italic uppercase tracking-tighter text-xl hover:bg-accent ring-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-between px-8"
                                >
                                    Dashboard
                                    <LayoutDashboard className="h-6 w-6" strokeWidth={3} />
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-[2.5rem] border-2 border-dashed border-foreground bg-muted/40 p-8">
                            <Zap className="h-10 w-10 text-primary mb-6 animate-pulse" strokeWidth={3} />
                            <h4 className="font-black text-sm mb-3 uppercase tracking-[0.2em] italic">Growth Metric</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed font-bold italic">
                                Performance is an iterative process. Every completed mission adds to your global leverage. Check your standing to calibrate your path.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <footer className="mt-32 pt-12 border-t-2 border-foreground flex flex-col sm:flex-row items-center justify-between gap-6 opacity-60 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary border-2 border-foreground" />
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Contestia Secure Terminal</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">© {new Date().getFullYear()} Operation Success</p>
                </footer>

            </main>
        </div>
    );
};
