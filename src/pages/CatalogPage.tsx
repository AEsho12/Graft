import { memo, useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppStateContext'
import type { Plugin } from '../types'

function formatRisk(risk: Plugin['risk']) {
  return risk.toLowerCase()
}

type PluginCardProps = {
  plugin: Plugin
  isInstalled: boolean
  onInstall: (pluginId: string) => void
  onUninstall: (pluginId: string) => void
}

const PluginCard = memo(function PluginCard({
  plugin,
  isInstalled,
  onInstall,
  onUninstall,
}: PluginCardProps) {
  return (
    <article className="plugin-card">
      <div className="plugin-card-top">
        <div>
          <h3>{plugin.name}</h3>
          <p>{plugin.publisher}</p>
        </div>
        <span className={`risk ${formatRisk(plugin.risk)}`}>{plugin.risk}</span>
      </div>
      <p className="desc">{plugin.description}</p>
      <div className="meta-row">
        <span>{plugin.rating.toFixed(1)} ★</span>
        <span>{plugin.installs} installs</span>
        <span>{plugin.appProfile}</span>
      </div>
      <div className="card-actions">
        {isInstalled ? (
          <button className="secondary" onClick={() => onUninstall(plugin.id)}>
            Uninstall
          </button>
        ) : (
          <button className="primary" onClick={() => onInstall(plugin.id)}>
            Install
          </button>
        )}
        <Link className="ghost link-button" to={`/catalog/${plugin.id}`}>
          Details
        </Link>
      </div>
    </article>
  )
})

export function CatalogPage() {
  const { state, installPlugin, uninstallPlugin } = useAppState()
  const [selectedCategory, setSelectedCategory] = useState('All')

  if (!state) return null

  const categories = ['All', ...Array.from(new Set(state.plugins.map((plugin) => plugin.category)))]

  const catalog = useMemo(() => {
    if (selectedCategory === 'All') return state.plugins
    return state.plugins.filter((plugin) => plugin.category === selectedCategory)
  }, [selectedCategory, state.plugins])

  const installedIds = useMemo(
    () => new Set(state.installed.map((item) => item.pluginId)),
    [state.installed],
  )
  const handleInstall = useCallback((pluginId: string) => {
    void installPlugin(pluginId)
  }, [installPlugin])
  const handleUninstall = useCallback((pluginId: string) => {
    void uninstallPlugin(pluginId)
  }, [uninstallPlugin])

  return (
    <section className="catalog-layout">
      <header className="catalog-header">
        <div>
          <h1>Catalog</h1>
          <p>Discover plugins built by the Graft community.</p>
        </div>
        <input className="search" placeholder="Search plugins, publishers, categories" />
      </header>

      <div className="segment-row">
        {categories.map((category) => (
          <button
            key={category}
            className={category === selectedCategory ? 'segment active' : 'segment'}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="featured-strip">
        {state.plugins
          .filter((plugin) => plugin.featured)
          .map((plugin) => (
            <article key={plugin.id} className="featured-card">
              <p className="eyebrow">Featured</p>
              <h3>{plugin.name}</h3>
              <p>{plugin.description}</p>
              <Link className="secondary link-button" to={`/catalog/${plugin.id}`}>
                View Plugin
              </Link>
            </article>
          ))}
      </div>

      <div className="plugin-grid">
        {catalog.map((plugin) => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            isInstalled={installedIds.has(plugin.id)}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
          />
        ))}
      </div>
    </section>
  )
}
