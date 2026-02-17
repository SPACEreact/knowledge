/**
 * Focal Length Playground
 * Slide between 18mm and 200mm, watch perspective distortion change in real-time.
 */

import * as THREE from 'three';
import { effect } from '@preact/signals-core';
import { PlaygroundRenderer } from './PlaygroundRenderer.js';
import { focalLength } from '../state/signals.js';

export class FocalLengthPlayground {
    constructor(container) {
        this.renderer = new PlaygroundRenderer(container, { shadows: true });
        this._buildScene();
        this._connectSignals();
    }

    _buildScene() {
        const scene = this.renderer.scene;
        scene.background = new THREE.Color(0x1a1a2e);

        // Ground
        const groundGeo = new THREE.PlaneGeometry(30, 30);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a3e,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Grid of columns to show perspective distortion
        const colGeo = new THREE.CylinderGeometry(0.15, 0.15, 2, 16);
        const colMat = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            roughness: 0.3,
            metalness: 0.6
        });

        for (let row = -2; row <= 2; row++) {
            for (let col = 0; col < 8; col++) {
                const mesh = new THREE.Mesh(colGeo, colMat);
                mesh.position.set(row * 1.5, 1, -col * 2.5 - 2);
                mesh.castShadow = true;
                scene.add(mesh);
            }
        }

        // Subject in foreground
        const subjectGeo = new THREE.SphereGeometry(0.4, 32, 32);
        const subjectMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            roughness: 0.2,
            metalness: 0.7
        });
        this.subject = new THREE.Mesh(subjectGeo, subjectMat);
        this.subject.position.set(0, 1, 0);
        this.subject.castShadow = true;
        scene.add(this.subject);

        // Lighting
        const key = new THREE.DirectionalLight(0xffeedd, 1.2);
        key.position.set(-5, 8, 5);
        key.castShadow = true;
        scene.add(key);

        const fill = new THREE.AmbientLight(0x4466aa, 0.4);
        scene.add(fill);

        // Position camera looking at subject
        this.renderer.camera.position.set(0, 1.5, 5);
        this.renderer.camera.lookAt(0, 1, 0);
        this.renderer.controls.target.set(0, 1, 0);
    }

    _connectSignals() {
        effect(() => {
            const fl = focalLength.value;
            // Convert focal length to FOV (assuming 36mm full-frame sensor)
            const fov = 2 * Math.atan(36 / (2 * fl)) * (180 / Math.PI);
            this.renderer.camera.fov = fov;

            // Adjust camera distance to keep subject same size
            const baseDistance = 5;
            const baseFov = 2 * Math.atan(36 / (2 * 50)) * (180 / Math.PI);
            const scale = Math.tan((baseFov * Math.PI / 180) / 2) /
                Math.tan((fov * Math.PI / 180) / 2);
            this.renderer.camera.position.z = baseDistance * scale;

            this.renderer.camera.updateProjectionMatrix();
        });
    }

    createControls(parentEl) {
        const controls = document.createElement('div');
        controls.className = 'playground-controls';
        controls.innerHTML = `
            <div class="pg-control-group">
                <label class="pg-label">🔭 Focal Length</label>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">18mm</span>
                    <input type="range" class="pg-slider pg-slider-accent" min="18" max="200" step="1" value="${focalLength.value}" id="focal-slider">
                    <span class="pg-slider-label">200mm</span>
                </div>
                <div class="pg-readout" id="focal-readout">
                    <span class="pg-readout-big">${focalLength.value}mm</span>
                    <span class="pg-readout-sub" id="focal-fov"></span>
                </div>
                <div class="pg-lens-labels">
                    <button class="pg-chip" data-fl="24">Wide 24mm</button>
                    <button class="pg-chip" data-fl="35">Street 35mm</button>
                    <button class="pg-chip" data-fl="50">Normal 50mm</button>
                    <button class="pg-chip" data-fl="85">Portrait 85mm</button>
                    <button class="pg-chip" data-fl="135">Tele 135mm</button>
                </div>
            </div>
        `;

        const slider = controls.querySelector('#focal-slider');
        const readout = controls.querySelector('.pg-readout-big');
        const fovLabel = controls.querySelector('#focal-fov');

        const updateLabels = (val) => {
            readout.textContent = `${val}mm`;
            const fov = 2 * Math.atan(36 / (2 * val)) * (180 / Math.PI);
            fovLabel.textContent = `FOV: ${fov.toFixed(1)}°`;
        };

        slider.addEventListener('input', (e) => {
            focalLength.value = parseInt(e.target.value);
            updateLabels(focalLength.value);
        });

        controls.querySelectorAll('.pg-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const fl = parseInt(chip.dataset.fl);
                focalLength.value = fl;
                slider.value = fl;
                updateLabels(fl);
            });
        });

        updateLabels(focalLength.value);
        parentEl.appendChild(controls);
        return controls;
    }

    dispose() {
        this.renderer.dispose();
    }
}
