import { Sidebar } from "./sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useMe } from "@/hooks/use-queries"

export function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { data: user, isLoading, isError } = useMe()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      navigate("/login")
    }
  }, [user, isLoading, isError, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !user) return null

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 border-b border-border/50 md:hidden flex items-center px-4 bg-card/50 backdrop-blur-xl">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r border-border/50">
              <Sidebar className="w-full h-full border-none" />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg">Contestia</span>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
