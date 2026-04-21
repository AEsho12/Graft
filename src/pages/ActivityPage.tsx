import { useMemo } from 'react'
import { useAppState } from '../state/AppStateContext'

function formatActivityTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function actionLabel(action: string): string {
  if (action === 'install') return 'Installed'
  if (action === 'uninstall') return 'Removed'
  if (action === 'update') return 'Updated'
  if (action === 'pin') return 'Pinned'
  if (action === 'rollback') return 'Rollback'
  return action
}

export function ActivityPage() {
  const { activity } = useAppState()
  const stats = useMemo(() => {
    const now = new Date()
    const isSameDay = (value: string) => {
      const parsed = new Date(value)
      return (
        parsed.getDate() === now.getDate() &&
        parsed.getMonth() === now.getMonth() &&
        parsed.getFullYear() === now.getFullYear()
      )
    }

    return {
      todayCount: activity.filter((item) => isSameDay(item.createdAt)).length,
      installedCount: activity.filter((item) => item.action === 'install').length,
      updatedCount: activity.filter((item) => item.action === 'update').length,
      removedCount: activity.filter((item) => item.action === 'uninstall').length,
    }
  }, [activity])

  return (
    <section className="activity-log-shell">
      <header className="activity-log-header">
        <div>
          <h1 className="activity-log-title">Activity Log</h1>
          <p className="activity-log-subtitle">
            {activity.length} entries · {stats.todayCount} today
          </p>
        </div>
        <p className="activity-log-summary">
          <span>● {stats.installedCount} installed</span>
          <span>● {stats.updatedCount} updated</span>
          <span>● {stats.removedCount} removed</span>
        </p>
      </header>

      <div className="activity-log-table-wrap">
        <table className="activity-log-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Description</th>
              <th>Plugin</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {activity.length === 0 ? (
              <tr>
                <td className="activity-log-empty" colSpan={5}>
                  No activity yet. Installs and updates will appear here.
                </td>
              </tr>
            ) : (
              activity.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className={`activity-action-pill activity-action-pill-${entry.action}`}>
                      {actionLabel(entry.action)}
                    </span>
                  </td>
                  <td>{entry.message}</td>
                  <td>{entry.pluginName}</td>
                  <td>
                    <span className={`activity-status-badge activity-status-${entry.status}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td>{formatActivityTime(entry.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
