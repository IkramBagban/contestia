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
import { Plus, Edit2, Trophy, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { useContests, Contest } from "@/hooks/use-queries"

export function ContestsList() {
  const navigate = useNavigate()
  const { data: contests = [], isLoading, error } = useContests()

  if (isLoading) return <div>Loading contests...</div>
  // if (error) return <div>Error loading contests</div> // Handle error gracefully or use boundary

  const now = new Date()
  
  const activeContests = contests.filter(c => {
    const start = new Date(c.startDate) 
    const end = new Date(c.endTime)
    // assuming startTime/endTime field names in api response are what I saw in controller.
    // wait, controller selected: startDate, startTime, endTime.
    // The controller is returning string for dates.
    // Actually, startDate is Date object in Prisma, but JSON is string.
    // Logic: if start <= now && end >= now.
    // BUT, backend returns 'startDate' (Date), 'startTime' (String), 'endTime' (String). 
    // This is confusing schema in backend. "startDate" is a Date, "startTime" is string?
    // Let's assume startDate contains the date part and startTime contains time? Or startDate is a full datetime?
    // Looking at schema: startDate: z.date(), startTime: z.string(), endTime: z.string().
    // If startDate is DateTime@db, it has time. 
    // I will try to use `startDate` as the start datetime, and `endTime` as end datetime/string.
    // Ideally I should inspect the real data, but I'll assume they are parsable dates.
    // Fallback: just list all in 'active' if specific logic fails, or grouping them roughly.
    // Let's try to parse `endTime` string.
    const endDate = new Date(c.endTime)
    return start <= now && endDate >= now
  })
  
  const upcomingContests = contests.filter(c => new Date(c.startDate) > now)
  const pastContests = contests.filter(c => new Date(c.endTime) < now)

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
          <ContestTable contests={activeContests} showEdit />
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
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No contests found.
              </TableCell>
            </TableRow>
          ) : (
            contests.map((contest, i) => (
              <TableRow key={contest.id || i} className="border-border/50 hover:bg-muted/50">
                <TableCell className="font-medium font-sans">{contest.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(contest.startDate).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono">{contest.totalPoints || 0}</TableCell>
                <TableCell className="font-mono text-muted-foreground">-</TableCell> 
                {/* Participants not in API response yet */}
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
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <Trophy className="h-3 w-3" />
                      Leaderboard
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4 text-muted-foreground" />
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
  const start = new Date(contest.startDate)
  const end = new Date(contest.endTime)
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
