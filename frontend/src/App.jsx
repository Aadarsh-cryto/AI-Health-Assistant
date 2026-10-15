import { BrowserRouter, Route, Routes } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage.jsx'
import HealthStatusPage from './pages/HealthStatusPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import SymptomCheckerPage from './pages/SymptomCheckerPage.jsx'
import NearbyDoctorsPage from './pages/NearbyDoctorsPage.jsx'
import HealthHistoryPage from './pages/HealthHistoryPage.jsx'
import HealthProfilePage from './pages/HealthProfilePage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/status" element={<HealthStatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
        <Route path="/doctors" element={<NearbyDoctorsPage />} />
        <Route path="/health-history" element={<HealthHistoryPage />} />
        <Route path="/health-history/:recordId" element={<HealthHistoryPage />} />
        <Route path="/health-profile" element={<HealthProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
