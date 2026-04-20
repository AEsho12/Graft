import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !app.isPackaged

function createWindow() {
  const isMac = process.platform === 'darwin'
  const win = new BrowserWindow({
    width: 1000,
    height: 780,
    minWidth: 980,
    minHeight: 640,
    titleBarStyle: 'hidden',
    ...(isMac ? {} : { titleBarOverlay: true }),
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

  if (isMac) {
    win.setWindowButtonVisibility(false)
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
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
