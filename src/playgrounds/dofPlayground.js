/**
 * Depth of Field Playground
 * Aperture slider controls bokeh blur on background objects.
 */

import * as THREE from 'three';
import { effect } from '@preact/signals-core';
import { PlaygroundRenderer } from './PlaygroundRenderer.js';
import { aperture, focusDistance } from '../state/signals.js';

export class DOFPlayground {
    constructor(container) {
        this.renderer = new PlaygroundRenderer(container, { shadows: true });
        this.bgObjects = [];
        this.fgObjects = [];
        this._buildScene();
        this._connectSignals();
    }

    _buildScene() {
        const scene = this.renderer.scene;
        scene.background = new THREE.Color(0x0f1923);

        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({ color: 0x1a2633, roughness: 0.9 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Subject (in focus)
        const subjectMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, roughness: 0.25, metalness: 0.7
        });
        this.subject = new THREE.Mesh(new THREE.TorusKnotGeometry(0.4, 0.15, 64, 16), subjectMat);
        this.subject.position.set(0, 1.2, 0);
        this.subject.castShadow = true;
        scene.add(this.subject);

        // Background objects (will be blurred)
        const colors = [0xe85d75, 0x6C63FF, 0x22c55e, 0x06b6d4, 0x8b5cf6];
        const geos = [
            new THREE.IcosahedronGeometry(0.3, 0),
            new THREE.OctahedronGeometry(0.35, 0),
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.ConeGeometry(0.25, 0.6, 8),
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.DodecahedronGeometry(0.3, 0),
        ];

        for (let i = 0; i < 12; i++) {
            const mat = new THREE.MeshStandardMaterial({
                color: colors[i % colors.length],
                roughness: 0.4,
                metalness: 0.3
            });
            const mesh = new THREE.Mesh(geos[i % geos.length], mat);
            const angle = (i / 12) * Math.PI * 2;
            const radius = 2 + Math.random() * 3;
            mesh.position.set(
                Math.cos(angle) * radius,
                0.4 + Math.random() * 1.2,
                Math.sin(angle) * radius - 2
            );
            mesh.rotation.set(Math.random(), Math.random(), 0);
            mesh.castShadow = true;
            scene.add(mesh);
            this.bgObjects.push(mesh);
        }

        // Lighting
        const key = new THREE.DirectionalLight(0xffeedd, 1.5);
        key.position.set(-3, 6, 4);
        key.castShadow = true;
        scene.add(key);

        const fill = new THREE.AmbientLight(0x334466, 0.5);
        scene.add(fill);

        const rim = new THREE.PointLight(0x8b5cf6, 0.8, 10);
        rim.position.set(2, 3, -2);
        scene.add(rim);

        // Camera position
        this.renderer.camera.position.set(0, 2, 4);
        this.renderer.camera.lookAt(0, 1, 0);
        this.renderer.controls.target.set(0, 1, 0);

        // Animate subject rotation
        this.renderer.onUpdate((dt) => {
            this.subject.rotation.y += dt * 0.3;
        });
    }

    _connectSignals() {
        effect(() => {
            const a = aperture.value;
            // Simulate DOF with material transparency on bg objects
            // Lower aperture (wider) = more blur = more transparent bg
            const blurAmount = Math.max(0, 1 - (a / 16));
            this.bgObjects.forEach(obj => {
                obj.material.transparent = true;
                obj.material.opacity = 0.3 + (1 - blurAmount) * 0.7;
                // Scale objects slightly based on blur to simulate circle of confusion
                const cocScale = 1 + blurAmount * 0.15;
                obj.scale.setScalar(cocScale);
            });
        });
    }

    createControls(parentEl) {
        const controls = document.createElement('div');
        controls.className = 'playground-controls';
        controls.innerHTML = `
            <div class="pg-control-group">
                <label class="pg-label">🔘 Depth of Field</label>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">f/1.4</span>
                    <input type="range" class="pg-slider pg-slider-accent" min="1.4" max="16" step="0.1" value="${aperture.value}" id="dof-aperture">
                    <span class="pg-slider-label">f/16</span>
                </div>
                <div class="pg-readout">
                    <span class="pg-readout-big" id="dof-val">f/${aperture.value}</span>
                    <span class="pg-readout-sub" id="dof-desc">Shallow — cinematic bokeh</span>
                </div>
                <div class="pg-preset-row">
                    <button class="pg-chip" data-ap="1.4">f/1.4 Dreamy</button>
                    <button class="pg-chip" data-ap="2.8">f/2.8 Portrait</button>
                    <button class="pg-chip" data-ap="5.6">f/5.6 Balanced</button>
                    <button class="pg-chip" data-ap="11">f/11 Landscape</button>
                    <button class="pg-chip" data-ap="16">f/16 Deep</button>
                </div>
            </div>
        `;

        const slider = controls.querySelector('#dof-aperture');
        const valEl = controls.querySelector('#dof-val');
        const descEl = controls.querySelector('#dof-desc');

        const descMap = (v) => {
            if (v < 2) return 'Ultra shallow — dreamy separation';
            if (v < 4) return 'Shallow — cinematic bokeh';
            if (v < 8) return 'Balanced — moderate depth';
            if (v < 12) return 'Deep — most things sharp';
            return 'Maximum depth — everything in focus';
        };

        slider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            aperture.value = v;
            valEl.textContent = `f/${v.toFixed(1)}`;
            descEl.textContent = descMap(v);
        });

        controls.querySelectorAll('.pg-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const v = parseFloat(chip.dataset.ap);
                aperture.value = v;
                slider.value = v;
                valEl.textContent = `f/${v.toFixed(1)}`;
                descEl.textContent = descMap(v);
            });
        });

        parentEl.appendChild(controls);
        return controls;
    }

    dispose() { this.renderer.dispose(); }
}
