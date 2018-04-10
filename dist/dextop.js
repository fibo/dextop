require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"bindme":2,"events":3,"pdsp":4,"static-props":5}],2:[function(require,module,exports){
function bindme (self) {
  Array.prototype.slice.call(arguments, 1).forEach(function (func) {
    if (self[func]) self[func] = self[func].bind(self)
    else console.error('Method ' + func + ' is not defined')
  })
}

module.exports = exports.default = bindme

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],4:[function(require,module,exports){
module.exports=function(e){e.preventDefault();e.stopPropagation()}

},{}],5:[function(require,module,exports){
/**
 * @param {Object} obj
 * @returns {Function}
 */
function staticProps (obj) {
  /**
   * @param {Object} props
   * @param {Boolean} [enumerable]
   */
  return function (props, enumerable) {
    var staticProps = {}
    for (var propName in props) {
      var staticProp = {
        configurable: false,
        enumerable: enumerable
      }
      var prop = props[propName]
      if (typeof prop === 'function') {
        staticProp.get = prop
      } else {
        staticProp.value = prop
        staticProp.writable = false
      }
      staticProps[propName] = staticProp
    }
    Object.defineProperties(obj, staticProps)
  }
}
module.exports = exports.default = staticProps

},{}],"dextop":[function(require,module,exports){
// Support the following import syntaxes.
//
// const DextopWindow = require('dextop').Window
//
// import { DextopWindow } from 'dextop'
/// /
const DextopWindow = require('./DextopWindow')

module.exports = { Window: DextopWindow }
exports.default = { DextopWindow }

},{"./DextopWindow":1}]},{},[]);
