import { Suspense, lazy, memo } from 'react'
import { defaultAppIcon } from '@/data/discoverAppMap'
import { seeAllAppMap } from '@/data/seeAllAppMap'
import { useEffect, useMemo, useState } from 'react'
import { useAppState } from '../state/AppStateContext'

type UpdatableApp = {
  pluginId: string
  name: string
  description: string
  issuedAt: string | null
  latestVersion: string
  canUpdate: boolean
}

const UpdateHistoryTab = lazy(() =>
  import('./UpdateHistoryTab').then((module) => ({ default: module.UpdateHistoryTab })),
)

const UpdateCard = memo(function UpdateCard({
  app,
  formatIssuedDate,
  onUpdate,
  onMore,
}: {
  app: UpdatableApp
  formatIssuedDate: (value: string | null) => string
  onUpdate: (app: UpdatableApp) => void
  onMore: (app: UpdatableApp) => void
}) {
  return (
    <article className="discover-app-card see-all-card">
      <div className="discover-app-main">
        <div className="discover-app-icon" aria-hidden="true">
          <img src={defaultAppIcon} alt="" />
        </div>
        <div className="see-all-card-copy">
          <div className="updates-title-row">
            <h3 className="discover-app-title">{app.name}</h3>
            <button className="discover-app-get" disabled={!app.canUpdate} onClick={() => onUpdate(app)}>
              Update
            </button>
          </div>
          <p className="discover-app-subtitle">{formatIssuedDate(app.issuedAt)}</p>
          <div className="updates-subtitle-row">
            <p className="discover-app-subtitle updates-subtitle-text">{app.description}</p>
            <button className="discover-section-link updates-more-button" onClick={() => onMore(app)}>
              More
            </button>
          </div>
        </div>
      </div>
    </article>
  )
})

export function UpdatesPage() {
  const { state, updatePluginVersion } = useAppState()
  const [isUpdatingAll, setIsUpdatingAll] = useState(false)
  const [selectedApp, setSelectedApp] = useState<UpdatableApp | null>(null)
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available')

  useEffect(() => {
    if (!selectedApp) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedApp(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedApp])

  const formatIssuedDate = (value: string | null) => {
    if (!value) return 'Issued date unavailable'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'Issued date unavailable'
    return `Issued ${parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`
  }

  const availableUpdates = useMemo<UpdatableApp[]>(() => {
    if (!state) return []

    const updatesByPlugin = new Map<string, UpdatableApp>()
    const findReleasedAt = (pluginId: string, version: string): string | null =>
      state.pluginVersions.find((item) => item.pluginId === pluginId && item.version === version)
        ?.releasedAt ?? null

    for (const installed of state.installed) {
      const plugin = state.plugins.find((entry) => entry.id === installed.pluginId)
      if (!plugin) continue
      if (installed.installedVersion === plugin.version) continue
      const updateRun = state.updates.find((run) => run.pluginId === plugin.id)

      updatesByPlugin.set(plugin.id, {
        pluginId: plugin.id,
        name: plugin.name,
        description:
          updateRun?.summary ??
          `Update available from version ${installed.installedVersion} to ${plugin.version}.`,
        issuedAt: findReleasedAt(plugin.id, plugin.version),
        latestVersion: plugin.version,
        canUpdate: true,
      })
    }

    for (const run of state.updates) {
      const plugin = state.plugins.find((entry) => entry.id === run.pluginId)
      if (!plugin) continue

      const existing = updatesByPlugin.get(run.pluginId)
      updatesByPlugin.set(run.pluginId, {
        pluginId: run.pluginId,
        name: plugin.name,
        description: run.summary,
        issuedAt: existing?.issuedAt ?? findReleasedAt(run.pluginId, run.toVersion),
        latestVersion: existing?.latestVersion ?? run.toVersion,
        canUpdate: true,
      })
    }

    for (const app of seeAllAppMap.filter((item) => item.action === 'update')) {
      const fallbackId = `catalog-${app.title.toLowerCase().replace(/\s+/g, '-')}`
      if (updatesByPlugin.has(fallbackId)) continue

      updatesByPlugin.set(fallbackId, {
        pluginId: fallbackId,
        name: app.title,
        description: app.subtitle,
        issuedAt: null,
        latestVersion: 'Latest',
        canUpdate: false,
      })
    }

    return Array.from(updatesByPlugin.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [state])

  if (!state) return null

  const handleUpdateAll = async () => {
    if (isUpdatingAll || availableUpdates.length === 0) return
    setIsUpdatingAll(true)

    try {
      for (const app of availableUpdates) {
        if (!app.canUpdate) continue
        await updatePluginVersion(app.pluginId, app.latestVersion, true)
      }
    } finally {
      setIsUpdatingAll(false)
    }
  }

  return (
    <section className="discover-page discover-layout">
      <div className="discover-content see-all-content">
        <div className="discover-section-row">
          <h1 className="discover-heading">Updates</h1>
          <button
            className="discover-section-link updates-update-all-button"
            onClick={() => void handleUpdateAll()}
          >
            {isUpdatingAll ? 'Updating...' : 'Update All'}
          </button>
        </div>

        <div className="discover-section-row">
          <h2 className="discover-section-heading">Available</h2>
          <div className="row-controls">
            <button
              className={activeTab === 'available' ? 'segment active' : 'segment'}
              onClick={() => setActiveTab('available')}
            >
              Available
            </button>
            <button
              className={activeTab === 'history' ? 'segment active' : 'segment'}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === 'available' ? (
          <section className="discover-app-grid see-all-grid updates-grid">
            {availableUpdates.map((app) => (
              <UpdateCard
                key={app.pluginId}
                app={app}
                formatIssuedDate={formatIssuedDate}
                onUpdate={(nextApp) => {
                  if (!nextApp.canUpdate) return
                  void updatePluginVersion(nextApp.pluginId, nextApp.latestVersion, true)
                }}
                onMore={setSelectedApp}
              />
            ))}
          </section>
        ) : (
          <Suspense fallback={<p className="subtle">Loading history...</p>}>
            <UpdateHistoryTab />
          </Suspense>
        )}
      </div>

      {selectedApp ? (
        <div
          className="updates-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedApp(null)}
        >
          <div className="updates-modal-card" onClick={(event) => event.stopPropagation()}>
            <p className="discover-app-subtitle updates-modal-description">{selectedApp.description}</p>
            <p className="discover-app-subtitle">Version {selectedApp.latestVersion}</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
