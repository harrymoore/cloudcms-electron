const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let mainWindow

app.on('window-all-closed', function () {
    // Quit when all windows are closed.
    app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

app.on('ready', createWindow)

function createWindow () {
    mainWindow = new BrowserWindow({width: 800, height: 600, "min-width": 800, "min-height": 600})

    mainWindow.loadURL(`file://${__dirname}/index.html`)

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}
