/**
 * Composition Playground
 * Drag elements on a canvas. Toggle rule-of-thirds, golden ratio, and leading lines overlays.
 */

export class CompositionPlayground {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = null;
        this.dragging = null;
        this.overlays = { thirds: true, golden: false, diagonals: false };

        this.elements = [
            { x: 0.33, y: 0.33, size: 0.08, color: '#f59e0b', label: 'Subject', shape: 'circle' },
            { x: 0.66, y: 0.55, size: 0.06, color: '#8b5cf6', label: 'Secondary', shape: 'circle' },
            { x: 0.2, y: 0.7, size: 0.12, color: '#22c55e', label: 'Foreground', shape: 'rect' },
            { x: 0.8, y: 0.25, size: 0.05, color: '#e85d75', label: 'Accent', shape: 'circle' },
            { x: 0.5, y: 0.8, size: 0.15, color: '#06b6d4', label: 'Ground', shape: 'rect' },
        ];

        this._init();
    }

    _init() {
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.className = 'composition-canvas';
        this.container.appendChild(this.canvas);

        this._setupDragging();
        this._draw();
    }

    _draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // Background — simulated frame
        ctx.fillStyle = '#0c0c18';
        ctx.fillRect(0, 0, W, H);

        // Gradient sky
        const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        sky.addColorStop(0, '#1a1a3e');
        sky.addColorStop(1, '#0c0c18');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H * 0.6);

        // Overlays
        if (this.overlays.thirds) this._drawThirds(ctx, W, H);
        if (this.overlays.golden) this._drawGoldenSpiral(ctx, W, H);
        if (this.overlays.diagonals) this._drawDiagonals(ctx, W, H);

        // Draw elements
        this.elements.forEach(el => {
            const x = el.x * W;
            const y = el.y * H;
            const r = el.size * W;

            ctx.globalAlpha = 0.85;
            ctx.fillStyle = el.color;
            ctx.shadowColor = el.color;
            ctx.shadowBlur = 15;

            if (el.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(x - r, y - r * 0.5, r * 2, r);
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(el.label, x, y + r + 14);
        });

        // Power points indicator (rule of thirds intersections)
        if (this.overlays.thirds) {
            const powerPoints = [
                [W / 3, H / 3], [2 * W / 3, H / 3],
                [W / 3, 2 * H / 3], [2 * W / 3, 2 * H / 3]
            ];

            this.elements.forEach(el => {
                const ex = el.x * W;
                const ey = el.y * H;
                powerPoints.forEach(([px, py]) => {
                    const dist = Math.hypot(ex - px, ey - py);
                    if (dist < 30) {
                        ctx.strokeStyle = '#22c55e';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(px, py, 12, 0, Math.PI * 2);
                        ctx.stroke();

                        // Snap glow
                        ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
                        ctx.beginPath();
                        ctx.arc(px, py, 20, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            });
        }
    }

    _drawThirds(ctx, W, H) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        for (let i = 1; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(W * i / 3, 0);
            ctx.lineTo(W * i / 3, H);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, H * i / 3);
            ctx.lineTo(W, H * i / 3);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    _drawGoldenSpiral(ctx, W, H) {
        const phi = 1.618;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 1.5;

        // Golden ratio lines
        const gx = W / phi;
        const gy = H / phi;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.moveTo(gx, 0); ctx.lineTo(gx, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(W - gx, 0); ctx.lineTo(W - gx, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, gy); ctx.lineTo(W, gy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, H - gy); ctx.lineTo(W, H - gy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Fibonacci spiral approximation
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let cx = gx, cy = H - gy;
        let r = gy;
        for (let i = 0; i < 6; i++) {
            ctx.arc(cx, cy, r, -Math.PI / 2 * i, -Math.PI / 2 * (i + 1), true);
            r /= phi;
        }
        ctx.stroke();
    }

    _drawDiagonals(ctx, W, H) {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(W, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(W, 0); ctx.lineTo(0, H);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    _setupDragging() {
        const getEl = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width;
            const my = (e.clientY - rect.top) / rect.height;

            for (const el of this.elements) {
                const dist = Math.hypot(mx - el.x, my - el.y);
                if (dist < el.size * 1.5) return { el, mx, my };
            }
            return null;
        };

        this.canvas.addEventListener('pointerdown', (e) => {
            const hit = getEl(e);
            if (hit) {
                this.dragging = hit.el;
                this.canvas.setPointerCapture(e.pointerId);
                this.canvas.style.cursor = 'grabbing';
            }
        });

        this.canvas.addEventListener('pointermove', (e) => {
            if (!this.dragging) {
                this.canvas.style.cursor = getEl(e) ? 'grab' : 'crosshair';
                return;
            }
            const rect = this.canvas.getBoundingClientRect();
            this.dragging.x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
            this.dragging.y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
            this._draw();
        });

        this.canvas.addEventListener('pointerup', () => {
            this.dragging = null;
            this.canvas.style.cursor = 'crosshair';
        });
    }

    createControls(parentEl) {
        const controls = document.createElement('div');
        controls.className = 'playground-controls';
        controls.innerHTML = `
            <div class="pg-control-group">
                <label class="pg-label">📐 Overlays</label>
                <div class="pg-toggle-row">
                    <label class="pg-toggle">
                        <input type="checkbox" checked data-overlay="thirds"> Rule of Thirds
                    </label>
                    <label class="pg-toggle">
                        <input type="checkbox" data-overlay="golden"> Golden Ratio
                    </label>
                    <label class="pg-toggle">
                        <input type="checkbox" data-overlay="diagonals"> Diagonals
                    </label>
                </div>
                <p class="pg-hint">Drag the colored elements to explore how placement affects visual weight. Green circles appear when elements snap to power points.</p>
            </div>
        `;

        controls.querySelectorAll('input[data-overlay]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                this.overlays[e.target.dataset.overlay] = e.target.checked;
                this._draw();
            });
        });

        parentEl.appendChild(controls);
        return controls;
    }

    dispose() { /* cleanup */ }
}
