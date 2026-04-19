import { useAppState } from '../state/AppStateContext'
import type { StageStatus } from '../types'

function stageIcon(status: StageStatus) {
  if (status === 'success') return '✓'
  if (status === 'running') return '…'
  if (status === 'failed') return '✕'
  return '•'
}

export function UpdatesPage() {
  const { state, rollbackPlugin, pinPlugin } = useAppState()

  if (!state) return null

  return (
    <section className="panel-stack">
      <h1>Updates</h1>
      {state.updates.map((run) => {
        const plugin = state.plugins.find((item) => item.id === run.pluginId)

        return (
          <article key={run.id} className="row-card updates-card">
            <div>
              <h3>
                {plugin?.name ?? run.pluginId} {run.fromVersion} to {run.toVersion}
              </h3>
              <p>{run.summary}</p>
            </div>
            <ul className="timeline">
              {run.stages.map((stage) => (
                <li key={stage.key} className={stage.status === 'failed' ? 'failed' : ''}>
                  <span className="timeline-icon">{stageIcon(stage.status)}</span>
                  <div>
                    <strong>{stage.label}</strong>
                    {stage.detail ? <p>{stage.detail}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="row-controls">
              <button className="secondary" onClick={() => void rollbackPlugin(run.pluginId)}>
                Rollback
              </button>
              <button className="ghost" onClick={() => void pinPlugin(run.pluginId, run.fromVersion)}>
                Pin Current
              </button>
              <button className="ghost">View Diff</button>
            </div>
          </article>
        )
      })}
    </section>
  )
}
