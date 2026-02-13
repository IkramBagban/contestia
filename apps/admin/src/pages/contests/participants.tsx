import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect } from "react"
import { ArrowLeft, Users, BadgeCheck } from "lucide-react"
import { useContestParticipants, useContest, useMe } from "@/hooks/use-queries"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ParticipantsPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { data: user } = useMe()
    const { data: contest } = useContest(id || "")
    const { data: participants = [], isLoading } = useContestParticipants(id || "")

    useEffect(() => {
        if (contest && user && contest.userId !== user.id) {
            navigate('/contests');
        }
    }, [contest, user, navigate]);

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (user && contest && contest.userId !== user.id) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Participants</h2>
                    <p className="text-muted-foreground">Manage and view contest participants.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Registered Users ({participants.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead>User ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Registered At</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right">Rank</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : participants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No participants found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                participants.map((p: any) => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <Badge variant={p.status === "DISQUALIFIED" ? "destructive" : p.status === "PARTICIPATING" ? "default" : "secondary"}>
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{p.userId}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {p.user?.email || "Unknown"}
                                                {p.status !== "DISQUALIFIED" && <BadgeCheck className="h-3 w-3 text-blue-500" />}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(p.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(p.updatedAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-mono font-bold">{p.score}</TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                            {p.rank || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
