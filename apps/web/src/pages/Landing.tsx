import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { 
    Trophy, Code2, ArrowRight, Zap, Globe2, 
    Terminal, Cpu, ChevronRight, User
} from "lucide-react"

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      
      {/* BACKGROUND ELEMENTS */}
      {/* A subtle grid pattern usually helps technical products feel "engineered" */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Glowing Blob for ambiance */}
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px] sm:h-[800px] sm:w-[800px] sm:blur-[120px]" />

      {/* NAVBAR: Minimal, frosted glass */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Terminal className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Contestia</span>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
             {["Featuresa", "Contests", "Leaderboard"].map((item) => (
                <button key={item} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                </button>
             ))}
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" className="hidden text-muted-foreground hover:text-foreground sm:flex" onClick={() => navigate("/login")}>
                 Sign in
             </Button>
             <Button onClick={() => navigate("/signup")} className="h-9 rounded-full px-5 text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                 Get Started
             </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* HERO SECTION */}
        <section className="container mx-auto max-w-5xl px-4 text-center">
            <div className="mx-auto mb-6 flex w-fit animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                Weekly Sprint Live Now
            </div>

            <h1 className="animate-slide-up bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl md:text-8xl lg:leading-[1.1]">
                Code. Compete. <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-600 bg-clip-text text-transparent">Conquer.</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-lg text-muted-foreground sm:text-xl md:mt-8" style={{ animationDelay: "0.1s" }}>
                The next-generation competitive programming platform designed for performance. 
                Real-time execution, millisecond-precision rankings, and a beautiful interface.
            </p>

            <div className="mt-10 flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.2s" }}>
                <Button size="lg" className="h-12 min-w-[160px] rounded-full text-base" onClick={() => navigate("/dashboard")}>
                    Enter Arena <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 min-w-[160px] rounded-full border-primary/20 bg-primary/5 text-base hover:bg-primary/10">
                    View Problem Set
                </Button>
            </div>
        </section>

        {/* STATS / SOCIAL PROOF */}
        <section className="container mx-auto mt-20 max-w-7xl animate-fade-in px-4" style={{ animationDelay: "0.4s" }}>
            <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8 opacity-60 md:grid-cols-4">
                {[
                    { label: "Active Users", value: "12,000+" },
                    { label: "Submissions", value: "1.4M+" },
                    { label: "Daily Contests", value: "24/7" },
                    { label: "Uptime", value: "99.9%" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center">
                        <div className="font-display text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</div>
                        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>

        {/* BENTO GRID FEATURE SECTION */}
        <section className="container mx-auto mt-32 max-w-7xl px-4">
            <div className="mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Engineered for Excellence</h2>
                <p className="mt-4 text-muted-foreground">Everything you need to master algorithms, built into one cohesive system.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 lg:gap-8">
                {/* Feature 1: Large Left */}
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 md:col-span-2 md:row-span-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative z-10 flex h-full flex-col justify-between space-y-8">
                        <div>
                             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                                <Code2 className="h-6 w-6" />
                             </div>
                             <h3 className="text-2xl font-bold">Real-time Code Execution</h3>
                             <p className="mt-2 max-w-md text-muted-foreground">
                                Run your code against hundreds of test cases in milliseconds. 
                                Support for C++, Java, Python, and JavaScript with instant feedback.
                             </p>
                        </div>
                        {/* Fake Code Editor UI */}
                        <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-[#0f0f12] p-4 font-mono text-sm text-gray-300 shadow-2xl">
                             <div className="flex gap-1.5 pb-4">
                                <div className="h-3 w-3 rounded-full bg-red-500/20"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-500/20"></div>
                                <div className="h-3 w-3 rounded-full bg-green-500/20"></div>
                             </div>
                             <div className="space-y-1 opacity-70">
                                <p><span className="text-purple-400">def</span> <span className="text-blue-400">solve</span>(arr):</p>
                                <p className="pl-4">n = <span className="text-yellow-300">len</span>(arr)</p>
                                <p className="pl-4"><span className="text-purple-400">return</span> [x*2 <span className="text-purple-400">for</span> x <span className="text-purple-400">in</span> arr]</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Feature 2: Top Right */}
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 md:col-span-1 md:row-span-1">
                     <div className="absolute top-0 right-0 -m-8 h-40 w-40 rounded-full bg-green-500/10 blur-3xl transition-all group-hover:bg-green-500/20"></div>
                     <Globe2 className="mb-4 h-8 w-8 text-green-500/80" />
                     <h3 className="text-xl font-bold">Global Leaderboards</h3>
                     <p className="mt-2 text-sm text-muted-foreground">Compete accurately with Elo-based ranking systems.</p>
                </div>

                {/* Feature 3: Bottom Right */}
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 md:col-span-1 md:row-span-1">
                     <div className="absolute bottom-0 left-0 -m-8 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl transition-all group-hover:bg-orange-500/20"></div>
                     <Zap className="mb-4 h-8 w-8 text-orange-500/80" />
                     <h3 className="text-xl font-bold">Lightning Fast</h3>
                     <p className="mt-2 text-sm text-muted-foreground">Optimized for speed. No lag, no downtime.</p>
                </div>
            </div>
        </section>

        {/* CTA SECTION */}
        <section className="mt-32 border-t border-white/5 bg-white/5 py-24 dark:bg-black/20">
            <div className="container mx-auto max-w-4xl px-4 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to climb the ranks?</h2>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                    Join thousands of developers solving problems daily. 
                    From easy warmups to hard algorithmic challenges.
                </p>
                <Button size="lg" className="mt-10 h-14 rounded-full px-8 text-lg font-semibold" onClick={() => navigate("/signup")}>
                    Start for free <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
            </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-sm text-muted-foreground">
          <p>© 2026 Contestia Inc. Crafted for Engineers.</p>
      </footer>
    </div>
  )
}
