# dextop

> provides a minimal window manager in your browser

[Installation](#installation) |
[Example](#example) |
[Usage](#usage) |
[License](#license)

## Installation

With [npm](https://www.npmjs.com/) do

```bash
npm install dextop
```

or use a CDN like

```html
<script src="https://unpkg.com/dextop/dist/dextop.js"></script>
```

## Example

Try [Codepen demo] online, see [example folder on GitHub][example], or do the following locally

1. Clone [this repo](https://github.com/fibo/dextop).
2. Install deps: `npm install`.
3. Start dev server: `npm start`.

## Usage

Start with an empty div in your HTML, for example

```html
<div id="my-dextop-window"></div>
```

To import `DextopWindow` choose your favourite syntax among:

* `const DextopWindow = require('dextop').Window`
* `import { DextopWindow } from 'dextop'`

Create a **DextopWindow** instance, add some content.

```javascript
const myDiv = document.querySelector('#my-dextop-window')

const dextopWin = new DextopWindow(myDiv, { width: 400, height: 200 })

dextopWin.content.innerHTML = `<p>My content<p>`
```

First constructor argument is a DOM element, second argument is an object
to provide the following options:

| name          | default                |
|---------------|------------------------|
| autohide      | `true`                 |
| width         | `400`                  |
| height        | `300`                  |
| color         | `'rgba(0, 0, 0, 0.1)'` |
| x             | `0`                    |
| y             | `0`                    |
| border        | `1`                    |
| resizerSize   | `35`                   |
| toolbarHeight | `28`                   |


The `content` attribute holds a div which class is `dextop-content`, you
can optionally style it with a CSS like the following.

```css
.dextop-content {
  overflow: auto;

  /* Disable text selection */
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;

  /* Disable dragging */
  -webkit-user-drag: none;
          user-drag: none;
}
```

Class `DextopWindow` inherits from [EventEmitter], it is possible to listen to events like in the following snippet.

```javascript
dextop.on('move', ({ x, y }) => {
  console.log('updated position', x, y)
})
```

The following events are emitted:

| name   | data                |
|--------|---------------------|
| move   | `{ x, y }`          |
| resize | `{ width, height }` |

## License

[MIT](http://g14n.info/mit-license/)

[Codepen demo]: https://codepen.io/fibo/full/xPomej/ "Codepen demo"
[EventEmitter]: https://www.npmjs.com/package/events "EventEmitter"
[example]: https://github.com/fibo/dextop/tree/master/example "example folder on GitHub"
