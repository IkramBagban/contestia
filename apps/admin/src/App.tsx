import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SignupPage } from './pages/auth/signup'
import { LoginPage } from './pages/auth/login'
import { DashboardLayout } from './components/layouts/dashboard-layout'
import { DashboardHome } from './pages/dashboard/home'
import { ContestsList } from './pages/contests/list'
import { CreateContest } from './pages/contests/create'
import { ContestDetail } from './pages/contests/detail'
import { ParticipantsPage } from './pages/contests/participants'
import { CreateQuestion } from './pages/questions/create'

import { QuestionsList } from './pages/questions/list'
import { Toaster } from 'sonner'

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="contests" element={<ContestsList />} />
          <Route path="contests/:id" element={<ContestDetail />} />
          <Route path="contests/:id/participants" element={<ParticipantsPage />} />
          <Route path="contests/new" element={<CreateContest />} />
          <Route path="contests/edit/:id" element={<CreateContest />} />
          <Route path="questions" element={<QuestionsList />} />
          <Route path="questions/new" element={<CreateQuestion />} />
          <Route path="questions/edit/:id" element={<CreateQuestion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
