import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Trophy, Code2, ArrowRight, History } from "lucide-react"

const ACTIVE_CONTESTS = [
  { id: 1, title: "Weekly DSA Sprint #45", type: "Classic", participants: 120, time: "Live Now" },
  { id: 2, title: "Frontend System Design", type: "Special", participants: 85, time: "Ends in 2h" },
]

const PAST_CONTESTS = [
  { id: 101, title: "React Hooks Deep Dive", winner: "hsk", date: "Jan 08" },
  { id: 102, title: "Dynamic Programming Bash", winner: "raman", date: "Jan 05" },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/20">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <img src="/logo.png" alt="Contestia" className="h-8 w-8 object-contain" />
            <span>Contestia</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/login")}>Login</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" onClick={() => navigate("/signup")}>Get Started</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        
        {/* Hero Section */}
        {/* <section className="py-12 md:py-20 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            Forged in <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Code.</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
            The platform for high-performance minds. Compete, analyze, and climb the leaderboard in real-time.
          </p>
          <div className="flex justify-center gap-4 pt-4">
             <Button size="lg" className="h-12 px-8 rounded-full text-base font-semibold shadow-lg shadow-primary/20">
                Start Competing <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
             <Button size="lg" variant="outline" className="h-12 px-8 rounded-full text-base">
                View Problems
             </Button>
          </div>
        </section> */}

        {/* Active Contests */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Active Contests
            </h2>
            <Button variant="link" className="text-muted-foreground hover:text-primary">View all</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACTIVE_CONTESTS.map((contest) => (
              <div 
                key={contest.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-mono text-xl font-bold tracking-tight">{contest.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-green-500 font-mono text-xs animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    {contest.time}
                  </div>
                </div>

                <div className="relative flex items-end justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-mono text-foreground font-medium">{contest.participants}</span> participants
                  </div>
                  <Button onClick={() => navigate(`/contest/${contest.id}`)}>
                    Enter Contest
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past Contests */}
        <section className="mt-20 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" /> Recent History
            </h2>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
              <div className="col-span-6 md:col-span-8">Contest Name</div>
              <div className="col-span-3 md:col-span-2">Winner</div>
              <div className="col-span-3 md:col-span-2 text-right">Action</div>
            </div>
            
            {PAST_CONTESTS.map((contest) => (
              <div 
                key={contest.id}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/5 transition-colors border-b border-border last:border-0"
              >
                <div className="col-span-6 md:col-span-8">
                  <div className="font-medium">{contest.title}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{contest.date}</div>
                </div>
                <div className="col-span-3 md:col-span-2 flex items-center gap-2">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span className="font-mono text-sm">{contest.winner}</span>
                </div>
                <div className="col-span-3 md:col-span-2 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8"
                    onClick={() => navigate(`/leaderboard/${contest.id}`)}
                  >
                    Leaderboard
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
