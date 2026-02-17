/**
 * Easing Curve Playground
 * Draw your own bezier curve, watch an animated object follow it in real-time.
 */

import { effect } from '@preact/signals-core';
import { easingPoints } from '../state/signals.js';

export class EasingPlayground {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'easing-canvas';
        this.ctx = null;
        this.animCanvas = document.createElement('canvas');
        this.animCanvas.className = 'easing-anim-canvas';
        this.animCtx = null;
        this.dragging = null;
        this.animProgress = 0;
        this.animTime = 0;
        this.playing = true;

        this._init();
    }

    _init() {
        // Curve canvas
        this.canvas.width = 300;
        this.canvas.height = 300;
        this.ctx = this.canvas.getContext('2d');

        // Animation preview canvas
        this.animCanvas.width = 300;
        this.animCanvas.height = 80;
        this.animCtx = this.animCanvas.getContext('2d');

        const wrapper = document.createElement('div');
        wrapper.className = 'easing-wrapper';
        wrapper.appendChild(this.canvas);
        wrapper.appendChild(this.animCanvas);
        this.container.appendChild(wrapper);

        this._setupDragging();
        this._connectSignals();
        this._animate();
    }

    _cubicBezier(t, p1x, p1y, p2x, p2y) {
        // De Casteljau's algorithm for cubic bezier from (0,0) to (1,1)
        const cx = 3 * p1x;
        const bx = 3 * (p2x - p1x) - cx;
        const ax = 1 - cx - bx;

        const cy = 3 * p1y;
        const by = 3 * (p2y - p1y) - cy;
        const ay = 1 - cy - by;

        // Find t for x using Newton's method
        let x = t;
        for (let i = 0; i < 8; i++) {
            const xCalc = ((ax * x + bx) * x + cx) * x;
            const xDeriv = (3 * ax * x + 2 * bx) * x + cx;
            if (Math.abs(xDeriv) < 1e-6) break;
            x -= (xCalc - t) / xDeriv;
        }

        return ((ay * x + by) * x + cy) * x;
    }

    _draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const pad = 30;
        const size = W - pad * 2;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0d0d1a';
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = '#1a1a3e';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const pos = pad + (i / 4) * size;
            ctx.beginPath();
            ctx.moveTo(pad, pos);
            ctx.lineTo(pad + size, pos);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos, pad);
            ctx.lineTo(pos, pad + size);
            ctx.stroke();
        }

        // Axes labels
        ctx.fillStyle = '#555';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('Time →', pad + size / 2 - 15, H - 5);
        ctx.save();
        ctx.translate(10, pad + size / 2 + 15);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Progress →', 0, 0);
        ctx.restore();

        const { p1, p2 } = easingPoints.value;

        // Control lines
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad, pad + size);
        ctx.lineTo(pad + p1.x * size, pad + size - p1.y * size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pad + size, pad);
        ctx.lineTo(pad + p2.x * size, pad + size - p2.y * size);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bezier curve
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pad, pad + size);
        for (let t = 0; t <= 1; t += 0.005) {
            const y = this._cubicBezier(t, p1.x, p1.y, p2.x, p2.y);
            ctx.lineTo(pad + t * size, pad + size - y * size);
        }
        ctx.stroke();

        // Animated dot on curve
        const progress = this.animProgress;
        const yProgress = this._cubicBezier(progress, p1.x, p1.y, p2.x, p2.y);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pad + progress * size, pad + size - yProgress * size, 6, 0, Math.PI * 2);
        ctx.fill();

        // Control points
        const drawHandle = (x, y, color) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(pad + x * size, pad + size - y * size, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        };
        drawHandle(p1.x, p1.y, '#22c55e');
        drawHandle(p2.x, p2.y, '#ef4444');

        // Draw animated ball
        this._drawAnimBall(yProgress);
    }

    _drawAnimBall(yProgress) {
        const ctx = this.animCtx;
        const W = this.animCanvas.width;
        const H = this.animCanvas.height;
        const pad = 15;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d0d1a';
        ctx.fillRect(0, 0, W, H);

        // Track
        ctx.strokeStyle = '#1a1a3e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pad, H / 2);
        ctx.lineTo(W - pad, H / 2);
        ctx.stroke();

        // Ball
        const x = pad + yProgress * (W - pad * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, H / 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    _animate() {
        if (!this.playing) return;
        requestAnimationFrame(() => this._animate());

        this.animTime += 0.012;
        // Ping-pong
        this.animProgress = (Math.sin(this.animTime * Math.PI) + 1) / 2;

        this._draw();
    }

    _setupDragging() {
        const pad = 30;
        const size = this.canvas.width - pad * 2;

        const getPoint = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const sx = (e.clientX - rect.left) / rect.width * this.canvas.width;
            const sy = (e.clientY - rect.top) / rect.height * this.canvas.height;
            return {
                x: Math.max(0, Math.min(1, (sx - pad) / size)),
                y: Math.max(-0.5, Math.min(1.5, (size - (sy - pad)) / size))
            };
        };

        const hitTest = (e) => {
            const pt = getPoint(e);
            const { p1, p2 } = easingPoints.value;
            const d1 = Math.hypot(pt.x - p1.x, pt.y - p1.y);
            const d2 = Math.hypot(pt.x - p2.x, pt.y - p2.y);
            if (d1 < 0.06) return 'p1';
            if (d2 < 0.06) return 'p2';
            return null;
        };

        this.canvas.addEventListener('pointerdown', (e) => {
            this.dragging = hitTest(e);
            if (this.dragging) {
                this.canvas.style.cursor = 'grabbing';
                this.canvas.setPointerCapture(e.pointerId);
            }
        });

        this.canvas.addEventListener('pointermove', (e) => {
            if (!this.dragging) {
                this.canvas.style.cursor = hitTest(e) ? 'grab' : 'crosshair';
                return;
            }
            const pt = getPoint(e);
            const current = { ...easingPoints.value };
            current[this.dragging] = pt;
            easingPoints.value = current;
        });

        this.canvas.addEventListener('pointerup', () => {
            this.dragging = null;
            this.canvas.style.cursor = 'crosshair';
        });
    }

    _connectSignals() {
        effect(() => {
            easingPoints.value; // subscribe
            this._draw();
        });
    }

    createControls(parentEl) {
        const controls = document.createElement('div');
        controls.className = 'playground-controls';

        const { p1, p2 } = easingPoints.value;

        controls.innerHTML = `
            <div class="pg-control-group">
                <label class="pg-label">📐 Bezier Curve</label>
                <div class="pg-readout">
                    <code class="pg-code" id="easing-code">cubic-bezier(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)})</code>
                </div>
                <div class="pg-preset-row">
                    <button class="pg-chip" data-preset="ease">ease</button>
                    <button class="pg-chip" data-preset="ease-in">ease-in</button>
                    <button class="pg-chip" data-preset="ease-out">ease-out</button>
                    <button class="pg-chip" data-preset="ease-in-out">ease-in-out</button>
                    <button class="pg-chip" data-preset="linear">linear</button>
                    <button class="pg-chip" data-preset="bounce">bounce</button>
                    <button class="pg-chip" data-preset="overshoot">overshoot</button>
                </div>
            </div>
        `;

        const presets = {
            'ease': { p1: { x: 0.25, y: 0.1 }, p2: { x: 0.25, y: 1 } },
            'ease-in': { p1: { x: 0.42, y: 0 }, p2: { x: 1, y: 1 } },
            'ease-out': { p1: { x: 0, y: 0 }, p2: { x: 0.58, y: 1 } },
            'ease-in-out': { p1: { x: 0.42, y: 0 }, p2: { x: 0.58, y: 1 } },
            'linear': { p1: { x: 0, y: 0 }, p2: { x: 1, y: 1 } },
            'bounce': { p1: { x: 0.6, y: -0.28 }, p2: { x: 0.735, y: 0.045 } },
            'overshoot': { p1: { x: 0.68, y: -0.55 }, p2: { x: 0.27, y: 1.55 } }
        };

        const codeEl = controls.querySelector('#easing-code');

        controls.querySelectorAll('.pg-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const preset = presets[chip.dataset.preset];
                if (preset) {
                    easingPoints.value = { p1: { ...preset.p1 }, p2: { ...preset.p2 } };
                }
            });
        });

        // Update CSS code display
        effect(() => {
            const { p1, p2 } = easingPoints.value;
            codeEl.textContent = `cubic-bezier(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)})`;
        });

        parentEl.appendChild(controls);
        return controls;
    }

    dispose() {
        this.playing = false;
    }
}
