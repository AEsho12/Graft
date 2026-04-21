import { useMemo } from 'react'
import { useAppState } from '../state/AppStateContext'

export function UpdateHistoryTab() {
  const { state } = useAppState()

  const runs = useMemo(() => state?.updates ?? [], [state?.updates])

  if (!state) return null
  if (runs.length === 0) {
    return (
      <section className="panel-stack">
        <article className="row-card">
          <div>
            <h3>No update history yet</h3>
            <p className="subtle">Completed update runs will appear here.</p>
          </div>
        </article>
      </section>
    )
  }

  return (
    <section className="panel-stack">
      {runs.map((run) => {
        const plugin = state.plugins.find((item) => item.id === run.pluginId)
        return (
          <article key={run.id} className="row-card">
            <div>
              <h3>{plugin?.name ?? run.pluginId}</h3>
              <p className="subtle">
                {run.fromVersion} to {run.toVersion}
              </p>
              <p>{run.summary}</p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
