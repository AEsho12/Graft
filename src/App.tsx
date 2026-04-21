import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { preloadRouteModule } from './lib/routePreload'
import { AppLayout } from './layout/AppLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { AppStateProvider, useAppState } from './state/AppStateContext'
import { AuthProvider, useAuth } from './state/AuthContext'

const ActivityPage = lazy(() => import('./pages/ActivityPage').then((module) => ({ default: module.ActivityPage })))
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })),
)
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((module) => ({ default: module.CatalogPage })))
const DiscoverPage = lazy(() => import('./pages/discover').then((module) => ({ default: module.DiscoverPage })))
const InstalledPage = lazy(() =>
  import('./pages/InstalledPage').then((module) => ({ default: module.InstalledPage })),
)
const LibraryPage = lazy(() => import('./pages/LibraryPage').then((module) => ({ default: module.LibraryPage })))
const PluginDetailPage = lazy(() =>
  import('./pages/PluginDetailPage').then((module) => ({ default: module.PluginDetailPage })),
)
const SeeAllPage = lazy(() => import('./pages/SeeAllPage').then((module) => ({ default: module.SeeAllPage })))
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)
const UpdatesPage = lazy(() => import('./pages/updates').then((module) => ({ default: module.UpdatesPage })))
const UploadPage = lazy(() => import('./pages/UploadPage').then((module) => ({ default: module.UploadPage })))

function RouteFallback() {
  return (
    <div className="loading-shell">
      <p>Loading page...</p>
    </div>
  )
}

function AppRoutes() {
  const { loading, prefetchCoreData } = useAppState()
  const { loading: authLoading, isConfigured, user } = useAuth()

  useEffect(() => {
    if (!(isConfigured && !user)) return

    const timer = window.setTimeout(() => {
      void preloadRouteModule('/')
      void preloadRouteModule('/catalog')
      void preloadRouteModule('/library')
      void prefetchCoreData()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isConfigured, user, prefetchCoreData])

  if (loading || authLoading) {
    return (
      <div className="loading-shell">
        <p>Loading Graft...</p>
      </div>
    )
  }

  if (isConfigured && !user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DiscoverPage />} />
          <Route path="see-all" element={<SeeAllPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="catalog/:pluginId" element={<PluginDetailPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="installed" element={<InstalledPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="updates" element={<UpdatesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppStateProvider>
          <div className="desktop-root">
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
