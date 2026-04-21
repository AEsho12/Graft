const routeLoaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/discover'),
  '/see-all': () => import('../pages/SeeAllPage'),
  '/library': () => import('../pages/LibraryPage'),
  '/catalog': () => import('../pages/CatalogPage'),
  '/activity': () => import('../pages/ActivityPage'),
  '/installed': () => import('../pages/InstalledPage'),
  '/analytics': () => import('../pages/AnalyticsPage'),
  '/upload': () => import('../pages/UploadPage'),
  '/updates': () => import('../pages/updates'),
  '/settings': () => import('../pages/SettingsPage'),
}

export function preloadRouteModule(path: string): Promise<unknown> | null {
  const loader = routeLoaders[path]
  if (!loader) return null
  return loader()
}
