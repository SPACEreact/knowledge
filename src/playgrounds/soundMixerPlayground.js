/**
 * Sound Mixer Playground
 * 4-channel audio mixer (Dialogue, Music, SFX, Ambience)
 * with visual faders and waveform display.
 */

import { effect } from '@preact/signals-core';
import { mixerLevels } from '../state/signals.js';

export class SoundMixerPlayground {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.playing = true;
        this.time = 0;

        this._init();
    }

    _init() {
        const wrapper = document.createElement('div');
        wrapper.className = 'mixer-wrapper';

        // Waveform canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'mixer-canvas';
        this.canvas.width = 600;
        this.canvas.height = 150;
        this.ctx = this.canvas.getContext('2d');
        wrapper.appendChild(this.canvas);

        // Faders
        const faderContainer = document.createElement('div');
        faderContainer.className = 'mixer-faders';

        const channels = [
            { key: 'dialogue', label: 'DIA', color: '#22c55e', icon: '🗣️' },
            { key: 'music', label: 'MUS', color: '#8b5cf6', icon: '🎵' },
            { key: 'sfx', label: 'SFX', color: '#f59e0b', icon: '💥' },
            { key: 'ambience', label: 'AMB', color: '#06b6d4', icon: '🌊' }
        ];

        channels.forEach(ch => {
            const fader = document.createElement('div');
            fader.className = 'mixer-fader';
            fader.innerHTML = `
                <span class="mixer-icon">${ch.icon}</span>
                <div class="mixer-slider-track" style="--ch-color: ${ch.color}">
                    <input type="range" class="mixer-slider" orient="vertical"
                        data-channel="${ch.key}" min="0" max="1" step="0.01"
                        value="${mixerLevels.value[ch.key]}"
                        style="--track-color: ${ch.color}">
                </div>
                <span class="mixer-label">${ch.label}</span>
                <span class="mixer-db" id="db-${ch.key}">${this._toDb(mixerLevels.value[ch.key])}</span>
            `;
            faderContainer.appendChild(fader);
        });

        wrapper.appendChild(faderContainer);
        this.container.appendChild(wrapper);

        // Wire faders
        faderContainer.querySelectorAll('.mixer-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const ch = e.target.dataset.channel;
                const val = parseFloat(e.target.value);
                mixerLevels.value = {
                    ...mixerLevels.value,
                    [ch]: val
                };

                const dbEl = document.getElementById(`db-${ch}`);
                if (dbEl) dbEl.textContent = this._toDb(val);
            });
        });

        this._animate();
    }

    _toDb(value) {
        if (value === 0) return '-∞ dB';
        const db = 20 * Math.log10(value);
        return `${db.toFixed(1)} dB`;
    }

    _animate() {
        if (!this.playing) return;
        requestAnimationFrame(() => this._animate());
        this.time += 0.02;
        this._drawWaveform();
    }

    _drawWaveform() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const levels = mixerLevels.value;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, W, H);

        // Grid lines
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 0.5;
        for (let y = 0; y < H; y += H / 8) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        const channels = [
            { key: 'dialogue', color: '#22c55e', freq: 3.2, phase: 0 },
            { key: 'music', color: '#8b5cf6', freq: 1.5, phase: 1.2 },
            { key: 'sfx', color: '#f59e0b', freq: 8.0, phase: 2.4 },
            { key: 'ambience', color: '#06b6d4', freq: 0.5, phase: 3.6 }
        ];

        // Draw each channel
        channels.forEach(ch => {
            const amp = levels[ch.key] * (H / 4);
            if (amp < 1) return;

            ctx.strokeStyle = ch.color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();

            for (let x = 0; x < W; x++) {
                const t = (x / W) * Math.PI * 8 + this.time * ch.freq;
                let y = H / 2;

                // Complex waveform
                y += Math.sin(t * ch.freq + ch.phase) * amp * 0.6;
                y += Math.sin(t * ch.freq * 2.1 + ch.phase * 0.7) * amp * 0.25;
                y += Math.sin(t * ch.freq * 0.3 + ch.phase * 1.5) * amp * 0.15;

                // Add noise for SFX channel
                if (ch.key === 'sfx') {
                    y += (Math.random() - 0.5) * amp * 0.4;
                }

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        // Master level indicator
        const masterLevel = Object.values(levels).reduce((a, b) => a + b, 0) / 4;
        const barWidth = 6;
        const barHeight = H - 20;
        const barX = W - 20;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(barX, 10, barWidth, barHeight);

        const fillHeight = masterLevel * barHeight;
        const gradient = ctx.createLinearGradient(0, 10 + barHeight, 0, 10);
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(0.6, '#f59e0b');
        gradient.addColorStop(0.85, '#ef4444');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, 10 + barHeight - fillHeight, barWidth, fillHeight);
    }

    createControls(parentEl) {
        // Controls are built-in (faders). Just add tips.
        const tips = document.createElement('div');
        tips.className = 'playground-controls';
        tips.innerHTML = `
            <div class="pg-control-group">
                <label class="pg-label">🎚️ Mix Balance</label>
                <p class="pg-hint">Drag faders to hear how each layer affects the scene. In film, dialogue is typically -12 to -6 dB, music -18 to -12 dB.</p>
                <div class="pg-preset-row">
                    <button class="pg-chip" data-preset="dialogue-forward">Dialogue-Forward</button>
                    <button class="pg-chip" data-preset="music-forward">Music-Forward</button>
                    <button class="pg-chip" data-preset="atmospheric">Atmospheric</button>
                    <button class="pg-chip" data-preset="action">Action</button>
                </div>
            </div>
        `;

        const presets = {
            'dialogue-forward': { dialogue: 0.9, music: 0.3, sfx: 0.2, ambience: 0.15 },
            'music-forward': { dialogue: 0.5, music: 0.85, sfx: 0.2, ambience: 0.3 },
            'atmospheric': { dialogue: 0.3, music: 0.4, sfx: 0.15, ambience: 0.9 },
            'action': { dialogue: 0.6, music: 0.7, sfx: 0.95, ambience: 0.5 }
        };

        tips.querySelectorAll('.pg-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const p = presets[chip.dataset.preset];
                if (p) {
                    mixerLevels.value = { ...p };
                    // Sync sliders
                    this.container.querySelectorAll('.mixer-slider').forEach(slider => {
                        slider.value = p[slider.dataset.channel];
                    });
                    // Sync dB labels
                    Object.entries(p).forEach(([key, val]) => {
                        const dbEl = document.getElementById(`db-${key}`);
                        if (dbEl) dbEl.textContent = this._toDb(val);
                    });
                }
            });
        });

        parentEl.appendChild(tips);
        return tips;
    }

    dispose() {
        this.playing = false;
    }
}
