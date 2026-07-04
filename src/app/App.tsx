import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Dashboard } from '../pages/Dashboard'
import { Ideas } from '../pages/Ideas'
import { Purchases } from '../pages/Purchases'
import { Settings } from '../pages/Settings'
import { Today } from '../pages/Today'
import { WeeklyReview } from '../pages/WeeklyReview'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="heute" element={<Today />} />
        <Route path="kaeufe" element={<Purchases />} />
        <Route path="ideen" element={<Ideas />} />
        <Route path="wochenreview" element={<WeeklyReview />} />
        <Route path="einstellungen" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/dashboard" />} />
    </Routes>
  )
}
