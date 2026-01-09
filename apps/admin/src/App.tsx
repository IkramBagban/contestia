import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SignupPage } from './pages/auth/signup'
import { LoginPage } from './pages/auth/login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
