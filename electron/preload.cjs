const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('graftDesktop', {
  platform: process.platform,
  isDesktop: true,
  windowControls: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
  onAuthCallback: (callback) => {
    const listener = (_event, url) => callback(url)
    ipcRenderer.on('auth:callback', listener)
    return () => ipcRenderer.removeListener('auth:callback', listener)
  },
})
