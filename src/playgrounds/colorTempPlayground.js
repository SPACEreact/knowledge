/**
 * Color Temperature Playground
 * Gradient slider 2000K–10000K, scene color shifts live.
 */

import * as THREE from 'three';
import { effect } from '@preact/signals-core';
import { PlaygroundRenderer } from './PlaygroundRenderer.js';
import { colorTemp, colorTempRGB } from '../state/signals.js';

export class ColorTempPlayground {
    constructor(container) {
        this.renderer = new PlaygroundRenderer(container, { shadows: true });
        this._buildScene();
        this._connectSignals();
    }

    _buildScene() {
        const scene = this.renderer.scene;
        scene.background = new THREE.Color(0x111118);

        // Room walls
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xd4c9b8, roughness: 0.85 });
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), wallMat);
        backWall.position.set(0, 2, -3);
        backWall.receiveShadow = true;
        scene.add(backWall);

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6),
            new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Subject — a warm-toned still life
        const vaseMat = new THREE.MeshStandardMaterial({ color: 0xc1794e, roughness: 0.5, metalness: 0.1 });
        const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1, 16), vaseMat);
        vase.position.set(0, 0.5, 0);
        vase.castShadow = true;
        scene.add(vase);

        const bowlMat = new THREE.MeshStandardMaterial({ color: 0xe8d5b7, roughness: 0.4 });
        const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), bowlMat);
        bowl.position.set(1, 0, 0.5);
        bowl.castShadow = true;
        scene.add(bowl);

        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.5 }));
        fruit.position.set(0.8, 0.2, 0.6);
        fruit.castShadow = true;
        scene.add(fruit);

        // Main light (color will change)
        this.mainLight = new THREE.PointLight(0xffffff, 2, 12, 1);
        this.mainLight.position.set(-1, 3, 2);
        this.mainLight.castShadow = true;
        scene.add(this.mainLight);

        const ambient = new THREE.AmbientLight(0x000000, 0.15);
        scene.add(ambient);
        this.ambient = ambient;

        this.renderer.camera.position.set(0, 2, 4);
        this.renderer.camera.lookAt(0, 0.5, 0);
        this.renderer.controls.target.set(0, 0.5, 0);
    }

    _connectSignals() {
        effect(() => {
            const rgb = colorTempRGB.value;
            const c = new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255);
            this.mainLight.color = c;
            this.ambient.color = c;
            this.renderer.scene.background = new THREE.Color(
                rgb.r / 255 * 0.05,
                rgb.g / 255 * 0.05,
                rgb.b / 255 * 0.05
            );
        });
    }

    createControls(parentEl) {
        const controls = document.createElement('div');
        controls.className = 'playground-controls';
        controls.innerHTML = `
            <div class="pg-control-group">
                <label class="pg-label">🌡️ Color Temperature</label>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">🕯️ 2000K</span>
                    <input type="range" class="pg-slider" min="2000" max="10000" step="100" value="${colorTemp.value}" id="temp-slider" style="background: linear-gradient(to right, #ff9329, #fff4e0, #b3ccff);">
                    <span class="pg-slider-label">❄️ 10000K</span>
                </div>
                <div class="pg-readout">
                    <span class="pg-readout-big" id="temp-val">${colorTemp.value}K</span>
                    <span class="pg-readout-sub" id="temp-name">Daylight</span>
                </div>
                <div class="pg-preset-row">
                    <button class="pg-chip" data-temp="1800">🕯️ Candle</button>
                    <button class="pg-chip" data-temp="2700">💡 Tungsten</button>
                    <button class="pg-chip" data-temp="3200">🎬 Film</button>
                    <button class="pg-chip" data-temp="4100">🌅 Sunrise</button>
                    <button class="pg-chip" data-temp="5600">☀️ Daylight</button>
                    <button class="pg-chip" data-temp="6500">☁️ Overcast</button>
                    <button class="pg-chip" data-temp="8000">🌙 Shade</button>
                    <button class="pg-chip" data-temp="10000">❄️ Blue Sky</button>
                </div>
            </div>
        `;

        const slider = controls.querySelector('#temp-slider');
        const valEl = controls.querySelector('#temp-val');
        const nameEl = controls.querySelector('#temp-name');

        const nameMap = (k) => {
            if (k < 2000) return 'Candle flame';
            if (k < 3000) return 'Tungsten / warm bulb';
            if (k < 3500) return 'Film standard (3200K)';
            if (k < 4500) return 'Sunrise / golden hour';
            if (k < 5800) return 'Daylight (neutral)';
            if (k < 7000) return 'Overcast sky';
            if (k < 9000) return 'Open shade (cool)';
            return 'Clear blue sky';
        };

        slider.addEventListener('input', (e) => {
            const v = parseInt(e.target.value);
            colorTemp.value = v;
            valEl.textContent = `${v}K`;
            nameEl.textContent = nameMap(v);
        });

        controls.querySelectorAll('.pg-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const v = parseInt(chip.dataset.temp);
                colorTemp.value = v;
                slider.value = v;
                valEl.textContent = `${v}K`;
                nameEl.textContent = nameMap(v);
            });
        });

        parentEl.appendChild(controls);
        return controls;
    }

    dispose() { this.renderer.dispose(); }
}
