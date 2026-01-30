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
                    <p className="font-display font-black italic uppercase tracking-widest text-muted-foreground">Finalizing Submission...</p>
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
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">Your score couldn't be synchronized. Please check your connection.</p>
                <Button onClick={() => navigate("/dashboard")} className="h-14 rounded-xl border-2 border-foreground bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all">
                    Go to Dashboard
                </Button>
            </div>
        );
    }

    const submission = contestData.submission;
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

    return (
        <div className="min-h-screen bg-background text-foreground transition-all duration-300 selection:bg-primary selection:text-white">

            <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/95 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <Link to="/dashboard" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Exit
                    </Link>
                    <div className="flex items-center gap-2.5 px-3 py-1 bg-yellow-400 border border-foreground rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">Verified Submission</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">

                {/* Result Hero */}
                <div className="relative overflow-hidden rounded-[1.5rem] border-2 border-foreground bg-card p-8 sm:p-12 mb-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] group">
                    <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="text-center md:text-left space-y-6">
                            <Badge className="bg-primary hover:bg-primary text-primary-foreground border border-foreground px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                Contest Completed
                            </Badge>
                            <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-tight uppercase">
                                Contest <br /> <span className="text-primary">Completed.</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium max-w-md tracking-tight">
                                Results for <span className="text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">{contestData.title}</span>.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-10">
                            <div className="relative">
                                <div className="absolute -top-4 -right-4 h-11 w-11 rounded-xl bg-yellow-400 border border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Trophy className="h-5 w-5 text-foreground" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-start space-y-1">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Final Score</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-7xl font-black text-foreground tabular-nums tracking-tighter">{userScore}</span>
                                    <span className="text-2xl font-bold text-muted-foreground">/{totalPoints}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    <div className="lg:col-span-8 space-y-12">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: 'Correct', value: stats.correct, color: 'text-green-600', bg: 'bg-green-50', borderColor: 'border-green-200' },
                                { label: 'Incorrect', value: stats.incorrect, color: 'text-red-600', bg: 'bg-red-50', borderColor: 'border-red-200' },
                                { label: 'Skipped', value: stats.unattempted, color: 'text-muted-foreground', bg: 'bg-muted/30', borderColor: 'border-foreground/5' }
                            ].map((s, idx) => (
                                <div key={idx} className={cn(
                                    "bg-card border rounded-xl p-6 flex items-center justify-between group transition-all shadow-sm",
                                    s.borderColor,
                                    idx !== 2 && "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border-foreground/10"
                                )}>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                                        <p className={cn("text-3xl font-black tabular-nums", s.color)}>{s.value}</p>
                                    </div>
                                    <div className={cn("h-11 w-11 rounded-lg border border-foreground/10 flex items-center justify-center transition-transform group-hover:scale-105", s.bg)}>
                                        {s.label === 'Correct' ? <CheckCircle2 className={cn("h-6 w-6", s.color)} /> :
                                            s.label === 'Incorrect' ? <XCircle className={cn("h-6 w-6", s.color)} /> :
                                                <Circle className={cn("h-6 w-6", s.color)} />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Performance Review */}
                        <div className="space-y-6">
                            <h2 className="font-display text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                                <BarChart3 className="h-8 w-8 text-primary" />
                                Breakdown
                            </h2>

                            <div className="space-y-3">
                                {contestData.questions.map((q: any, idx: number) => {
                                    const qData = q.question;
                                    const submissionEntry = answersMap[qData.id];
                                    const isCorrect = submissionEntry?.isCorrect === true;
                                    const isAttempted = !!submissionEntry;

                                    return (
                                        <div key={qData.id} className={cn(
                                            "group relative overflow-hidden rounded-xl border border-foreground/10 bg-card transition-all p-5 pl-10 shadow-sm hover:border-foreground/20 hover:shadow-md",
                                            isAttempted ? (isCorrect ? "bg-green-50/5" : "bg-red-50/5") : ""
                                        )}>
                                            {/* Left indicator bar */}
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-2.5 border-r border-foreground/5",
                                                isAttempted
                                                    ? isCorrect ? "bg-green-500" : "bg-red-500"
                                                    : "bg-muted"
                                            )} />

                                            <div className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    <span className="text-lg font-black text-muted-foreground/20 font-mono tracking-tighter">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                    <div>
                                                        <h4 className="text-lg font-bold uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">{qData.title}</h4>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <div className="border border-foreground/10 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-muted/50">
                                                                {qData.type}
                                                            </div>
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                                                                {Number(submissionEntry?.points || 0)} / {qData.points} Pts Earned
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    {isAttempted ? (
                                                        isCorrect ? (
                                                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-6 w-6 text-red-500" />
                                                        )
                                                    ) : (
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-30">Skipped</span>
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
                    <div className="lg:col-span-4 space-y-8 sticky top-28 h-fit">
                        <div className="rounded-3xl border border-foreground/10 bg-muted/20 p-8 shadow-sm">
                            <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-8 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Navigate
                            </h3>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => navigate(`/leaderboard/${id}`)}
                                    className="w-full h-14 rounded-xl border border-foreground bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-tight text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-between px-6 group"
                                >
                                    Leaderboard
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/dashboard")}
                                    className="w-full h-14 rounded-xl border border-foreground bg-background text-foreground font-bold uppercase tracking-tight text-lg hover:bg-accent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-between px-6"
                                >
                                    Dashboard
                                    <LayoutDashboard className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-dashed border-foreground/20 bg-muted/10 p-6">
                            <Zap className="h-8 w-8 text-primary/50 mb-4" />
                            <h4 className="font-bold text-[10px] mb-2 uppercase tracking-widest">Growth Metric</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                Learning and improving is a continuous process. Every contest helps you grow as a developer. Keep practicing!
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <footer className="mt-32 pt-12 border-t border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-40 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Contestia Secure Platform</span>
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">© {new Date().getFullYear()} Operation Success</p>
                </footer>

            </main>
        </div>
    );
};
