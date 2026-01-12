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
import { ArrowLeft, Loader2 } from "lucide-react"
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4" 
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
           {/* <div className="flex justify-center mb-4">
             <img src="/logo.png" alt="Contestia" className="h-12 w-12 object-contain" />
          </div> */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
             Contestia
          </h1>
          <p className="text-muted-foreground">Join the community of high-performance developers</p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-2xl shadow-black/10">
          <CardHeader className="space-y-1">
             <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
             <CardDescription>
               Enter your details below to create your account
             </CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="font-mono bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-mono bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono bg-background/50 border-input transition-all focus-visible:ring-primary/20"
                />
              </div>
              <Button type="submit" className="w-full font-medium shadow-lg shadow-primary/20" size="lg" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
               Already have an account?{" "}
               <Link 
                to="/login"
                className="text-primary hover:underline cursor-pointer font-medium" 
               >
                 Sign in
               </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
