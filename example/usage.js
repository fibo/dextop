const DextopWindow = require('dextop').Window

var dextopWin = new DextopWindow(document.querySelector('#my-dextop-window'), {
  autohide: true,
  height: 200,
  width: 400,
  x: 500,
  y: 107
})

dextopWin.content.innerHTML = `<p>You can move me and resize me.<p>`
