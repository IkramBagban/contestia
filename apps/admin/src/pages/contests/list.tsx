// Mock data for initial development
const MOCK_CONTESTS = [
  {
    id: "1",
    title: "Weekly Contest 305",
    startTime: "2024-03-20T14:00:00Z",
    endTime: "2024-03-20T16:00:00Z",
    status: "active",
    participants: 120,
  },
  {
    id: "2",
    title: "Beginner DSA Sprint",
    startTime: "2024-03-25T10:00:00Z",
    endTime: "2024-03-25T12:00:00Z",
    status: "upcoming",
    participants: 45,
  },
  {
    id: "3",
    title: "Algorithmic Showdown #4",
    startTime: "2024-03-10T14:00:00Z",
    endTime: "2024-03-10T17:00:00Z",
    status: "past",
    participants: 342,
  },
]

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

export function ContestsList() {
  const navigate = useNavigate()

  const activeContests = MOCK_CONTESTS.filter(c => c.status === "active")
  const upcomingContests = MOCK_CONTESTS.filter(c => c.status === "upcoming")
  const pastContests = MOCK_CONTESTS.filter(c => c.status === "past")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contests</h2>
          <p className="text-muted-foreground">Manage your coding battles.</p>
        </div>
        <Button onClick={() => navigate("/contests/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
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
  contests: typeof MOCK_CONTESTS, 
  showEdit?: boolean, 
  showLeaderboard?: boolean 
}) {
  return (
    <div className="rounded-md border border-border/50 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-muted/50">
            <TableHead>Contest Name</TableHead>
            <TableHead>Start Time</TableHead>
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
            contests.map((contest) => (
              <TableRow key={contest.id} className="border-border/50 hover:bg-muted/50">
                <TableCell className="font-medium font-sans">{contest.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(contest.startTime).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono">{contest.participants}</TableCell>
                <TableCell>
                  <StatusBadge status={contest.status} />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {showEdit && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">Active</Badge>
  }
  if (status === "upcoming") {
    return <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-0">Upcoming</Badge>
  }
  return <Badge variant="secondary">Finished</Badge>
}
