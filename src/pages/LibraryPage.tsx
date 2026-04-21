import {
  CloudDownloadIcon,
  type DiscoverAppItem,
  defaultAppIcon,
} from '@/data/discoverAppMap'
import { seeAllAppMap } from '@/data/seeAllAppMap'
import { useAppState } from '@/state/AppStateContext'

function AppAction({ action }: { action: DiscoverAppItem['action'] }) {
  if (action === 'update') return <>Update</>
  if (action === 'cloud') return <CloudDownloadIcon />
  return <>Get</>
}

export function LibraryPage() {
  const { state } = useAppState()
  if (!state) {
    return null
  }

  const installedFromState = state.installed
    .map((item) => {
      const plugin = state.plugins.find((entry) => entry.id === item.pluginId)
      if (!plugin) return null

      return {
        id: item.pluginId,
        icon: defaultAppIcon,
        title: plugin.name,
        subtitle: plugin.description,
        action: 'update' as const,
      }
    })
    .filter((app): app is NonNullable<typeof app> => app !== null)

  const installedApps =
    installedFromState.length > 0
      ? installedFromState
      : seeAllAppMap
          .filter((app) => app.action !== 'get')
          .map((app) => ({ id: app.title, ...app }))

  return (
    <section className="discover-page discover-layout">
      <div className="discover-content see-all-content">
        <h1 className="discover-heading">Libary</h1>
        <section className="discover-app-grid see-all-grid">
          {installedApps.map((app) => (
            <article key={app.id} className="discover-app-card see-all-card">
              <div className="discover-app-main">
                <div className="discover-app-icon" aria-hidden="true">
                  <img src={app.icon} alt="" />
                </div>
                <div className="see-all-card-copy">
                  <h3 className="discover-app-title">{app.title}</h3>
                  <p className="discover-app-subtitle">{app.subtitle}</p>
                  <button
                    className={`discover-app-get see-all-card-action ${app.action === 'cloud' ? 'discover-app-get-icon' : ''}`}
                  >
                    <AppAction action={app.action} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </section>
  )
}
