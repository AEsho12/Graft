export function AnalyticsPage() {
  return (
    <section className="panel-grid analytics-grid">
      <article className="metric-card large">
        <p>Install Funnel</p>
        <h2>41% activation</h2>
        <span>112K views to 64K installs to 46K active</span>
      </article>
      <article className="metric-card">
        <p>D30 Retention</p>
        <h2>67%</h2>
        <span>Calendar Pro</span>
      </article>
      <article className="metric-card">
        <p>Rollback Rate</p>
        <h2>2.3%</h2>
        <span>Last release cycle</span>
      </article>
      <article className="metric-card wide">
        <p>Top Errors</p>
        <ul className="error-list">
          <li>INCOMPATIBLE_HOST_RANGE - 35</li>
          <li>MIGRATION_FAILED - 12</li>
          <li>HEALTHCHECK_TIMEOUT - 9</li>
        </ul>
      </article>
    </section>
  )
}
