const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('graftDesktop', {
  platform: process.platform,
  isDesktop: true,
})
