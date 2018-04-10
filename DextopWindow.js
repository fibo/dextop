const bindme = require('bindme')
const EventEmitter = require('events').EventEmitter
const pdsp = require('pdsp')
const staticProps = require('static-props')

class DextopWindow extends EventEmitter {
  constructor (container, {
    autohide = false,
    border = 1,
    color = 'rgba(0, 0, 0, 0.1)',
    width = 400, height = 300,
    x = 0, y = 0,
    resizerSize = 35,
    toolbarHeight = 28
  }) {
    bindme(super(),
      'onContainerMouseenter',
      'onContainerMouseleave',
      'onResizerMousedown',
      'onToolbarMousedown',
      'onWindowMousemove',
      'onWindowMouseup'
    )

    container.style['background-color'] = 'transparent'
    container.style.position = 'absolute'

    const content = document.createElement('div')
    content.style.position = 'absolute'
    content.style.left = 0
    content.style.top = `${toolbarHeight}px`
    content.classList.add('dextop-content')
    container.appendChild(content)

    const resizer = document.createElement('div')
    resizer.style['border-radius'] = '50%'
    resizer.style.cursor = 'move'
    resizer.style.position = 'absolute'
    resizer.style.height = `${resizerSize}px`
    resizer.style.width = `${resizerSize}px`
    container.appendChild(resizer)

    const toolbar = document.createElement('div')
    toolbar.classList.add('dextop-toolbar')
    toolbar.style.cursor = 'move'
    toolbar.style.height = `${toolbarHeight}px`
    container.appendChild(toolbar)

    this.autohide = autohide
    this.border = border
    this.color = color
    this.isMoving = false
    this.isResizing = false
    // Store clientX and clientY to compute position on dragging.
    this.previous = {}
    this.resizerSize = resizerSize
    this.toolbarHeight = toolbarHeight

    staticProps(this)({
      container,
      content,
      resizer,
      toolbar
    })

    // Apply position and dimensions: call first resize(), cause move()
    // depends on this.size.
    this.resize({ width, height })
    this.move({ x, y })

    // Events.

    container.addEventListener('mouseenter', this.onContainerMouseenter)
    container.addEventListener('mouseleave', this.onContainerMouseleave)

    toolbar.addEventListener('mousedown', this.onToolbarMousedown)

    resizer.addEventListener('mousedown', this.onResizerMousedown)

    window.addEventListener('mousemove', this.onWindowMousemove)
    window.addEventListener('mouseup', this.onWindowMouseup)

    // Start hidden if autohide is enabled.
    if (autohide) {
      this.hide()
    } else {
      this.show()
    }
  }

  hide () {
    const { border } = this

    this.container.style.border = `${border}px solid transparent`
    this.resizer.style['background-color'] = 'transparent'
    this.toolbar.style['background-color'] = 'transparent'
  }

  onContainerMouseenter () {
    if (this.autohide) {
      this.show()
    }
  }

  onContainerMouseleave () {
    const { autohide, isMoving, isResizing } = this

    if (!autohide) return

    if (!isMoving || !isResizing) {
      this.hide()
    }
  }

  onResizerMousedown (event) {
    pdsp(event)

    const { clientX, clientY } = event

    this.isResizing = true
    this.previous = { clientX, clientY }
  }

  onToolbarMousedown (event) {
    pdsp(event)

    const { clientX, clientY } = event

    this.isMoving = true
    this.previous = { clientX, clientY }
  }

  onWindowMousemove (event) {
    const { isMoving, isResizing } = this

    if (isMoving || isResizing) {
      const { clientX, clientY } = event

      const { position, previous, size } = this

      const dx = previous.clientX - clientX
      const dy = previous.clientY - clientY

      if (isMoving) {
        this.move({
          x: position.x - dx,
          y: position.y - dy
        })
      }

      if (isResizing) {
        this.resize({
          width: size.width - dx,
          height: size.height - dy
        })
      }

      this.previous = { clientX, clientY }
    }
  }

  onWindowMouseup () {
    this.stopMoving()
    this.stopResizing()
  }

  move ({x, y}) {
    const { container } = this

    const { width, height } = this.size

    // Bound position inside browser window.

    const topBound = window.innerHeight - height
    const top = Math.min(Math.max(y, 0), topBound)

    const leftBound = window.innerWidth - width
    const left = Math.min(Math.max(x, 0), leftBound)

    container.style.top = `${top}px`
    container.style.left = `${left}px`

    this.position = { x: left, y: top }
  }

  resize (size) {
    const { width, height } = this.size = size

    const {
      content, container, resizer,
      border, resizerSize, toolbarHeight
    } = this

    // Do not resize too much.
    const w = Math.max(width, toolbarHeight)
    const h = Math.max(height, toolbarHeight)

    container.style.height = `${h + toolbarHeight}px`
    container.style.width = `${w}px`

    content.style.height = `${h}px`
    content.style.width = `${w}px`

    resizer.style.left = `${w + border - (resizerSize / 2)}px`
    resizer.style.top = `${h + border + toolbarHeight - (resizerSize / 2)}px`
  }

  show () {
    const { border, color } = this

    this.container.style.border = `${border}px solid ${color}`
    this.resizer.style['background-color'] = color
    this.toolbar.style['background-color'] = color
  }

  stopMoving () {
    if (this.isMoving) {
      this.isMoving = false
      this.emit('move', this.position)
    }
  }

  stopResizing () {
    if (this.isResizing) {
      this.isResizing = false
      this.emit('resize', this.size)
    }
  }
}

module.exports = DextopWindow
