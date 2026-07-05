import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { AppLayout } from '../components/AppLayout'
import { Dashboard } from '../pages/Dashboard'
import { Finance } from '../pages/Finance'
import { Ideas } from '../pages/Ideas'
import { Login } from '../pages/Login'
import { Purchases } from '../pages/Purchases'
import { Settings } from '../pages/Settings'
import { Today } from '../pages/Today'
import { WeeklyReview } from '../pages/WeeklyReview'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="heute" element={<Today />} />
        <Route path="finanzen" element={<Finance />} />
        <Route path="kaeufe" element={<Purchases />} />
        <Route path="ideen" element={<Ideas />} />
        <Route path="wochenreview" element={<WeeklyReview />} />
        <Route path="einstellungen" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  )
}
