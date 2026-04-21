import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/' },
  { key: 'catalog', label: 'Catalog', to: '/catalog' },
  { key: 'installed', label: 'Installed', to: '/installed' },
  { key: 'analytics', label: 'Analytics', to: '/analytics' },
  { key: 'upload', label: 'Upload', to: '/upload' },
  { key: 'updates', label: 'Updates', to: '/updates' },
  { key: 'settings', label: 'Settings', to: '/settings' },
]

export function AppLayout() {
  const { isConfigured, signOut, user } = useAuth()

  return (
    <div className="app-shell">
      <div className="app-shell-inner">
        <aside className="sidebar">
          <div className="brand">
            <p>Graft</p>
            <span>Plugin Marketplace</span>
          </div>

          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="content">
          <header className="topbar">
            <p>Catalog-first marketplace for community plugins</p>
            <div className="topbar-actions">
              <button className="ghost">Open Docs</button>
              {isConfigured && user ? (
                <button className="ghost" onClick={() => void signOut()}>
                  Sign Out
                </button>
              ) : null}
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
