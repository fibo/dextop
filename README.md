# dextop

> is a window manager running in your browser

## Example

Try [Codepen demo](https://codepen.io/fibo/full/xPomej/), or

1. Clone this repo.
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

Create a dextop window instance, add some content.

```javascript
const myDiv = document.querySelector('#my-dextop-window')

const dextopWin = new DextopWindow(myDiv, { width: 400, height: 200 })

dextopWin.content.innerHTML = `
<p>My content<p>
`
```

First constructor argument is a DOM element, second argument is an object to provide the following options:

| name          | default                |
|---------------|------------------------|
| width         | `400`                  |
| height        | `300`                  |
| color         | `'rgba(0, 0, 0, 0.1)'` |
| top           | `0`                    |
| left          | `0`                    |
| border        | `1`                    |
| resizerSize   | `35`                   |
| toolbarHeight | `28`                   |


The `content` attribute holds a div with class `dextop-content`, you can optionally
style it with a CSS like the following.

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

Class `DextopWindow` inherits from [EventEmitter](https://www.npmjs.com/package/events), it is possible to
listen to events like in the following snippet.

```javascript
dextop.on('move', ({ top, left }) => {
  console.log('updated position', left, top)
})
```

The following events are emitted:

| name     | data             |
|----------|------------------|
| move   | `{ top, left }`    |
| resize | `{ link, linkId }` |

## License

[MIT](http://g14n.info/mit-license/)

