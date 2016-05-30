// Electron
const electron = require('electron')
const ipc = require('electron').ipcMain;
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let mainWindow

let ppapiFlashPath = `${__dirname}/plugins/libpepflashplayer.so`
app.commandLine.appendSwitch('ppapi-flash-path', ppapiFlashPath)
app.commandLine.appendSwitch('ppapi-flash-version', '21.0.0.242')

let widevineCdmPath = `${__dirname}/plugins/libwidevinecdmadapter.so`
app.commandLine.appendSwitch('widevine-cdm-path', widevineCdmPath)
app.commandLine.appendSwitch('widevine-cdm-version', '1.4.8.885')

function createWindow () {

  mainWindow = new BrowserWindow({
    webPreferences: { plugins: true },
    fullscreen: false,
    frame: true
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})





// Server
const express = require('express')
const expressApp = express()
const server = require('http').Server(expressApp)
const io = require('socket.io')(server)
const exec = require('child_process').exec

server.listen(3000);

expressApp.use(express.static('public'))

io.on('connection', function (socket) {
  socket.on('open app', function (data) {
    console.log(data)
    mainWindow.send('browser', data.url || 'blank.html')
    killVlc().then( function () {
      if (data.file) play(data.file)
    })
  })
})

function killVlc () {
  return new Promise(function(resolve, reject) {
    let cmd = 'killall -9 vlc'
    exec(cmd, function(error, stdout, stderr) {
      resolve()
    })
  })
}

function play (file) {
  return new Promise(function(resolve, reject) {
    let cmd = `cvlc --fullscreen --no-video-title '${__dirname}/${file}'`
    exec(cmd, function(error, stdout, stderr) {
      resolve()
    })
  })
}
