# EasyCanvas

Small library for drawing on HTML canvas.

- `vector.js` - useful vector operations
- `easy_canvas.js` - wrapper around default canvas class
- `easy_stage.js` - simple interface for drawing and editing

# Example
```js
// <div id="my-div"></div>
const stage = new EasyStage("my-div", 800, 600, {zoom: false, drag: false});
const mainLayer = stage.getLayer("main");

const group = mainLayer.addGroup();
group.addCircle([-20, 10], 15);
group.addCircle([20, 10], 15);
group.addCircle([0, 0], 45);

mainLayer.addLine([[-10, 0], [10, 0]], {
    lineWidth: 5, 
    lineColor: '#BB7766'
});

stage.addMouseCallback('mousedown', (position) => {
    const line = mainLayer.addDrawLine([position], () => {}, {lineWidth: 4});
});
```
