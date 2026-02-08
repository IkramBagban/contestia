import { useState } from "react";
import { useContests, useLogout, useMe, useStartContest } from "@/hooks/use-queries";
import {
    Loader2, LogOut, Trophy, Calendar, Clock, ArrowRight,
    Bell, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format, isPast, isFuture, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { VantaLoader } from "@/components/ui/vanta-loader";

export function DashboardPage() {
    const { data: contestsRaw, isLoading: isLoadingContests } = useContests();
    const { mutate: logout } = useLogout();
    const { data: user, isLoading: isLoadingUser } = useMe();
    const { mutate: startContest, isPending: isStarting } = useStartContest();
    const [startingId, setStartingId] = useState<string | null>(null);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "past">("live");

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                toast.success("Logged out successfully");
                navigate("/login");
            },
        });
    };

    const handleEnterContest = (contestId: string) => {
        setStartingId(contestId);
        startContest(contestId, {
            onSuccess: () => {
                navigate(`/contest/${contestId}/attempt`);
            },
            onError: (err: any) => {
                setStartingId(null);
                const msg = err.response?.data?.error || err.response?.data?.message || "Failed to start contest";
                // Allow re-entry if already started
                if (msg.includes("started") || msg.includes("already submitted")) {
                    navigate(`/contest/${contestId}/attempt`);
                } else {
                    toast.error(msg);
                }
            }
        });
    }

    const isLoading = isLoadingContests || isLoadingUser;

    // Derive Contest Status Lists
    const contests = contestsRaw || [];
    const now = new Date();

    // Helper to parse Dates properly
    const getContestDates = (c: any) => {
        // startDate from Prisma is usually a full ISO string
        const start = new Date(c.startDate);

        let realStartDate = new Date(start);
        // Try to use startTime if available and valid HH:mm
        if (c.startTime && c.startTime.includes(':') && c.startTime.length <= 5) {
            const [startHours, startMinutes] = c.startTime.split(":").map(Number);
            if (!isNaN(startHours) && !isNaN(startMinutes)) {
                const dayStart = new Date(start);
                dayStart.setHours(startHours, startMinutes, 0, 0);
                realStartDate = dayStart;
            }
        }

        let endDate = new Date(realStartDate);
        // Try to parse endTime. It might be a full date string or just HH:mm
        if (c.endTime) {
            if (c.endTime.includes('T') || c.endTime.length > 5) {
                // Likely a full ISO string (e.g. from datetime-local input)
                const possibleEndDate = new Date(c.endTime);
                if (!isNaN(possibleEndDate.getTime())) {
                    endDate = possibleEndDate;
                }
            } else if (c.endTime.includes(':')) {
                // HH:mm format
                const [endHours, endMinutes] = c.endTime.split(":").map(Number);
                if (!isNaN(endHours) && !isNaN(endMinutes)) {
                    // Assume end time is on the SAME DAY as start time
                    // (This logic matches original intent if endTime is just time)
                    endDate = new Date(realStartDate);
                    endDate.setHours(endHours, endMinutes, 0, 0);

                    // Handle crossover (ends next day) if end time < start time?
                    // Simple logic for now: if end < start, maybe add a day, but usually contests > 0 duration
                    if (endDate < realStartDate) {
                        endDate.setDate(endDate.getDate() + 1);
                    }
                }
            }
        } else {
            // Fallback if no endTime, assume 1 hour or end of day?
            // Let's set it to end of day to be safe or 1 hour duration
            endDate.setHours(23, 59, 59, 999);
        }

        return { start: realStartDate, end: endDate };
    }

    const liveContests = contests.filter((c: any) => {
        const { start, end } = getContestDates(c);
        return isWithinInterval(now, { start, end });
    });

    const upcomingContests = contests.filter((c: any) => {
        const { start } = getContestDates(c);
        return isFuture(start);
    });

    const pastContests = contests.filter((c: any) => {
        const { end } = getContestDates(c);
        return isPast(end);
    });

    // Decide what to show based on tab
    const displayedContests =
        activeTab === "live" ? liveContests :
            activeTab === "upcoming" ? upcomingContests :
                pastContests;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <VantaLoader text="SYNCING CONTESTS..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-all duration-300 selection:bg-primary selection:text-white">

            {/* Top Navigation */}
            <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/95 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <img src="image.png" alt="Contestia Logo" className="w-12 h-12" />

                        <span className="font-display text-xl font-bold tracking-tight uppercase">Contestia</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-all rounded-full">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <div className="h-6 w-[1px] bg-foreground/10 mx-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="hidden flex-col items-end sm:flex leading-tight text-right">
                                <span className="text-sm font-bold tracking-tight">{user?.name}</span>
                                <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Global Rank #12</span>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground bg-secondary text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="hover:bg-destructive/10 hover:text-destructive rounded-full transition-all"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">

                <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-block rounded-md border border-foreground bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] mb-1">
                            Ready to Code
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
                            Available Contests
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg max-w-xl">
                            Select a contest and showcase your skills.
                        </p>
                    </div>

                    {/* Soft Neo-Brutalist Tabs */}
                    <div className="flex p-1 gap-1.5 rounded-xl border border-foreground/20 bg-muted/30">
                        {(["live", "upcoming", "past"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "rounded-lg px-6 py-2 text-[11px] font-bold uppercase tracking-wider transition-all outline-none",
                                    activeTab === tab
                                        ? "bg-background text-foreground border border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                {tab === 'live' ? 'Live Now' : tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {displayedContests.length === 0 ? (
                        <div className="flex h-80 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-foreground/10 bg-muted/5 p-12 text-center animate-fade-in shadow-sm">
                            <div className="mb-6 rounded-2xl border border-foreground bg-background p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Trophy className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">No Contests</h3>
                            <p className="max-w-md text-muted-foreground font-medium uppercase tracking-tight">There are no active contests at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
                            {displayedContests.map((contest: any) => (
                                <div
                                    key={contest.id}
                                    onClick={() => navigate(`/contest/${contest.id}`)}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-foreground bg-card transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] shadow-sm cursor-pointer"
                                >
                                    <div className="p-8 pb-4">
                                        <div className="flex items-center justify-between mb-6">
                                            <ContestStatusBadge status={activeTab} />
                                            <div className="flex items-center gap-1.5 rounded-md border border-foreground bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                                <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                {contest.totalPoints} PTS
                                            </div>
                                        </div>

                                        <h3 className="font-display text-2xl font-black leading-tight tracking-tight uppercase group-hover:text-primary transition-colors mb-4 break-words">
                                            {contest.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-foreground/10 bg-muted/50">
                                                <Calendar className="h-3 w-3" />
                                                <span>{format(new Date(contest.startDate), "MMM d")}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-foreground/10 bg-primary/5 text-primary">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {format(new Date(contest.startDate), "HH:mm")} -
                                                    {contest.endTime && contest.endTime.includes('T') ? format(new Date(contest.endTime), "HH:mm") : contest.endTime}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="line-clamp-3 text-sm text-foreground/70 leading-relaxed font-medium">
                                            {contest.description?.replace(/<[^>]*>?/gm, "") || "No description available for this contest."}
                                        </p>
                                    </div>

                                    <div className="p-6 pt-2">
                                        {activeTab === "live" ? (
                                            <Button
                                                className="h-12 w-full justify-between rounded-xl border border-foreground bg-primary px-6 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEnterContest(contest.id);
                                                }}
                                                disabled={isStarting && startingId === contest.id}
                                            >
                                                {isStarting && startingId === contest.id ? (
                                                    <div className="flex w-full items-center justify-center gap-2">
                                                        <span>Starting...</span>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        Enter Contest
                                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </>
                                                )}
                                            </Button>
                                        ) : activeTab === "past" ? (
                                            <Button variant="outline" className="h-12 w-full gap-2 rounded-xl border border-foreground/20 bg-muted/10 text-[10px] font-bold uppercase tracking-widest opacity-60 cursor-not-allowed" disabled>
                                                Ended <LockIcon className="h-3.5 w-3.5" />
                                            </Button>
                                        ) : (
                                            <Button variant="secondary" className="h-12 w-full gap-2 rounded-xl border border-foreground/10 bg-secondary/50 text-[10px] font-bold uppercase tracking-widest opacity-80 cursor-not-allowed" disabled>
                                                Upcoming
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}



function ContestStatusBadge({ status }: { status: "live" | "upcoming" | "past" }) {
    if (status === "live") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-400/10 px-2.5 py-1 text-[10px] font-bold text-red-500 border border-red-400/20">
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
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary border border-primary/20">
                UPCOMING
            </span>
        )
    }
    return (
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground border border-border">
            ENDED
        </span>
    )
}

function LockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

