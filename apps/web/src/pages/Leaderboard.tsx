import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronRight, Crown, Medal } from "lucide-react"

const LEADERBOARD_DATA = [
  { rank: 1, name: "hsk", points: 100 },
  { rank: 2, name: "raman", points: 99 },
  { rank: 3, name: "kirat.", points: 99 },
  { rank: 4, name: "harmanpreet", points: 98 },
]

export function LeaderboardPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 flex items-center justify-center selection:bg-accent/20">
      <div className="w-full max-w-4xl border border-border bg-card/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 min-h-[80vh] relative">
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] rounded-3xl pointer-events-none" />

        <Button 
            variant="ghost" 
            className="absolute top-6 left-6 text-muted-foreground hover:text-foreground z-10"
            onClick={() => navigate('/')}
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="relative text-center mb-16 mt-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70 dark:from-white dark:to-white/70">
                Leaderboard
            </h1>
        </div>

        <div className="grid grid-cols-12 gap-4 px-6 mb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider relative">
            <div className="col-span-2 text-center">rank</div>
            <div className="col-span-8 text-center">name</div>
            <div className="col-span-2 text-center">points</div>
        </div>

        <div className="space-y-3 relative">
            {LEADERBOARD_DATA.map((entry) => (
                <div 
                    key={entry.rank}
                    className="group grid grid-cols-12 gap-4 items-center p-4 rounded-xl border border-border/30 bg-background/30 hover:bg-muted/30 hover:border-primary/30 transition-all duration-300 font-mono text-lg"
                >
                    <div className="col-span-2 flex justify-center">
                        {entry.rank === 1 ? (
                            <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
                        ) : entry.rank === 2 ? (
                            <Medal className="h-6 w-6 text-slate-300" />
                        ) : entry.rank === 3 ? (
                            <Medal className="h-6 w-6 text-amber-700" />
                        ) : (
                            <span className="text-muted-foreground">#{entry.rank}</span>
                        )}
                    </div>
                    <div className="col-span-8 text-center font-medium group-hover:text-primary transition-colors">
                        {entry.name}
                    </div>
                    <div className="col-span-2 text-center text-accent">
                        {entry.points}
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-12 flex justify-end px-4 relative">
             <div className="inline-flex items-center gap-1 border border-border bg-background/80 backdrop-blur rounded-full px-2 py-1.5 shadow-sm">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled>
                    <span className="sr-only">Previous</span>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 px-2 font-mono text-sm">
                    <span className="bg-primary text-primary-foreground h-6 w-6 flex items-center justify-center rounded-md">1</span>
                    <span className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer text-muted-foreground">2</span>
                    <span className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer text-muted-foreground">3</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
        </div>
      </div>
    </div>
  )
}
