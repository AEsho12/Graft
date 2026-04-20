export function DesktopTitlebar() {
  const controls = window.graftDesktop?.windowControls

  return (
    <header className="custom-titlebar">
      <div className="window-controls">
        <button
          className="window-dot close"
          aria-label="Close window"
          onClick={() => void controls?.close()}
        />
        <button
          className="window-dot minimize"
          aria-label="Minimize window"
          onClick={() => void controls?.minimize()}
        />
        <button
          className="window-dot maximize"
          aria-label="Maximize window"
          onClick={() => void controls?.toggleMaximize()}
        />
      </div>
    </header>
  )
}
