import { Button } from "@/components/ui/button"
import { useParams, useNavigate } from "react-router-dom"
import { Trophy, Clock, ArrowRight, Calendar, Info, Play, Zap } from "lucide-react"
import { RealtimeLeaderboard } from "@/components/domain/leaderboard/realtime-leaderboard"
import { useContestForAttempt, useStartContest, useRegisterContest } from "@/hooks/use-queries"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { VantaLoader } from "@/components/ui/vanta-loader"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

export function ContestPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Ideally use a lighter query, but this works for now
    const { data: contestData, isLoading, error } = useContestForAttempt(id || "")
    const { mutate: startContest, isPending: isStarting } = useStartContest();
    const { mutate: registerContest, isPending: isRegistering } = useRegisterContest();

    const handleEnterContest = () => {
        if (!id) return;

        // If already started, just navigate
        if (contestData?.submission) {
            navigate(`/contest/${id}/attempt`);
            return;
        }

        startContest(id, {
            onSuccess: () => {
                navigate(`/contest/${id}/attempt`);
            },
            onError: (err: any) => {
                const msg = err.response?.data?.error || err.response?.data?.message || "Failed to start contest";
                if (msg.includes("started") || msg.includes("already submitted")) {
                    navigate(`/contest/${id}/attempt`);
                } else {
                    toast.error(msg);
                }
            }
        });
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <VantaLoader text="LOADING CONTEST DATA..." />
            </div>
        )
    }

    if (error || !contestData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
                <h1 className="text-2xl font-bold">Contest not found</h1>
                <Button onClick={() => navigate('/dashboard')}>Go Back Dashboard</Button>
            </div>
        )
    }

    // Determine Contest Status
    const realStart = new Date(contestData.startDate);
    const realEnd = new Date(contestData.endDate);
    const now = new Date();

    let status: "UPCOMING" | "LIVE" | "PAST" = "UPCOMING";
    if (now < realStart) {
        status = "UPCOMING";
    } else if (now > realEnd) {
        status = "PAST";
    } else {
        status = "LIVE";
    }


    return (
        <div className="min-h-screen bg-background text-foreground transition-all duration-300 selection:bg-primary selection:text-white">
            {/* Top Navigation */}
            <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/95 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                            className="gap-2 rounded-lg border-2 border-foreground bg-secondary px-4 font-bold uppercase tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                        >
                            <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={3} />
                            Go to Dashboard
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 rounded-lg border-2 border-foreground bg-yellow-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Trophy className="h-4 w-4 fill-current" />
                            REWARDS ACTIVE
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">

                {/* Hero Card */}
                <div className="relative mb-16 overflow-hidden rounded-[1.5rem] border-2 border-foreground bg-card p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-12 relative z-10">
                        <div className="space-y-6 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <ContestStatusBadge status={status.toLowerCase() as any} />
                                <div className="flex items-center gap-1.5 rounded-lg border border-foreground bg-background px-3 py-1 text-[11px] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    {contestData.questions.reduce((acc: number, q: any) => acc + (q.question.points || 0), 0)} TOTAL PTS
                                </div>
                            </div>

                            <h1 className="font-display text-4xl md:text-6xl font-black leading-tight tracking-tight uppercase">
                                {contestData.title}
                            </h1>

                            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed [&_p]:mb-4 last:[&_p]:mb-0">
                                <ReactMarkdown
                                    rehypePlugins={[rehypeRaw]}
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {contestData.description || ""}
                                </ReactMarkdown>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <div className="flex items-center gap-3 rounded-xl border border-foreground/20 bg-muted/30 px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-tight">{realStart.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-foreground/20 bg-muted/30 px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-tight">
                                        {format(realStart, "HH:mm")} - {format(realEnd, "HH:mm")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-foreground/20 bg-muted/30 px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Info className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-tight">{contestData.questions.length} QUESTIONS</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col items-center gap-4 self-center lg:self-start">
                            {contestData.submission?.status === "COMPLETED" ? (
                                <Button
                                    size="lg"
                                    onClick={() => navigate(`/contest/${id}/result`)}
                                    className="h-16 w-full lg:w-64 rounded-2xl border-2 border-foreground bg-green-500 px-8 text-lg font-bold uppercase tracking-tight text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                    RESULTS <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            ) : (
                                status === "UPCOMING" ? (
                                    contestData?.participant ? (
                                        <Button
                                            size="lg"
                                            disabled={true}
                                            className="h-20 w-full lg:w-72 rounded-2xl border-2 border-foreground bg-secondary px-10 text-xl font-bold uppercase tracking-tight text-secondary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-100"
                                        >
                                            REGISTERED <div className="ml-2 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            onClick={() => id && registerContest(id, {
                                                onSuccess: () => toast.success("Registered successfully!"),
                                                onError: (e: any) => toast.error(e.message || "Failed to register")
                                            })}
                                            disabled={isRegistering}
                                            className="h-20 w-full lg:w-72 rounded-2xl border-2 border-foreground bg-primary px-10 text-xl font-bold uppercase tracking-tight text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isRegistering ? <Loader2 className="h-5 w-5 animate-spin" /> : "REGISTER NOW"}
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        size="lg"
                                        onClick={handleEnterContest}
                                        disabled={isStarting}
                                        className="h-20 w-full lg:w-72 rounded-2xl border-2 border-foreground bg-primary px-10 text-xl font-bold uppercase tracking-tight text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                    >
                                        {isStarting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                STARTING
                                            </div>
                                        ) : (
                                            <>
                                                {contestData.submission ? "RESUME" : "START"} <Play className="ml-2 w-6 h-6 fill-current" />
                                            </>
                                        )}
                                    </Button>
                                )
                            )}
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                                SECURE CONNECTION ESTABLISHED
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-9 w-9 rounded-lg border-2 border-foreground bg-secondary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Info className="w-5 h-5 text-foreground" />
                                </div>
                                <h2 className="font-display text-2xl font-black tracking-tight uppercase">Contest Instructions</h2>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    "Ensure you have a stable internet connection.",
                                    "Contest is only available during the specified time.",
                                    "Your progress is saved automatically during the contest.",
                                    "Use of unauthorized tools or plagiarism is prohibited."
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-5 rounded-xl border border-foreground/10 bg-card p-5 shadow-sm group hover:border-foreground transition-all">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-foreground bg-background font-display text-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            {i + 1}
                                        </div>
                                        <p className="text-base font-bold uppercase tracking-tight text-foreground/80">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-9 w-9 rounded-lg border-2 border-foreground bg-yellow-400 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Trophy className="w-5 h-5 text-foreground fill-current" />
                                </div>
                                <h2 className="font-display text-2xl font-black tracking-tight uppercase">Prizes & Recognition</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="rounded-xl border border-foreground/10 bg-orange-400/5 p-8 flex flex-col items-center text-center gap-4 transition-all hover:border-foreground shadow-sm">
                                    <div className="h-14 w-14 rounded-xl border border-foreground bg-orange-400 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Trophy className="w-7 h-7 text-foreground fill-current" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold uppercase tracking-tight">Top Rankers</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">TOP 3 RANK HOLDERS</p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-foreground/10 bg-blue-400/5 p-8 flex flex-col items-center text-center gap-4 transition-all hover:border-foreground shadow-sm">
                                    <div className="h-14 w-14 rounded-xl border border-foreground bg-blue-400 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Clock className="w-7 h-7 text-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold uppercase tracking-tight">Fastest Finisher</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">FASTEST COMPLETION</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <div className="sticky top-24">
                            <RealtimeLeaderboard contestId={id || ""} contestStatus={status} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ContestStatusBadge({ status }: { status: "live" | "upcoming" | "past" }) {
    if (status === "live") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-400/10 px-3 py-1 text-[11px] font-bold text-red-500 border border-red-400/20">
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
                </span>
                LIVE NOW
            </span>
        )
    }
    if (status === "upcoming") {
        return (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary border border-primary/20">
                UPCOMING
            </span>
        )
    }
    return (
        <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground border border-border">
            ENDED
        </span>
    )
}
