import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SignupPage } from './pages/auth/signup'
import { LoginPage } from './pages/auth/login'
import { DashboardLayout } from './components/layouts/dashboard-layout'
import { DashboardHome } from './pages/dashboard/home'
import { ContestsList } from './pages/contests/list'
import { CreateContest } from './pages/contests/create'
import { CreateQuestion } from './pages/questions/create'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="contests" element={<ContestsList />} />
          <Route path="contests/new" element={<CreateContest />} />
          <Route path="questions/new" element={<CreateQuestion />} />
           {/* Fallback for Question Bank to avoid 404 from Sidebar links */}
           <Route path="questions" element={<Navigate to="/questions/new" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
