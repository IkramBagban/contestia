import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingPage } from "@/pages/Landing"
import { ContestPage } from "@/pages/Contest"
import { LeaderboardPage } from "@/pages/Leaderboard"
import { LoginPage } from "@/pages/Login"
import { SignupPage } from "@/pages/Signup"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/contest/:id" element={<ContestPage />} />
        <Route path="/leaderboard/:id" element={<LeaderboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
