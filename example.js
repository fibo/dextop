const DextopWindow = require('dextop').Window

const myDiv = document.createElement('div')
document.body.appendChild(myDiv)

const dextopWin = new DextopWindow(myDiv, { width: 400, height: 200 })

dextopWin.content.innerHTML = `
<p>My content<p>
`
