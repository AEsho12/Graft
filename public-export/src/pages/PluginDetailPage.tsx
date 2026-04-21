import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppState } from '../state/AppStateContext'

export function PluginDetailPage() {
  const { pluginId = '' } = useParams()
  const { state, installPlugin, updatePluginVersion } = useAppState()
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [approved, setApproved] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!state) return null

  const plugin = state.plugins.find((item) => item.id === pluginId)
  if (!plugin) {
    return (
      <section className="panel-stack">
        <h1>Plugin not found</h1>
      </section>
    )
  }

  const installed = state.installed.find((item) => item.pluginId === plugin.id)

  const versions = useMemo(
    () =>
      state.pluginVersions
        .filter((version) => version.pluginId === plugin.id)
        .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt)),
    [plugin.id, state.pluginVersions],
  )

  const selected =
    versions.find((item) => item.version === selectedVersion) ?? versions[0]

  const installOrUpdate = async () => {
    try {
      if (!installed) {
        await installPlugin(plugin.id)
        setMessage('Plugin installed successfully.')
        return
      }

      if (!selected) {
        setMessage('No target version selected.')
        return
      }

      await updatePluginVersion(plugin.id, selected.version, approved)
      setMessage(`Updated to ${selected.version}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update plugin.')
    }
  }

  return (
    <section className="panel-stack">
      <article className="row-card detail-header">
        <div>
          <h1>{plugin.name}</h1>
          <p>{plugin.description}</p>
          <p className="subtle">
            {plugin.publisher} | {plugin.appProfile} | {plugin.rating.toFixed(1)} ★ | {plugin.installs} installs
          </p>
        </div>
        <div className="row-controls">
          <span className={`risk ${plugin.risk.toLowerCase()}`}>{plugin.risk}</span>
          <button className="primary" onClick={() => void installOrUpdate()}>
            {installed ? 'Install Selected Version' : 'Install Plugin'}
          </button>
        </div>
      </article>

      <article className="row-card detail-version-row">
        <div>
          <h3>Version History</h3>
          <p>Choose a version and review its permission/capability changes before activation.</p>
        </div>
        <div className="row-controls">
          <select
            className="version-select"
            value={selected?.version ?? ''}
            onChange={(event) => setSelectedVersion(event.target.value)}
          >
            {versions.map((version) => (
              <option key={version.version} value={version.version}>
                {version.version} ({version.status})
              </option>
            ))}
          </select>
          <span className="tag">Installed: {installed?.installedVersion ?? 'Not installed'}</span>
        </div>
      </article>

      {selected ? (
        <article className="row-card detail-diff-card">
          <div className="detail-diff-grid">
            <div>
              <h3>Changelog</h3>
              <ul className="error-list">
                {selected.changelog.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Permission Diff</h3>
              <p>
                Added: {selected.diff.permissionsAdded.length ? selected.diff.permissionsAdded.join(', ') : 'None'}
              </p>
              <p>
                Removed:{' '}
                {selected.diff.permissionsRemoved.length ? selected.diff.permissionsRemoved.join(', ') : 'None'}
              </p>
            </div>
            <div>
              <h3>Capability Diff</h3>
              <p>
                Added: {selected.diff.capabilitiesAdded.length ? selected.diff.capabilitiesAdded.join(', ') : 'None'}
              </p>
              <p>
                Removed:{' '}
                {selected.diff.capabilitiesRemoved.length ? selected.diff.capabilitiesRemoved.join(', ') : 'None'}
              </p>
            </div>
            <div>
              <h3>Compatibility</h3>
              <p>Before: {selected.diff.compatibilityBefore || 'N/A'}</p>
              <p>After: {selected.diff.compatibilityAfter || 'N/A'}</p>
            </div>
          </div>
          <div className="detail-approval">
            <p className="subtle">{selected.diff.riskSummary}</p>
            {selected.requiresReview ? (
              <label className="approval-toggle">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(event) => setApproved(event.target.checked)}
                />
                I approve this high-risk update and understand new permissions/capabilities.
              </label>
            ) : null}
          </div>
        </article>
      ) : null}

      {message ? <p className="subtle">{message}</p> : null}
    </section>
  )
}
