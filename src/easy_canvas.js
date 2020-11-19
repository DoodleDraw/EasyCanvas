import {Vector} from './vector.js'

const SCALE_LEVELS = [0.04, 0.06, 0.09, 0.13, 0.2, 0.3, 0.45, 0.65, 1.0, 1.5, 2.25, 3.5, 5, 7.5, 11.5, 17, 25, 38];
const DEFAULT_SCALE_LEVEL = SCALE_LEVELS.indexOf(1);

export class EasyCanvas {

    /**
     * @param canvasId {string}
     * @param width {number}
     * @param height {number}
     */
    constructor(canvasId, width, height) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.width = width;
        this.height = height;

        this.previousMousePos = Vector.zero();
        this.mouseDown = false;

        this.cameraTarget = Vector.zero();
        this.scale = 1;

        this._updateSize();
        this._updateTransform();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this._updateSize();
        this._updateTransform();
    }

    fitToScreen() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this._updateSize();
        this._updateTransform();
    }

    enableDrag() {
        this.canvas.addEventListener("mousedown", (e) => {
            this.previousMousePos = [e.pageX, e.pageY];
            this.mouseDown = true;
        });
        this.canvas.addEventListener("mouseleave", (e) => {
            this.mouseDown = false;
        });
        this.canvas.addEventListener("mouseup", (e) => {
            this.mouseDown = false;
        });
        this.canvas.addEventListener("mousemove", (e) => {
            if (this.mouseDown) {
                const mouse = [e.pageX, e.pageY];
                const diff = Vector.mul(Vector.sub(mouse, this.previousMousePos), window.devicePixelRatio / this.scale);
                this.cameraTarget = Vector.add(this.cameraTarget, diff);
                this.previousMousePos = mouse;
                this._updateTransform();
            }
        });
    }

    enableZoom() {
        let scale_level = DEFAULT_SCALE_LEVEL;
        this.canvas.addEventListener("wheel", (e) => {
            if (e.deltaY < 0 && scale_level + 1 < SCALE_LEVELS.length) {
                scale_level++;
            }
            if (e.deltaY > 0 && scale_level > 0) {
                scale_level--;
            }
            this.scale = SCALE_LEVELS[scale_level];
            this._updateTransform();
        });
    }

    moveCameraTo(cameraTarget) {
        this.cameraTarget = cameraTarget;
        this._updateTransform();
    }

    clear() {
        this.ctx.clearRect(
            -(this.canvas.width * 0.5 + 5) / this.scale - this.cameraTarget[0],
            -(this.canvas.height * 0.5 + 5) / this.scale - this.cameraTarget[1],
            (this.canvas.width + 10) / this.scale,
            (this.canvas.height + 10) / this.scale
        );
    }

    renderCallback(callback) {
        let prevTimestamp = Date.now();
        const loop = () => {
            const curTimestamp = Date.now();
            callback(curTimestamp - prevTimestamp);
            prevTimestamp = curTimestamp;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    mouseCallback(event, callback) {
        const listener = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            callback([
                ((e.pageX - rect.left) * window.devicePixelRatio - this.canvas.width * 0.5) / this.scale - this.cameraTarget[0],
                ((e.pageY - rect.top) * window.devicePixelRatio - this.canvas.height * 0.5) / this.scale - this.cameraTarget[1]
            ]);
        };
        this.canvas.addEventListener(event, listener);
        return listener;
    }

    removeMouseCallback(event, callback) {
        this.canvas.removeEventListener(event, callback);
    }

    setStrokeStyle(style) {
        this.ctx.lineWidth = style.lineWidth || 1;
        this.ctx.strokeStyle = style.lineColor || 'black';
        this.ctx.lineCap = style.lineCap || 'round';
        this.ctx.lineJoin = style.lineJoin || 'round';
        this.ctx.setLineDash(style.lineDash || []);
    }

    setFillStyle(color) {
        this.ctx.fillStyle = color;
    }

    segment(from, to, style) {
        this.setStrokeStyle(style);
        this.ctx.beginPath();
        this.ctx.moveTo(from[0], from[1]);
        this.ctx.lineTo(to[0], to[1]);
        this.ctx.stroke();
    }

    line(points, style, close = false) {
        if (points.length === 0) {
            return;
        }
        this.setStrokeStyle(style);
        this.ctx.beginPath();
        this.ctx.moveTo(points[0][0], points[0][1]);
        if (points.length === 1) {
            this.ctx.lineTo(points[0][0], points[0][1]);
        }
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i][0], points[i][1]);
        }
        if (close) this.ctx.closePath();
        this.ctx.stroke();
    }

    circle(center, radius, style) {
        this.setStrokeStyle(style)
        this.ctx.beginPath();
        this.ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    circleFill(center, radius, color = 'black') {
        this.setFillStyle(color);
        this.ctx.beginPath();
        this.ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    _updateTransform() {
        this.ctx.resetTransform();
        this.ctx.translate(
            Math.round(this.canvas.width / 2),
            Math.round(this.canvas.height / 2),
        );
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(
            Math.round(this.cameraTarget[0]),
            Math.round(this.cameraTarget[1])
        );
    }

    _updateSize() {
        this.canvas.width = Math.round(this.width * window.devicePixelRatio);
        this.canvas.height = Math.round(this.height * window.devicePixelRatio);
        this.canvas.style.height = this.canvas.height / window.devicePixelRatio + "px";
        this.canvas.style.width = this.canvas.width / window.devicePixelRatio + "px";
    }
}
