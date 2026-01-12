import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Trophy, 
  FileQuestion, 
  Settings, 
  LogOut,
  Users
} from "lucide-react"
import { useLogout } from "@/hooks/use-queries"
import { toast } from "sonner"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contests",
    href: "/contests",
    icon: Trophy,
  },
  {
    title: "Question Bank",
    href: "/questions",
    icon: FileQuestion,
  },
  // {
  //   title: "Users",
  //   href: "/users",
  //   icon: Users,
  // },
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: Settings,
  // },
]

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useLogout()

  const handleLogout = async () => {
    try {
      await logout.mutateAsync()
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      toast.error("Logout failed")
      console.error("Logout failed", error)
    }
  }

  return (
    <div className={cn("flex flex-col h-full border-r border-border/50 bg-card/50 backdrop-blur-xl w-64", className)}>
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-bold font-sans tracking-tight text-primary flex items-center gap-2">
          {/* <span className="text-2xl">&lt;/&gt;</span> */}
          <img src="logo.png" alt="Contestia Logo" className="h-6 w-6" />

          Contestia
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary hover:bg-primary/15" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button 
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {logout.isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  )
}
