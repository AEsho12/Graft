declare global {
  interface Window {
    graftDesktop?: {
      platform: string
      isDesktop: boolean
      windowControls?: {
        minimize: () => Promise<void>
        toggleMaximize: () => Promise<boolean>
        close: () => Promise<void>
      }
    }
  }
}

export {}
