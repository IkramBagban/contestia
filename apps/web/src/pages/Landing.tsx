import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import {
    Trophy, Code2, ArrowRight, Zap, Globe2,
    Terminal, User, MousePointer2, Shield
} from "lucide-react"

export function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary selection:text-white">

            {/* BACKGROUND ELEMENTS */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {/* Dynamic Blobs */}
            <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
            <div className="absolute top-1/2 -right-20 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

            {/* NAVBAR */}
            <header className="fixed top-0 z-50 w-full border-b border-foreground/5 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <img src="image.png" alt="Contestia Logo" className="w-12 h-12" />
                        <span className="font-display text-2xl font-black tracking-tighter uppercase italic">Contestia</span>
                    </div>

                    <div className="hidden items-center gap-10 lg:flex">
                        {["Contests", "Leaderboard", "About"].map((item) => (
                            <button key={item} className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-all hover:text-primary hover:tracking-[0.3em]">
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="hidden text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground sm:flex" onClick={() => navigate("/login")}>
                            Login
                        </Button>
                        <Button onClick={() => navigate("/signup")} className="h-11 rounded-xl border-2 border-foreground bg-foreground px-6 text-xs font-bold uppercase tracking-widest text-background shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:scale-95">
                            Get Started
                        </Button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-40 pb-20">

                {/* HERO SECTION */}
                <section className="container mx-auto max-w-6xl px-4 text-center">
                    <div className="mx-auto mb-8 flex w-fit animate-fade-in items-center gap-2.5 rounded-full border border-foreground/10 bg-muted/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur-sm shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                        </span>
                        Platform Live Now
                    </div>

                    <h1 className="animate-slide-up text-6xl font-black tracking-tight text-foreground sm:text-8xl md:text-9xl uppercase leading-[0.85] italic">
                        Code. Compete. <br className="hidden sm:block" />
                        <span className="text-primary not-italic">Conquer.</span>
                    </h1>

                    <p className="mx-auto mt-10 max-w-2xl animate-fade-in text-lg text-muted-foreground font-medium md:text-xl leading-relaxed" style={{ animationDelay: "0.2s" }}>
                        Next-generation algorithm arena. Real-time execution,
                        high-precision rankings, and a lethal interface for elite developers.
                    </p>

                    <div className="mt-12 flex animate-slide-up flex-col items-center justify-center gap-6 sm:flex-row" style={{ animationDelay: "0.4s" }}>
                        <Button size="lg" className="h-16 min-w-[200px] rounded-2xl border-2 border-foreground bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all" onClick={() => navigate("/dashboard")}>
                            Start Coding <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-16 min-w-[200px] rounded-2xl border-2 border-foreground bg-background text-sm font-black uppercase tracking-widest hover:bg-muted transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                            Documentation
                        </Button>
                    </div>
                </section>

                {/* STATS */}
                <section className="container mx-auto mt-32 max-w-7xl px-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            { label: "Active Users", value: "24K+", icon: User },
                            { label: "Code Submissions", value: "2.8M", icon: Target },
                            { label: "Platform Uptime", value: "99.9%", icon: Zap },
                            { label: "Monthly Contests", value: "150+", icon: Trophy },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={idx} className="group rounded-3xl border border-foreground/5 bg-muted/20 p-8 transition-all hover:bg-muted/40 hover:border-foreground/10">
                                    <Icon className="h-6 w-6 text-primary/40 mb-4 transition-colors group-hover:text-primary" />
                                    <div className="font-display text-3xl font-black text-foreground mb-1 tracking-tighter uppercase">{stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* FEATURES BENTO */}
                <section className="container mx-auto mt-40 max-w-7xl px-4">
                    <div className="mb-20 space-y-4">
                        <Badge className="bg-foreground text-background font-black uppercase tracking-widest text-[9px] rounded-sm">Platform Specs</Badge>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase italic">Engineered for Excellence</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="md:col-span-2 rounded-[2.5rem] border-2 border-foreground bg-card p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                                <Terminal className="h-64 w-64" />
                            </div>
                            <div className="relative z-10 flex h-full flex-col justify-between gap-12">
                                <div className="space-y-6">
                                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-foreground bg-primary/10 text-primary shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                        <Code2 className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight">Real-time <br /> Execution Engine</h3>
                                    <p className="max-w-md text-muted-foreground font-medium leading-relaxed">
                                        Deploy your code against massive datasets.
                                        Millisecond precision execution across C++, Python, Java, and JS.
                                    </p>
                                </div>
                                <div className="w-full overflow-hidden rounded-2xl border border-foreground/10 bg-zinc-950 p-6 font-mono text-sm text-zinc-400">
                                    <div className="flex gap-2 mb-4">
                                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/40"></div>
                                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40"></div>
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/40"></div>
                                    </div>
                                    <div className="space-y-1.5 opacity-80 text-xs">
                                        <p><span className="text-pink-500">async function</span> <span className="text-blue-400">optimize</span>(payload) {"{"}</p>
                                        <p className="pl-4 text-zinc-500">// Initialize neural pathway</p>
                                        <p className="pl-4"><span className="text-pink-500">const</span> result = <span className="text-pink-500">await</span> engine.<span className="text-blue-400">process</span>(payload);</p>
                                        <p className="pl-4"><span className="text-pink-500">return</span> result.<span className="text-blue-400">map</span>(node {"=>"} node.<span className="text-blue-400">score</span> * <span className="text-amber-500">2</span>);</p>
                                        <p>{"}"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div className="flex-1 rounded-[2.5rem] border-2 border-foreground bg-muted/30 p-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:bg-muted/50 transition-colors">
                                <Globe2 className="mb-6 h-10 w-10 text-primary" strokeWidth={2.5} />
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Global Network</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">Compete with engineers worldwide on our low-latency global grid.</p>
                            </div>
                            <div className="flex-1 rounded-[2.5rem] border-2 border-foreground bg-primary p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-primary-foreground group">
                                <Shield className="mb-6 h-10 w-10 text-primary-foreground group-hover:animate-bounce" strokeWidth={2.5} />
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Secure Sandbox</h3>
                                <p className="text-sm text-primary-foreground/80 font-medium leading-relaxed">Robust execution environments ensure your code remains isolated and secure.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="mt-40 bg-foreground py-32 text-background relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-8">Ready to climb the rankings?</h2>
                        <p className="mx-auto max-w-2xl text-lg md:text-xl text-background/60 font-medium mb-12">
                            Join the ranks of thousands of developers solving the world's most
                            interesting algorithmic challenges. Zero latency. Maximum speed.
                        </p>
                        <Button size="lg" className="h-16 rounded-2xl border-2 border-background bg-background px-12 text-sm font-black uppercase tracking-[0.2em] text-foreground hover:bg-background/90 transition-all active:scale-95 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]" onClick={() => navigate("/signup")}>
                            Get Started <MousePointer2 className="ml-3 h-5 w-5" />
                        </Button>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="border-t border-foreground/5 py-16 bg-background">
                <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 opacity-50">
                        <Terminal className="h-5 w-5" />
                        <span className="font-black uppercase tracking-tighter text-sm">Contestia v2.0</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">© 2026 Crafted for the Elite. Unauthorized access prohibited.</p>
                    <div className="flex gap-6">
                        {["Security", "Privacy", "Status"].map(link => (
                            <span key={link} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-primary cursor-pointer transition-colors">{link}</span>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}

function Target(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
