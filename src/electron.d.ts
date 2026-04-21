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
      openExternal?: (url: string) => Promise<boolean>
      onAuthCallback?: (callback: (url: string) => void) => () => void
    }
  }
}

export {}
