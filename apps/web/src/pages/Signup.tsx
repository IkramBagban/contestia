import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Loader2, Trophy } from "lucide-react"
import { useState } from "react"
import { useSignup } from "@/hooks/use-queries"
import { toast } from "sonner"

export function SignupPage() {
  const navigate = useNavigate()
  const { mutate: signup, isPending } = useSignup()
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signup({ fullname, email, password }, {
      onSuccess: () => {
        toast.success("Account created successfully. Please login.")
        navigate("/login")
      },
      onError: (err: any) => {
        const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Signup failed";
        toast.error(msg)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <Button
        variant="ghost"
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-all rounded-full border border-transparent hover:border-foreground/10"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-foreground bg-primary shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
            Contestia
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Create Your Account</p>
        </div>

        <Card className="rounded-3xl border border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden">
          <CardHeader className="space-y-1 pb-6 border-b border-foreground/5">
            <CardTitle className="text-2xl font-black uppercase tracking-tight">Create Account</CardTitle>
            <CardDescription className="font-medium tracking-tight">
              Enter your details below to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="font-mono bg-muted/30 border-foreground/10 rounded-xl h-12 transition-all focus-visible:ring-primary/20 focus-visible:border-primary px-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-mono bg-muted/30 border-foreground/10 rounded-xl h-12 transition-all focus-visible:ring-primary/20 focus-visible:border-primary px-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono bg-muted/30 border-foreground/10 rounded-xl h-12 transition-all focus-visible:ring-primary/20 focus-visible:border-primary px-4"
                />
              </div>
              <Button type="submit" className="w-full font-bold uppercase tracking-wider h-12 rounded-xl bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-primary/95 transition-all active:translate-y-[1px] active:shadow-none" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign Up
              </Button>
            </form>
            <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 transition-colors border-b border-primary/30 hover:border-primary pb-0.5"
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
