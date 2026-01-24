import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit2, Trophy, Eye, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { useContests, type Contest } from "@/hooks/use-queries"

export function ContestsList() {
  const navigate = useNavigate()
  const { data: contests = [], isLoading, error } = useContests()

  if (isLoading) return <div>Loading contests...</div>
  // if (error) return <div>Error loading contests</div> // Handle error gracefully or use boundary

  const now = new Date()

  const activeContests = contests.filter(c => {
    const { start, end } = getContestDates(c)
    return start <= now && end >= now
  })

  const upcomingContests = contests.filter(c => {
    const { start } = getContestDates(c)
    return start > now
  })

  const pastContests = contests.filter(c => {
    const { end } = getContestDates(c)
    return end < now
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contests</h2>
          <p className="text-muted-foreground">Manage your coding battles.</p>
        </div>
        <Button onClick={() => navigate("/contests/new")} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Create New
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList>
            <TabsTrigger value="all">All ({contests.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeContests.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingContests.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastContests.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          <ContestTable contests={contests} showEdit />
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <ContestTable contests={activeContests} showEdit showLeaderboard />
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <ContestTable contests={upcomingContests} showEdit />
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <ContestTable contests={pastContests} showLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContestTable({
  contests,
  showEdit = false,
  showLeaderboard = false
}: {
  contests: Contest[],
  showEdit?: boolean,
  showLeaderboard?: boolean
}) {
  const navigate = useNavigate()
  return (
    <div className="rounded-md border border-border/50 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-muted/50">
            <TableHead>Contest Name</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No contests found.
              </TableCell>
            </TableRow>
          ) : (
            contests.map((contest, i) => (
              <TableRow key={contest.id || i} className="border-border/50 hover:bg-muted/50">
                <TableCell className="font-medium font-sans">{contest.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(contest.startDate).toLocaleDateString()} {contest.startTime}
                </TableCell>
                <TableCell className="font-mono">{contest.totalPoints || 0}</TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  -
                </TableCell>
                <TableCell>
                  <StatusBadge contest={contest} />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {showEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => contest.id && navigate(`/contests/edit/${contest.id}`)}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  {showLeaderboard && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs"
                      onClick={() => contest.id && navigate(`/contests/${contest.id}`)}
                    >
                      <Trophy className="h-3 w-3" />
                      Leaderboard
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => contest.id && navigate(`/contests/${contest.id}`)}
                    title="View Leaderboard"
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => contest.id && navigate(`/contests/${contest.id}/participants`)}
                    title="View Participants"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function StatusBadge({ contest }: { contest: Contest }) {
  const now = new Date()
  const { start, end } = getContestDates(contest)

  let status = 'upcoming'
  if (now > end) status = 'past'
  else if (now >= start && now <= end) status = 'active'

  const styles = {
    active: "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20",
    upcoming: "bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/20",
    past: "bg-muted text-muted-foreground hover:bg-muted/80 border-border/50",
  }

  const labels = {
    active: "Live Now",
    upcoming: "Upcoming",
    past: "Finished",
  }

  // @ts-ignore
  const style = styles[status] || styles.past
  // @ts-ignore
  const label = labels[status] || status

  return (
    <Badge variant="outline" className={`${style} border`}>
      {label}
    </Badge>
  )
}

function getContestDates(contest: Contest) {
  const date = new Date(contest.startDate);

  const start = new Date(date);
  if (contest.startTime) {
    const [sH, sM] = contest.startTime.split(':').map(Number);
    if (!isNaN(sH)) start.setHours(sH, sM || 0, 0, 0);
  } else {
    start.setHours(0, 0, 0, 0);
  }

  const end = new Date(date);
  if (contest.endTime) {
    const [eH, eM] = contest.endTime.split(':').map(Number);
    if (!isNaN(eH)) end.setHours(eH, eM || 0, 0, 0);
    else end.setHours(23, 59, 59, 999); // Default to end of day?
  } else {
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}
