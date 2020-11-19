import {EasyCanvas} from "./easy_canvas.js";
import {Vector} from "./vector.js";

let objectIdCounter = 1;

class DrawingObject {
    constructor(parent, attrs = {}) {
        this.id = objectIdCounter;
        objectIdCounter += 1;
        this.parent = parent;
        this.attrs = attrs;
    }

    moveToBottom() {
        this.parent.objectMoveToBottom(this.id);
    }

    moveToTop() {
        this.parent.objectMoveToTop(this.id);
    }

    moveDown() {
        this.parent.objectMoveDown(this.id);
    }

    moveUp() {
        this.parent.objectMoveUp(this.id);
    }

    _draw(easyCanvas, offset) {

    }

    getStage() {
        let ptr = this;
        while(ptr && !ptr.easyCanvas) {
            ptr = ptr.parent;
        }
        return ptr;
    }
}

class LineObject extends DrawingObject {
    constructor(parent, linePoints, style = {}, attrs = {}) {
        super(parent, attrs);
        this.points = linePoints.map(v => v.slice()); // make a copy
        this.lineColor = style.lineColor || 'black';
        this.lineWidth = style.lineWidth || 1;
        this.lineDash = style.lineDash || [];
        this.lineCap = style.lineCap || 'round';
        this.lineJoin = style.lineJoin || 'round';
    }

    _draw(easyCanvas, offset) {
        easyCanvas.line(this.points.map(p => Vector.add(p, offset)), {
            lineColor: this.lineColor,
            lineWidth: this.lineWidth,
            lineDash: this.lineDash,
            lineCap: this.lineCap,
            lineJoin: this.lineJoin
        });
    }
}

class CircleObject extends DrawingObject {
    constructor(parent, center, radius, style = {}, attrs = {}) {
        super(parent, attrs);
        this.center = center.slice();
        this.radius = radius;
        this.lineColor = style.lineColor || 'black';
        this.lineWidth = style.lineWidth || 1;
        this.lineDash = style.lineDash || [];
        this.fillColor = style.fillColor;
    }

    _draw(easyCanvas, offset) {
        if (this.fillColor) {
            easyCanvas.circleFill(Vector.add(this.center, offset), this.radius, this.fillColor);
        }
        easyCanvas.circle(Vector.add(this.center, offset), this.radius, {
            lineColor: this.lineColor,
            lineWidth: this.lineWidth,
            lineDash: this.lineDash
        });
    }
}

class DrawLineObject extends LineObject {
    constructor(parent, points, endCallback, style = {}, attrs = {}) {
        super(parent, points, style, attrs);
        const stage = this.getStage();

        const moveCallback = stage.addMouseCallback('mousemove', (position) => {
            if (this.points.length && style.smooth) {
                const prev = this.points[this.points.length - 1];
                const delta = Vector.sub(prev, position);
                if (Vector.length(delta) > style.smooth) {
                    position = Vector.add(position, Vector.mul(delta, style.smooth / Vector.length(delta)))
                    this.points.push(position);
                }
            } else {
                this.points.push(position);
            }
        });

        const mouseupCallback = stage.addMouseCallback('mouseup', (position) => {
            stage.removeMouseCallback('mousemove', moveCallback);
            stage.removeMouseCallback('mouseup', mouseupCallback);
            endCallback(this);
        });
    }
}

class GroupObject extends DrawingObject {
    constructor(parent, attrs = {}) {
        super(parent, attrs)
        this.objects = [];
        this.offset = Vector.zero();
    }

    addLine(linePoints, style = {}, attrs = {}) {
        this.objects.push(new LineObject(this, linePoints, style, attrs));
        return this.objects[this.objects.length - 1];
    }

    addCircle(center, radius, style = {}, attrs = {}) {
        this.objects.push(new CircleObject(this, center, radius, style, attrs));
        return this.objects[this.objects.length - 1];
    }

    addDrawLine(points, endCallback = () => {}, style = {}, attrs = {}) {
        this.objects.push(new DrawLineObject(this, points, endCallback, style, attrs));
        return this.objects[this.objects.length - 1];
    }

    addGroup(attrs = {}) {
        this.objects.push(new GroupObject(this, attrs));
        return this.objects[this.objects.length - 1];
    }

    _draw(easyCanvas, offset = Vector.zero()) {
        for (const obj of this.objects) {
            obj._draw(easyCanvas, Vector.add(offset, this.offset));
        }
    }

    objectMoveToBottom(objectId) {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === objectId) {
                const obj = this.objects[i];
                this.objects.splice(i, 1);
                this.objects.unshift(obj);
            }
        }
    }

    objectMoveToTop(objectId) {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === objectId) {
                const obj = this.objects[i];
                this.objects.splice(i, 1);
                this.objects.push(obj);
            }
        }
    }

    objectMoveDown(objectId) {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === objectId && i > 0) {
                const obj = this.objects[i];
                this.objects[i] = this.objects[i - 1];
                this.objects[i - 1] = obj;
            }
        }
    }

    objectMoveUp(objectId) {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === objectId && i + 1 < this.objects.length) {
                const obj = this.objects[i];
                this.objects[i] = this.objects[i + 1];
                this.objects[i + 1] = obj;
            }
        }
    }
}

class Layer extends GroupObject {
    constructor(stage) {
        super(stage, {});
    }
}

export class EasyStage {
    /**
     * @param divId {string}
     * @param width {number}
     * @param height {number}
     * @param options {*}
     */
    constructor(divId, width, height, options = {}) {
        const canvas = document.createElement('canvas');
        canvas.id = `${divId}_canvas`;

        document.getElementById(divId).appendChild(canvas);

        this.easyCanvas = new EasyCanvas(`${divId}_canvas`, width, height);
        if (options.zoom) {
            this.easyCanvas.enableZoom();
        }
        if (options.drag) {
            this.easyCanvas.enableDrag();
        }

        this.layers = new Map();
        this.layersOrder = [];

        let drawLoop = () => {
            this.easyCanvas.clear();
            for (const layerName of this.layersOrder) {
                const layer = this.layers.get(layerName);
                layer._draw(this.easyCanvas);
            }
            requestAnimationFrame(drawLoop);
        };
        requestAnimationFrame(drawLoop);
    }

    getLayer(layerName) {
        if (this.layers.has(layerName)) {
            return this.layers.get(layerName);
        }
        this.layers.set(layerName, new Layer(this));
        this.layersOrder.push(layerName);
        return this.layers.get(layerName);
    }

    addMouseCallback(event, callback) {
        return this.easyCanvas.mouseCallback(event, callback);
    }

    removeMouseCallback(event, callback) {
        this.easyCanvas.removeMouseCallback(event, callback);
    }

}
