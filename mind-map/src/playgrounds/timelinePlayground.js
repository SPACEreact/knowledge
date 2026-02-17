/**
 * Editing Timeline Playground
 * Mini timeline with draggable cut points. Shows pacing rhythm.
 */

import { effect } from '@preact/signals-core';
import { timelineCuts, timelineBpm } from '../state/signals.js';

export class TimelinePlayground {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = null;
        this.dragging = null;
        this.playing = true;
        this.playhead = 0;
        this.totalDuration = 10;

        this._init();
    }

    _init() {
        this.canvas.width = 600;
        this.canvas.height = 200;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.className = 'timeline-canvas';
        this.container.appendChild(this.canvas);

        this._setupDragging();
        this._animate();
    }

    _draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const cuts = timelineCuts.value;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, W, H);

        const trackY = 40;
        const trackH = 80;
        const pad = 30;
        const trackW = W - pad * 2;

        // Time ruler
        ctx.fillStyle = '#333';
        ctx.font = '10px JetBrains Mono, monospace';
        for (let t = 0; t <= this.totalDuration; t++) {
            const x = pad + (t / this.totalDuration) * trackW;
            ctx.fillText(`${t}s`, x - 5, trackY - 8);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, trackY);
            ctx.lineTo(x, trackY + trackH);
            ctx.stroke();
        }

        // Draw clips (segments between cuts)
        const allCuts = [0, ...cuts.filter(c => c > 0 && c < this.totalDuration).sort((a, b) => a - b), this.totalDuration];
        const clipColors = ['#3b2456', '#1e3a5f', '#2a4433', '#4a2d3a', '#2d3a4a', '#3a3a2d', '#2d4a3a', '#4a3a2d'];

        for (let i = 0; i < allCuts.length - 1; i++) {
            const x1 = pad + (allCuts[i] / this.totalDuration) * trackW;
            const x2 = pad + (allCuts[i + 1] / this.totalDuration) * trackW;
            const clipWidth = x2 - x1;

            // Clip body
            ctx.fillStyle = clipColors[i % clipColors.length];
            ctx.fillRect(x1 + 1, trackY, clipWidth - 2, trackH);

            // Clip border
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.strokeRect(x1 + 1, trackY, clipWidth - 2, trackH);

            // Clip duration label
            const duration = (allCuts[i + 1] - allCuts[i]).toFixed(1);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            if (clipWidth > 35) {
                ctx.fillText(`${duration}s`, x1 + clipWidth / 2, trackY + trackH / 2 + 4);
            }
        }

        // Draw cut markers (draggable)
        cuts.forEach((cut, i) => {
            const x = pad + (cut / this.totalDuration) * trackW;

            // Cut line
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, trackY - 5);
            ctx.lineTo(x, trackY + trackH + 5);
            ctx.stroke();

            // Handle
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(x - 5, trackY - 5);
            ctx.lineTo(x + 5, trackY - 5);
            ctx.lineTo(x, trackY + 2);
            ctx.fill();
        });

        // Playhead
        const phX = pad + (this.playhead / this.totalDuration) * trackW;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(phX, trackY - 10);
        ctx.lineTo(phX, trackY + trackH + 10);
        ctx.stroke();

        // Playhead triangle
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(phX - 6, trackY - 10);
        ctx.lineTo(phX + 6, trackY - 10);
        ctx.lineTo(phX, trackY - 2);
        ctx.fill();

        // Rhythm visualization (bottom)
        const rhythmY = trackY + trackH + 30;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(pad, rhythmY, trackW, 40);

        // BPM grid
        const bpm = timelineBpm.value;
        const beatInterval = 60 / bpm;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1;
        for (let t = 0; t < this.totalDuration; t += beatInterval) {
            const x = pad + (t / this.totalDuration) * trackW;
            ctx.beginPath();
            ctx.moveTo(x, rhythmY);
            ctx.lineTo(x, rhythmY + 40);
            ctx.stroke();
        }

        // Highlight cuts that land on beats
        cuts.forEach(cut => {
            const nearestBeat = Math.round(cut / beatInterval) * beatInterval;
            const onBeat = Math.abs(cut - nearestBeat) < 0.05;
            const x = pad + (cut / this.totalDuration) * trackW;

            ctx.fillStyle = onBeat ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.3)';
            ctx.fillRect(x - 3, rhythmY, 6, 40);
        });

        // BPM label
        ctx.fillStyle = '#888';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`♩ ${bpm} BPM`, pad, rhythmY + 55);

        // Average pace
        const avgClipLen = this.totalDuration / allCuts.length;
        ctx.fillText(`Avg clip: ${avgClipLen.toFixed(1)}s`, pad + 120, rhythmY + 55);

        ctx.textAlign = 'start';
    }

    _animate() {
        if (!this.playing) return;
        requestAnimationFrame(() => this._animate());

        this.playhead += 0.016;
        if (this.playhead >= this.totalDuration) this.playhead = 0;

        this._draw();
    }

    _setupDragging() {
        const pad = 30;
        const trackW = this.canvas.width - pad * 2;

        this.canvas.addEventListener('pointerdown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width * this.canvas.width;
            const cuts = timelineCuts.value;

            for (let i = 0; i < cuts.length; i++) {
                const cx = pad + (cuts[i] / this.totalDuration) * trackW;
                if (Math.abs(mx - cx) < 10) {
                    this.dragging = i;
                    this.canvas.setPointerCapture(e.pointerId);
                    this.canvas.style.cursor = 'ew-resize';
                    return;
                }
            }
        });

        this.canvas.addEventListener('pointermove', (e) => {
            if (this.dragging === null) return;
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width * this.canvas.width;
            const t = Math.max(0.2, Math.min(this.totalDuration - 0.2,
                ((mx - pad) / trackW) * this.totalDuration));

            const newCuts = [...timelineCuts.value];
            newCuts[this.dragging] = Math.round(t * 20) / 20; // snap to 0.05s
            timelineCuts.value = newCuts;
        });

        this.canvas.addEventListener('pointerup', () => {
            this.dragging = null;
            this.canvas.style.cursor = 'default';
        });

        // Double-click to add a cut
        this.canvas.addEventListener('dblclick', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width * this.canvas.width;
            const t = ((mx - pad) / trackW) * this.totalDuration;
            if (t > 0.2 && t < this.totalDuration - 0.2) {
                timelineCuts.value = [...timelineCuts.value, Math.round(t * 20) / 20];
            }
        });
    }

    createControls(parentEl) {
        const controls = document.createElement('div');
        controls.className = 'playground-controls';
        controls.innerHTML = `
            <div class="pg-control-group">
                <label class="pg-label">✂️ Editing Rhythm</label>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">BPM</span>
                    <input type="range" class="pg-slider" min="60" max="200" step="1" value="${timelineBpm.value}" id="bpm-slider">
                    <span class="pg-slider-value" id="bpm-val">${timelineBpm.value}</span>
                </div>
                <p class="pg-hint">Drag red cut markers. <strong>Double-click</strong> to add new cuts. Green = on-beat, red = off-beat.</p>
                <div class="pg-preset-row">
                    <button class="pg-chip" data-bpm="72" data-cuts="4,8">Slow Drama</button>
                    <button class="pg-chip" data-bpm="120" data-cuts="1.5,3,4.5,6,7.5">Action</button>
                    <button class="pg-chip" data-bpm="140" data-cuts="0.7,1.4,2.1,2.8,3.5,4.2,5,5.7,6.4,7.1,7.8,8.5,9.2">Montage</button>
                    <button class="pg-chip" data-bpm="90" data-cuts="2.5,5,7.5">Documentary</button>
                </div>
            </div>
        `;

        const slider = controls.querySelector('#bpm-slider');
        const valEl = controls.querySelector('#bpm-val');

        slider.addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            timelineBpm.value = v;
            valEl.textContent = v;
        });

        controls.querySelectorAll('.pg-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const bpm = parseInt(chip.dataset.bpm);
                const cuts = chip.dataset.cuts.split(',').map(Number);
                timelineBpm.value = bpm;
                timelineCuts.value = cuts;
                slider.value = bpm;
                valEl.textContent = bpm;
            });
        });

        parentEl.appendChild(controls);
        return controls;
    }

    dispose() { this.playing = false; }
}
