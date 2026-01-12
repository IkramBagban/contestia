import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/auth-provider"
import { LandingPage } from "@/pages/Landing"
import { ContestPage } from "@/pages/Contest"
import { LeaderboardPage } from "@/pages/Leaderboard"
import { LoginPage } from "@/pages/Login"
import { SignupPage } from "@/pages/Signup"
import { DashboardPage } from "@/pages/Dashboard"
import { ContestAttemptPage } from "@/pages/ContestAttempt"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contest/:id" element={<ContestPage />} />
            <Route path="/contest/:id/attempt" element={<ContestAttemptPage />} />
            <Route path="/leaderboard/:id" element={<LeaderboardPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
