import { useAppState } from '../state/AppStateContext'

export function InstalledPage() {
  const { state, pinPlugin, rollbackPlugin } = useAppState()

  if (!state) return null

  return (
    <section className="panel-stack">
      <h1>Installed Plugins</h1>
      {state.installed.map((item) => {
        const plugin = state.plugins.find((entry) => entry.id === item.pluginId)
        if (!plugin) return null

        return (
          <article key={item.pluginId} className="row-card">
            <div>
              <h3>{plugin.name}</h3>
              <p>
                Installed {item.installedVersion} | Latest {plugin.version}
              </p>
              <p className="subtle">Status: {item.status}</p>
            </div>
            <div className="row-controls">
              {item.pinnedVersion ? <span className="tag">Pinned {item.pinnedVersion}</span> : null}
              <span className="tag">Auto-update {item.autoUpdate ? 'On' : 'Off'}</span>
              <button className="ghost" onClick={() => void pinPlugin(item.pluginId, item.installedVersion)}>
                Pin Version
              </button>
              <button className="secondary" onClick={() => void rollbackPlugin(item.pluginId)}>
                Rollback
              </button>
            </div>
          </article>
        )
      })}
    </section>
  )
}
