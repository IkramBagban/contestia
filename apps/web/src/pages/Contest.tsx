import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle2, Circle, Trophy, Clock, ArrowLeft, ArrowRight, Crown, Medal } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const MOCK_QUESTIONS = [
  { id: 1, title: "React Basics", description: "What is React?", status: "completed" },
  { id: 2, title: "Redux Store", description: "What is redux and what is it used for?", status: "active" },
  { id: 3, title: "Hooks Deep Dive", description: "Explain useEffect dependency array", status: "pending" },
  { id: 4, title: "Next.js Routing", description: "How does file-based routing work?", status: "pending" },
]

const CURRENT_QUESTION = {
  id: 2,
  title: "Redux Store", // Added title
  description: "What is redux and what is it used for?", // Renamed text to description
  options: [
    { id: 'A', text: "State management" },
    { id: 'B', text: "Side effect" },
    { id: 'C', text: "Hooks" },
    { id: 'D', text: "Framework" }
  ]
}

const MOCK_LEADERBOARD = [
  { rank: 1, name: "hsk", points: 100 },
  { rank: 2, name: "raman", points: 90 },
  { rank: 3, name: "kirat", points: 85 },
  { rank: 18, name: "You", points: 40 },
]

export function ContestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fmtTime = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${min}:${sec}`
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row p-4 gap-4 h-screen overflow-hidden selection:bg-accent/20">
        {/* Sidebar */}
        <aside className="w-full md:w-64 lg:w-80 border border-border/40 bg-card rounded-2xl p-6 flex flex-col shrink-0 overflow-y-auto shadow-xl shadow-black/5">
            <div className="flex items-center gap-2 mb-8">
                <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-foreground font-bold tracking-tight">Questions</h2>
            </div>
            
            <div className="space-y-2">
                {MOCK_QUESTIONS.map((q) => (
                    <div 
                        key={q.id}
                        className={cn(
                            "group flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all cursor-pointer border border-transparent",
                            q.status === 'active' 
                                ? "bg-primary/10 border-primary/20 text-primary shadow-sm shadow-primary/10" 
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {q.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-500" />
                        ) : q.status === 'active' ? (
                             <div className="h-4 w-4 shrink-0 rounded-full border-[3px] border-primary animate-pulse" />
                        ) : (
                            <Circle className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors" />
                        )}
                        <span className="truncate">{q.title}</span>
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl p-6 md:p-10 relative flex flex-col">
            {/* Header / Stats */}
            <div className="absolute top-6 right-6 flex gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-2 border border-border/50 bg-background/50 px-3 py-1.5 rounded-full text-foreground/80 font-mono text-sm shadow-sm backdrop-blur-md cursor-pointer hover:bg-muted/50 transition-colors">
                        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Rank: 20</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:w-[540px] border-l border-border/50 bg-card/50 backdrop-blur-xl p-0">
                    <div className="flex flex-col h-full">
                        <SheetHeader className="p-6 border-b border-white/10">
                        <SheetTitle className="text-xl font-bold tracking-tight">Leaderboard</SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            Live standings for <span className="text-foreground font-medium">Redux Challenge</span>
                        </SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto p-6 pt-4">
                            <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                <div className="col-span-2 text-center">Rank</div>
                                <div className="col-span-7">Name</div>
                                <div className="col-span-3 text-right">Points</div>
                            </div>

                            <div className="space-y-2">
                                {MOCK_LEADERBOARD.map((entry) => (
                                    <div 
                                        key={entry.rank}
                                        className={cn(
                                            "grid grid-cols-12 items-center p-3 rounded-lg border transition-all duration-200",
                                            entry.name === 'You' 
                                                ? "bg-primary/10 border-primary/20" 
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                        )}
                                    >
                                        <div className="col-span-2 flex justify-center">
                                            {entry.rank === 1 ? <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500/20" /> : 
                                            entry.rank === 2 ? <Medal className="w-5 h-5 text-slate-400" /> :
                                            entry.rank === 3 ? <Medal className="w-5 h-5 text-amber-700" /> :
                                            <span className="text-muted-foreground font-mono font-bold text-sm">#{entry.rank}</span>}
                                        </div>
                                        <div className="col-span-7 font-medium truncate">
                                            <span className={cn(entry.name === 'You' && "text-primary")}>{entry.name}</span>
                                        </div>
                                        <div className="col-span-3 text-right font-mono font-bold">
                                            {entry.points}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className={cn(
                    "flex items-center gap-2 border bg-background/50 px-3 py-1.5 rounded-full font-mono text-sm shadow-sm backdrop-blur-md transition-colors duration-500",
                    timeLeft < 60 ? "border-red-500/50 text-red-500 animate-pulse bg-red-950/10" : "border-border/50 text-foreground/80"
                )}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{fmtTime(timeLeft)}</span>
                </div>
            </div>

            {/* Question Display */}
            <div className="mt-16 flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-bold uppercase tracking-wider border border-accent/20">
                            MCQ Challenge
                        </span>
                        <h1 className="text-2xl md:text-4xl font-sans font-extrabold leading-tight tracking-tight px-4 text-foreground/90 dark:text-transparent dark:bg-clip-text dark:bg-linear-to-b dark:from-white dark:to-white/70">
                            {CURRENT_QUESTION.description}
                        </h1>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
                        {CURRENT_QUESTION.options.map((opt) => {
                            const isSelected = selectedOption === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedOption(opt.id)}
                                    className={cn(
                                        "group relative p-5 rounded-xl border-2 text-left transition-all duration-200 outline-none overflow-hidden",
                                        isSelected 
                                            ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(79,70,229,0.15)]" 
                                            : "border-border/40 hover:border-border hover:bg-muted/20"
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={cn(
                                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-mono transition-colors",
                                            isSelected
                                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                : "border-border/50 text-muted-foreground bg-background/50 group-hover:border-foreground/30 group-hover:text-foreground"
                                        )}>
                                            {opt.id}
                                        </div>
                                        <div className={cn(
                                            "font-medium text-lg transition-colors",
                                            isSelected ? "text-primary font-semibold" : "text-foreground/80 group-hover:text-foreground"
                                        )}>
                                            {opt.text}
                                        </div>
                                    </div>
                                    
                                    {/* Selected Indicator - Subtle glow/background */}
                                    {isSelected && (
                                         <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-50" />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-12 flex justify-center">
                    <Button 
                        size="lg" 
                        disabled={!selectedOption}
                        className={cn(
                            "h-14 px-16 rounded-full text-base font-bold tracking-wide transition-all duration-300",
                            selectedOption 
                                ? "shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 bg-primary text-white" 
                                : "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                        )}
                    >
                        Submit Answer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}
