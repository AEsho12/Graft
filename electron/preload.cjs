const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('graftDesktop', {
  platform: process.platform,
  isDesktop: true,
  windowControls: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
})
