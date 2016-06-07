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

window.onload = function() {
  var script = document.createElement("script");
  script.src = "https://code.jquery.com/jquery-2.1.4.min.js";
  script.onload = script.onreadystatechange = function() {
    $(document).ready(function() {
      $('input, textarea').on("focus", function(){
        console.log('input prescript')
        ipc.sendToHost('input focused')
      })
    });
  };
  document.body.appendChild(script)
}


