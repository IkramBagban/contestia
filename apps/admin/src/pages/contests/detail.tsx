import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useContest, useMe } from "@/hooks/use-queries";
import { RealtimeLeaderboard } from "@/components/domain/leaderboard/realtime-leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Trophy } from "lucide-react";

export function ContestDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user } = useMe();
    const { data: contest, isLoading, error } = useContest(id || "");

    useEffect(() => {
        if (contest && user && contest.userId !== user.id) {
            navigate('/contests');
        }
    }, [contest, user, navigate]);

    if (isLoading) return <div className="p-8">Loading contest details...</div>;
    if (error || !contest) return <div className="p-8 text-destructive">Error loading contest.</div>;

    if (user && contest.userId !== user.id) return null;

    // Determine Status
    const now = new Date();
    const startDate = new Date(contest.startDate);
    const [endH, endM] = contest.endTime.split(':').map(Number);
    const endDate = new Date(startDate);
    endDate.setHours(endH, endM, 0, 0);

    let status: "UPCOMING" | "LIVE" | "PAST" = "UPCOMING";
    if (now < startDate) status = "UPCOMING";
    else if (now > endDate) status = "PAST";
    else status = "LIVE";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/contests')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{contest.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Badge variant={status === "LIVE" ? "default" : "secondary"}>
                            {status}
                        </Badge>
                        <span className="text-sm font-mono">{contest.id}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Available Info Card */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contest Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Date</span>
                                        <span className="font-medium text-sm">
                                            {new Date(contest.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Time</span>
                                        <span className="font-medium text-sm">
                                            {contest.startTime} - {contest.endTime}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <Trophy className="h-5 w-5 text-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Questions</span>
                                        <span className="font-medium text-sm">
                                            {contest.questions.length} Items
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-bold mb-2">Description</h3>
                                <div
                                    className="prose prose-sm max-w-none text-muted-foreground"
                                    dangerouslySetInnerHTML={{ __html: contest.description }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Leaderboard Column */}
                <div>
                    <RealtimeLeaderboard contestId={id || ""} contestStatus={status} />
                </div>
            </div>
        </div>
    );
}
