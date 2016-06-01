let electron = require("electron")
let ipc = electron.ipcRenderer
let webFrame = electron.webFrame

let zoom = 0
let max = 9
let min = -1

ipc.on("zoom", function (event, direction) {
  (direction === 'in') ? (zoom++) : (zoom--)
  if (zoom > max) zoom = max
  if (zoom < min) zoom = min
  webFrame.setZoomLevel(zoom)
})