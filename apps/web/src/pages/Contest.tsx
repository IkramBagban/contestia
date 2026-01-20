import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useParams, useNavigate } from "react-router-dom"
import { Trophy, Clock, ArrowRight, Calendar, Info, Play } from "lucide-react"
import { RealtimeLeaderboard } from "@/components/domain/leaderboard/realtime-leaderboard"
import { useContestForAttempt, useStartContest } from "@/hooks/use-queries"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ContestPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Ideally use a lighter query, but this works for now
    const { data: contestData, isLoading, error } = useContestForAttempt(id || "")
    const { mutate: startContest } = useStartContest();

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
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-mono">Loading Contest Data...</p>
                </div>
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
    const getContestDates = (c: any) => {
        const start = new Date(c.startDate);
        let realStartDate = new Date(start);

        if (c.startTime && c.startTime.includes(':') && c.startTime.length <= 5) {
            const [startHours, startMinutes] = c.startTime.split(":").map(Number);
            if (!isNaN(startHours) && !isNaN(startMinutes)) {
                realStartDate.setHours(startHours, startMinutes, 0, 0);
            }
        }

        let endDate = new Date(realStartDate);
        if (c.endTime) {
            if (c.endTime.includes('T') || c.endTime.length > 5) {
                const possibleEndDate = new Date(c.endTime);
                if (!isNaN(possibleEndDate.getTime())) {
                    endDate = possibleEndDate;
                }
            } else if (c.endTime.includes(':')) {
                const [endHours, endMinutes] = c.endTime.split(":").map(Number);
                if (!isNaN(endHours) && !isNaN(endMinutes)) {
                    endDate.setHours(endHours, endMinutes, 0, 0);
                    if (endDate < realStartDate) {
                        endDate.setDate(endDate.getDate() + 1);
                    }
                }
            }
        }
        return { start: realStartDate, end: endDate };
    };

    const { start: realStart, end: realEnd } = getContestDates(contestData);
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
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-3xl pointer-events-none" />

            <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all -ml-2 text-muted-foreground" onClick={() => navigate('/dashboard')}>
                                ← Back to Dashboard
                            </Button>
                            <Badge variant="outline" className={cn(
                                "font-mono uppercase tracking-wider text-xs",
                                status === "LIVE" && "border-green-500 text-green-500 animate-pulse",
                                status === "PAST" && "text-muted-foreground"
                            )}>
                                {status === "LIVE" ? "Live Now" : status}
                            </Badge>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-foreground to-foreground/70">
                            {contestData.title}
                        </h1>
                        <div
                            className="text-lg text-muted-foreground leading-relaxed prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: contestData.description }}
                        />

                        <div className="flex flex-wrap gap-6 pt-2 text-sm text-foreground/80 font-medium">
                            <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>{realStart.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>{contestData.startTime} - {contestData.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
                                <Trophy className="w-4 h-4 text-primary" />
                                <span>{contestData.questions.length} Questions</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        {contestData.submission?.status === "COMPLETED" ? (
                            <Button
                                size="lg"
                                onClick={() => navigate(`/contest/${id}/result`)}
                                className="h-14 px-8 rounded-full text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                View Result <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleEnterContest}
                                className="h-14 px-8 rounded-full text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1"
                            >
                                {contestData.submission ? "Continue Attempt" : "Enter Arena"} <Play className="ml-2 w-4 h-4 fill-current" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Instructions */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    Instructions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>
                                    1. Ensure you have a stable internet connection before starting the contest.
                                </p>
                                <p>
                                    2. Access to the contest arena is allowed only during the specified time window.
                                </p>
                                <p>
                                    3. Do not refresh the page frequently during the attempt. Your progress is auto-saved.
                                </p>
                                <p>
                                    4. Any attempt to use unfair means will result in immediate disqualification.
                                </p>
                                <p>
                                    5. Scoring is based on correctness and time of submission.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                            <CardHeader>
                                <CardTitle>Prizes & Rewards</CardTitle>
                                <CardDescription>Top performers will be recognized on the global leaderboard.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center text-center gap-2">
                                        <Trophy className="w-8 h-8 text-orange-500" />
                                        <span className="font-bold text-orange-700 dark:text-orange-300">Top 3</span>
                                        <span className="text-xs text-muted-foreground">Profile Badge</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center text-center gap-2">
                                        <Clock className="w-8 h-8 text-blue-500" />
                                        <span className="font-bold text-blue-700 dark:text-blue-300">Fastest Solver</span>
                                        <span className="text-xs text-muted-foreground">Speed Bonus</span>
                                    </div>
                                    {/* Add more if needed */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Leaderboard */}
                    <div>
                        <RealtimeLeaderboard contestId={id || ""} contestStatus={status} />
                    </div>
                </div>
            </main>
        </div>
    )
}
