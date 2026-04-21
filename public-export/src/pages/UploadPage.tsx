export function UploadPage() {
  return (
    <section className="panel-stack">
      <h1>Upload Plugin</h1>
      <article className="row-card upload-card">
        <div>
          <h3>Publish a new version</h3>
          <p>Upload package, validate manifest, and submit for curated review.</p>
        </div>
        <div className="upload-actions">
          <button className="primary">Select File</button>
          <button className="secondary">Run Validation</button>
          <button className="ghost">Submit for Review</button>
        </div>
      </article>
      <article className="row-card">
        <div>
          <h3>Review SLA</h3>
          <p>New plugin: up to 3 business days. Updates: up to 1 business day.</p>
        </div>
      </article>
    </section>
  )
}
