import { useAppState } from '../state/AppStateContext'

export function DashboardPage() {
  const { state } = useAppState()

  if (!state) return null

  return (
    <section className="panel-grid metrics-grid">
      <article className="metric-card">
        <p>Installed Plugins</p>
        <h2>{state.installed.length}</h2>
        <span>Across app profiles</span>
      </article>
      <article className="metric-card">
        <p>Update Health</p>
        <h2>93%</h2>
        <span>Last 7 days success rate</span>
      </article>
      <article className="metric-card">
        <p>Needs Attention</p>
        <h2>{state.installed.filter((item) => item.status !== 'Active').length}</h2>
        <span>Conflicts or compatibility issues</span>
      </article>
      <article className="metric-card">
        <p>Share Installs</p>
        <h2>214</h2>
        <span>Installs from shared links</span>
      </article>
    </section>
  )
}
