import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !app.isPackaged
const APP_PROTOCOL = 'graft'
const APP_AUTH_CALLBACK_PREFIX = `${APP_PROTOCOL}://auth/callback`
let mainWindow = null
let pendingAuthCallbackUrl = null

function handleDeepLink(url) {
  if (typeof url !== 'string' || !url.startsWith(APP_AUTH_CALLBACK_PREFIX)) return

  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('auth:callback', url)
    return
  }

  pendingAuthCallbackUrl = url
}

function createWindow() {
  const isMac = process.platform === 'darwin'
  const win = new BrowserWindow({
    width: 980,
    height: 640,
    minWidth: 980,
    minHeight: 640,
    titleBarStyle: isMac ? 'hidden' : 'hidden',
    ...(isMac
      ? {
          trafficLightPosition: { x: 20, y: 20 },
        }
      : { titleBarOverlay: true }),
    roundedCorners: true,
    movable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('did-finish-load', () => {
    if (pendingAuthCallbackUrl) {
      win.webContents.send('auth:callback', pendingAuthCallbackUrl)
      pendingAuthCallbackUrl = null
    }
  })

  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null
    }
  })

  mainWindow = win
}

ipcMain.handle('window:minimize', (event) => {
  const target = BrowserWindow.fromWebContents(event.sender)
  target?.minimize()
})

ipcMain.handle('window:toggleMaximize', (event) => {
  const target = BrowserWindow.fromWebContents(event.sender)
  if (!target) return false
  if (target.isMaximized()) {
    target.unmaximize()
    return false
  }
  target.maximize()
  return true
})

ipcMain.handle('window:close', (event) => {
  const target = BrowserWindow.fromWebContents(event.sender)
  target?.close()
})

ipcMain.handle('system:openExternal', async (_event, url) => {
  if (typeof url !== 'string' || url.trim().length === 0) return false
  try {
    await shell.openExternal(url)
    return true
  } catch {
    return false
  }
})

const singleInstanceLock = app.requestSingleInstanceLock()
if (!singleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const deepLinkArg = argv.find((value) => value.startsWith(`${APP_PROTOCOL}://`))
    if (deepLinkArg) {
      handleDeepLink(deepLinkArg)
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    } else {
      createWindow()
    }
  })

  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleDeepLink(url)
  })

  app.setAsDefaultProtocolClient(APP_PROTOCOL)

  app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
