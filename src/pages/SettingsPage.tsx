export function SettingsPage() {
  return (
    <section className="panel-stack">
      <h1>Settings</h1>
      <article className="row-card">
        <div>
          <h3>Telemetry and Privacy</h3>
          <p>Security events always on. Optional analytics can be turned off.</p>
        </div>
        <div className="row-controls">
          <button className="secondary">Manage Privacy</button>
        </div>
      </article>
    </section>
  )
}
