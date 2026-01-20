import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useContests, useQuestions } from "@/hooks/use-queries"
import { useNavigate } from "react-router-dom"

export function DashboardHome() {
  const navigate = useNavigate()
  const { data: contests = [] } = useContests()
  const { data: questionsResponse } = useQuestions(1, 1)
  const totalQuestions = questionsResponse?.meta?.total || 0

  const now = new Date()
  const activeContestsCount = contests.filter(c => {
    const start = new Date(c.startDate)
    const end = new Date(c.endTime)
    return start <= now && end >= now
  }).length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your platform activity.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Active Contests</p>
              <div className="h-4 w-4 text-primary animate-pulse rounded-full bg-primary/20" />
            </div>
            <div className="text-2xl font-bold font-mono">{activeContestsCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
            </div>
            <div className="text-2xl font-bold font-mono">-</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Questions Bank</p>
            </div>
            <div className="text-2xl font-bold font-mono">{totalQuestions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button size="lg" className="gap-2" onClick={() => navigate("/contests/new")}>
          <Plus className="h-4 w-4" />
          Create Contest
        </Button>
      </div>
    </div>
  )
}
