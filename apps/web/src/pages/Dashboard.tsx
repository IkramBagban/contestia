import { useState } from "react";
import { useContests, useLogout, useMe, useStartContest } from "@/hooks/use-queries";
import {
    Loader2, LogOut, Trophy, Calendar, Clock, ArrowRight,
    LayoutDashboard, Bell, Zap, CheckCircle2, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format, isPast, isFuture, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";

export function DashboardPage() {
    const { data: contestsRaw, isLoading: isLoadingContests } = useContests();
    const { mutate: logout } = useLogout();
    const { data: user, isLoading: isLoadingUser } = useMe();
    const { mutate: startContest } = useStartContest();
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
        startContest(contestId, {
            onSuccess: () => {
                navigate(`/contest/${contestId}/attempt`);
            },
            onError: (err: any) => {
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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

            {/* Top Navigation */}
            <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Contestia Logo" className="h-8 w-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <span className="font-display text-lg font-bold">Contestia</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <div className="h-8 w-[1px] bg-border"></div>
                        <div className="flex items-center gap-3">
                            <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">

                <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="font-display text-3xl font-bold tracking-tight">Contests</h1>

                    {/* Custom Tabs */}
                    <div className="flex rounded-full border border-border bg-card p-1">
                        {(["live", "upcoming", "past"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "rounded-full px-5 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    activeTab === tab
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {tab === 'live' ? 'Live Now' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {displayedContests.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center animate-fade-in">
                            <div className="mb-4 rounded-full bg-muted p-3">
                                <Trophy className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No {activeTab === 'live' ? 'live' : activeTab} contests found</h3>
                            <p className="max-w-sm text-sm text-muted-foreground">Check other tabs or come back later for more challenges.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
                            {displayedContests.map((contest: any) => (
                                <div
                                    key={contest.id}
                                    onClick={() => navigate(`/contest/${contest.id}`)}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 transition-opacity group-hover:opacity-10">
                                        <Trophy className="h-24 w-24 text-primary rotate-12" />
                                    </div>

                                    <div className="relative z-10">
                                        <ContestStatusBadge status={activeTab} />

                                        <h3 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                                            {contest.title}
                                        </h3>

                                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-primary/70" />
                                                <span>{format(new Date(contest.startDate), "MMM d")}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-primary/70" />
                                                <span>
                                                    {format(new Date(contest.startDate), "HH:mm")} -
                                                    {contest.endTime && contest.endTime.includes('T') ? format(new Date(contest.endTime), "HH:mm") : contest.endTime}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Trophy className="h-4 w-4 text-yellow-500/80" />
                                                <span>{contest.totalPoints} Pts</span>
                                            </div>
                                        </div>

                                        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground/80 leading-relaxed font-normal">
                                            {contest.description?.replace(/<[^>]*>?/gm, "") || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="relative z-10 mt-8 pt-6 border-t border-border/50">
                                        {activeTab === "live" ? (
                                            <Button
                                                className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground shadow-lg shadow-primary/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEnterContest(contest.id);
                                                }}
                                            >
                                                Enter Arena
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        ) : activeTab === "past" ? (
                                            <Button variant="outline" className="w-full gap-2 cursor-not-allowed opacity-70" disabled>
                                                Ended <LockIcon className="h-3 w-3" />
                                            </Button>
                                        ) : (
                                            <Button variant="secondary" className="w-full cursor-not-allowed opacity-80" disabled>
                                                Starts Soon
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 ring-1 ring-insert ring-red-500/20">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
                LIVE NOW
            </span>
        )
    }
    if (status === "upcoming") {
        return (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary ring-1 ring-insert ring-primary/20">
                UPCOMING
            </span>
        )
    }
    return (
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground ring-1 ring-insert ring-border">
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}
