import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './layout/AppLayout'
import { DesktopTitlebar } from './layout/DesktopTitlebar'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CatalogPage } from './pages/CatalogPage'
import { DashboardPage } from './pages/DashboardPage'
import { InstalledPage } from './pages/InstalledPage'
import LoginPage from './pages/LoginPage'
import { PluginDetailPage } from './pages/PluginDetailPage'
import { SettingsPage } from './pages/SettingsPage'
import { UpdatesPage } from './pages/UpdatesPage'
import { UploadPage } from './pages/UploadPage'
import { AppStateProvider, useAppState } from './state/AppStateContext'
import { AuthProvider, useAuth } from './state/AuthContext'

function AppRoutes() {
  const { loading } = useAppState()
  const { loading: authLoading, isConfigured, user } = useAuth()

  if (loading || authLoading) {
    return (
      <div className="loading-shell">
        <p>Loading Graft...</p>
      </div>
    )
  }

  if (isConfigured && !user) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:pluginId" element={<PluginDetailPage />} />
        <Route path="/installed" element={<InstalledPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppStateProvider>
          <div className="desktop-root">
            <DesktopTitlebar />
            <div className="desktop-content">
              <AppRoutes />
            </div>
          </div>
        </AppStateProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
