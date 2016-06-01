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
    fullscreen: true,
    frame: false
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)
  
  // mainWindow.webContents.openDevTools()

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
const robot = require('robotjs')

server.listen(3000);

expressApp.use(express.static('public'))

let s = robot.getScreenSize()
let mousePos = robot.getMousePos()

io.on('connection', function (socket) {

  socket.on('open', function (data) {
    console.log(data)
    mainWindow.send('browser', data.url || 'blank.html')
    killVlc().then( function () {
      if (data.file) play(data.file)
    })
  })
  
  socket.on('nav', function (action) {
    if (action === 'scrollUp') {
      robot.scrollMouse(5, "up")
    } else if (action === 'scrollDown') {
      robot.scrollMouse(5, "down")
    } else {
      mainWindow.send('nav', action)    
    }
  })

  socket.on('touchMove', function (offset) {
    mousePos = robot.getMousePos()
    console.log(offset)
    robot.moveMouse(mousePos.x + offset.dx*3, mousePos.y + offset.dy*3)
  })

  socket.on('mouseClick', function () {
    console.log('mouseClicked')
    robot.mouseClick('left', false) // doubleclick = false
  })
  
  socket.on('volume', function (value) {
    console.log(value)
    let cmd = 'amixer -q -D pulse sset Master '
    if (value === 'up') cmd += '5%+'
    else if (value === 'down') cmd += '5%-'
    else cmd += 'toggle'
    exec(cmd, function(error, stdout, stderr) {
      exec('amixer -q -D pulse sget Master', function(error, stdout, stderr) {
        console.log(stdout)
        mainWindow.send('volume', stdout)
      })
    })
  })


  // let damper = 0
  // socket.on('scroll', function (direction) {
  //   console.log(direction)
  //   if (damper < 2 && damper > -2) {
  //     damper += direction
  //     console.log(damper)
  //     return
  //   } else {
  //     if (damper === 2)
  //       robot.scrollMouse(1, "up")
  //     else {
  //       robot.scrollMouse(1, "down")
  //     }
  //     damper = 0
  //   }
  // })

  socket.on('type', function (character) {
    console.log(character)
    // Fix bug with enter not getting detected
    if (character === 'enter') robot.keyTap('enter')
    try { robot.keyTap(character) }
    catch (err) { console.log(err) } 
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
    let cmd = `cvlc --fullscreen --no-video-title --no-mouse-events '${__dirname}/${file}'`
    exec(cmd, function(error, stdout, stderr) {
      resolve()
    })
  })
}
