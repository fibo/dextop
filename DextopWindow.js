const bindme = require('bindme')
const EventEmitter = require('events').EventEmitter

class DextopWindow extends EventEmitter {
  constructor (element, {
    border = 1,
    color = 'rgba(0, 0, 0, 0.1)',
    width = 400, height = 300,
    top = 0, left = 0,
    resizerSize = 35,
    toolbarHeight = 28
  }) {
    bindme(super(),
      'onToolbarMouseDown', 'onToolbarMouseLeave',
      'onToolbarMouseMove', 'onToolbarMouseUp',
      'onResizerMouseDown', 'onResizerMouseLeave',
      'onResizerMouseMove', 'onResizerMouseUp',
      'onWindowMouseEnter', 'onWindowMouseLeave'
    )

    element.style['background-color'] = 'transparent'
    element.style.border = `${border}px solid transparent`
    element.style.position = 'absolute'

    const toolbar = document.createElement('div')
    toolbar.classList.add('dextop-toolbar')
    toolbar.style['background-color'] = 'transparent'
    toolbar.style.cursor = 'move'
    toolbar.style.height = `${toolbarHeight}px`
    element.appendChild(toolbar)

    const content = document.createElement('div')
    content.classList.add('dextop-content')
    element.appendChild(content)

    const resizer = document.createElement('div')
    resizer.style['background-color'] = 'transparent'
    resizer.style['border-radius'] = '50%'
    resizer.style.cursor = 'move'
    resizer.style.position = 'absolute'
    resizer.style.height = `${resizerSize}px`
    resizer.style.width = `${resizerSize}px`

    element.appendChild(resizer)

    this.border = border
    this.color = color
    this.content = content
    this.element = element
    this.resizer = resizer
    this.resizerSize = resizerSize
    this.toolbar = toolbar
    this.toolbarHeight = toolbarHeight

    this.setDimensions({width, height})
    this.setPosition({top, left})

    // Store clientX and clientY to compute position on dragging.
    this.previous = {}

    // Events.

    element.onmouseenter = this.onWindowMouseEnter
    element.onmouseleave = this.onWindowMouseLeave
    toolbar.onmousedown = this.onToolbarMouseDown
    toolbar.onmouseleave = this.onToolbarMouseLeave
    resizer.onmousedown = this.onResizerMouseDown
    resizer.onmouseleave = this.onResizerMouseLeave
  }

  getDimensions () {
    const { border, toolbarHeight } = this

    const { width, height } = this.element.style

    return {
      width: parseInt(width, 10) - border * 2,
      height: parseInt(height, 10) - toolbarHeight - border * 2
    }
  }

  getPosition () {
    const { top, left } = this.element.style

    return { top: parseInt(top, 10), left: parseInt(left, 10) }
  }

  onResizerMouseDown (event) {
    event.preventDefault()

    const resizer = this.resizer
    const { clientX, clientY } = event

    this.previous = { clientX, clientY }

    // Reset handlers.
    this.stopResizing()

    resizer.onmousemove = this.onResizerMouseMove
    resizer.onmouseup = this.onResizerMouseUp
  }

  onResizerMouseLeave (event) {
    event.preventDefault()

    this.stopResizing()
  }

  onResizerMouseMove (event) {
    event.preventDefault()

    const { clientX, clientY } = event

    const previous = this.previous

    const dimension = this.getDimensions()

    const height = dimension.height - (previous.clientY - clientY)
    const width = dimension.width - (previous.clientX - clientX)

    this.setDimensions({ width, height })

    this.previous = { clientX, clientY }
  }

  onResizerMouseUp (event) {
    event.preventDefault()

    this.stopResizing()
  }

  onToolbarMouseDown (event) {
    event.preventDefault()

    const toolbar = this.toolbar
    const { clientX, clientY } = event

    this.previous = { clientX, clientY }

    this.removeDraggingListeners()

    toolbar.onmousemove = this.onToolbarMouseMove
    toolbar.onmouseup = this.onToolbarMouseUp
  }

  onToolbarMouseLeave (event) {
    event.preventDefault()

    this.stopDragging()
  }

  onToolbarMouseMove (event) {
    event.preventDefault()

    const { clientX, clientY } = event

    const element = this.element
    const previous = this.previous

    const top = element.offsetTop - (previous.clientY - clientY)
    const left = element.offsetLeft - (previous.clientX - clientX)

    this.setPosition({ top, left })

    this.previous = { clientX, clientY }
  }

  onToolbarMouseUp (event) {
    event.preventDefault()

    this.stopDragging()
  }

  onWindowMouseEnter (event) {
    event.preventDefault()

    const color = this.color

    this.element.style.border = `1px solid ${color}`
    this.resizer.style['background-color'] = color
    this.toolbar.style['background-color'] = color
  }

  onWindowMouseLeave (event) {
    event.preventDefault()

    this.element.style.border = '1px solid transparent'
    this.resizer.style['background-color'] = 'transparent'
    this.toolbar.style['background-color'] = 'transparent'
  }

  removeDraggingListeners () {
    const toolbar = this.toolbar

    toolbar.onmousemove = null
    toolbar.onmouseup = null
  }

  removeResizingListeners () {
    const resizer = this.resizer

    resizer.onmousemove = null
    resizer.onmouseup = null
  }

  setDimensions ({width, height}) {
    const {
      content, element, resizer,
      border, resizerSize, toolbarHeight
    } = this

    // Do not resize too much.
    if (width < toolbarHeight) width = toolbarHeight
    if (height < toolbarHeight) height = toolbarHeight

    const windowHeight = height + toolbarHeight + 2 * border
    const windowWidth = width + 2 * border

    element.style.height = `${windowHeight}px`
    element.style.width = `${windowWidth}px`

    content.style.height = `${height}px`
    content.style.width = `${width}px`

    resizer.style.left = `${windowWidth - (resizerSize / 2)}px`
    resizer.style.top = `${windowHeight - (resizerSize / 2)}px`
  }

  setPosition ({top, left}) {
    const element = this.element

    const { width, height } = this.getDimensions()

    // Bound position inside browser window.

    top = top > 0 ? top : 0
    left = left > 0 ? left : 0

    const topBound = window.innerHeight - height
    top = top > topBound ? topBound : top

    const leftBound = window.innerWidth - width
    left = left > leftBound ? leftBound : left

    element.style.top = `${top}px`
    element.style.left = `${left}px`
  }

  stopDragging () {
    this.removeDraggingListeners()

    const { top, left } = this.getPosition()

    this.emit('move', { top, left })
  }

  stopResizing () {
    this.removeResizingListeners()

    const { width, height } = this.getDimensions()

    this.emit('resize', { width, height })
  }
}

module.exports = DextopWindow
