const electron = require('electron')
const {app} = electron
const {BrowserWindow} = electron

app.on('window-all-closed', function() {
    app.quit()
})

app.on('ready', function() {
    var mainWindow = new BrowserWindow({
        "width": 800,
        "height": 600,
        "min-width": 800,
        "min-height": 600
    })

    mainWindow.loadUrl('file://' + __dirname + '/index.html')
})
