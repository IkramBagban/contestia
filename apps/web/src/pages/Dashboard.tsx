import { useContests, useLogout, useMe, useStartContest } from "@/hooks/use-queries";
import { 
    Loader2, LogOut, Trophy, Calendar, Clock, ArrowRight,
    LayoutDashboard, User, Settings, Bell, Search, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function DashboardPage() {
  const { data: contests, isLoading: isLoadingContests } = useContests();
  const { mutate: logout } = useLogout();
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { mutate: startContest } = useStartContest();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        navigate("/login");
      },
    });
  };

  const handleEnterContest = (contestId: string) => {
    startContest(contestId, {
        onSuccess: () => {
            navigate(`/contest/${contestId}/attempt`);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.error || err.response?.data?.message || "Failed to start contest";
            toast.error(msg);
            
            if (msg.includes("started") || msg.includes("already submitted")) {
                 navigate(`/contest/${contestId}/attempt`);
            }
        }
    });
  }

  const isLoading = isLoadingContests || isLoadingUser;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Filter contests if needed, for now show all
  const activeContests = contests || [];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
                 {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <LayoutDashboard className="h-5 w-5" />
                 </div> */}
                 <img src="logo.png" alt="Contestia Logo" className="h-8 w-8" />
                 <span className="font-display text-lg font-bold">Contestia</span>
            </div>

            <div className="flex items-center gap-4">
               
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Bell className="h-5 w-5" />
                 </Button>
                 <div className="h-8 w-[1px] bg-border"></div>
                 <div className="flex items-center gap-3">
                     <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                     </div>
                     <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                         <LogOut className="h-5 w-5" />
                     </Button>
                 </div>
            </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
         
         {/* Welcome Area */}
         {/* <div className="mb-10 animate-fade-in">
             <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                 Dashboard
             </h1>
             <p className="mt-2 text-muted-foreground">
                 Welcome back. Here is what you need to focus on today.
             </p>
         </div> */}

         {/* Stats Overview */}
         {/* <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
             {[
                 { label: "Contests Joined", value: "12", icon: Trophy, color: "text-yellow-500" },
                 { label: "Global Rank", value: "#42", icon: Globe2, color: "text-blue-500" }, // imported Globe2 below? No, need to fix imports if I use it.
                 { label: "Problems Solved", value: "156", icon: Zap, color: "text-purple-500" },
                 { label: "Rating", value: "2450", icon: LayoutDashboard, color: "text-green-500" },
             ].map((stat, i) => (
                 <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                     <div className="flex items-center justify-between">
                         <div>
                             <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                             <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                         </div>
                         <div className={`rounded-full bg-secondary p-2.5 ${stat.color} bg-opacity-10`}>
                             <stat.icon className={`h-5 w-5 ${stat.color}`} />
                         </div>
                     </div>
                 </div>
             ))}
         </div> */}

         {/* Active Contests Section */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Available Contests</h2>
                <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="hidden sm:flex">Upcoming</Button>
                     <Button variant="outline" size="sm" className="hidden sm:flex">Past</Button>
                </div>
            </div>

            {activeContests.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center animate-fade-in">
                    <Trophy className="h-10 w-10 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No active contests</h3>
                    <p className="max-w-sm text-sm text-muted-foreground">Check back later or view the schedule to see upcoming events.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                    {activeContests.map((contest: any) => (
                        <div 
                           key={contest.id} 
                           className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover:opacity-20">
                                <Trophy className="h-24 w-24 text-primary rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                    {contest.status === 'active' ? "Live Now" : "Upcoming"}
                                </span>
                                <h3 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                                    {contest.title}
                                </h3>
                                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground/90 leading-relaxed font-normal">
                                    {contest.description}
                                </p>
                                
                                <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{format(new Date(contest.startDate), "MMM d, yyyy")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{format(new Date(contest.startDate), "h:mm a")} - {format(new Date(contest.endTime), "h:mm a")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-8">
                                <Button 
                                    className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground" 
                                    onClick={() => handleEnterContest(contest.id)}
                                >
                                    Enter Arena
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>

      </main>
    </div>
  );
}

// Simple Globe icon replacement since I might miss the import
function Globe2(props: any) {
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
        <line x1="2" x2="22" y1="12" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    )
}
