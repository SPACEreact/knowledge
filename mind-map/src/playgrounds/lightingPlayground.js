/**
 * 3-Point Lighting Playground
 * Interactive WebGPU/WebGL scene where you drag Key, Fill, and Back lights
 * around a subject and see real-time shadow/highlight changes.
 */

import * as THREE from 'three';
import { effect } from '@preact/signals-core';
import { PlaygroundRenderer } from './PlaygroundRenderer.js';
import { lightingState, colorTemp } from '../state/signals.js';

// Convert Kelvin to THREE.Color
function kelvinToColor(kelvin) {
    const t = kelvin / 100;
    let r, g, b;
    if (t <= 66) {
        r = 255;
        g = Math.max(0, Math.min(255, 99.47 * Math.log(t) - 161.12));
        b = t <= 19 ? 0 : Math.max(0, Math.min(255, 138.52 * Math.log(t - 10) - 305.04));
    } else {
        r = Math.max(0, Math.min(255, 329.7 * Math.pow(t - 60, -0.133)));
        g = Math.max(0, Math.min(255, 288.12 * Math.pow(t - 60, -0.0755)));
        b = 255;
    }
    return new THREE.Color(r / 255, g / 255, b / 255);
}

export class LightingPlayground {
    constructor(container) {
        this.renderer = new PlaygroundRenderer(container, { shadows: true });
        this.lights = {};
        this.helpers = {};
        this.dragging = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

        this._buildScene();
        this._setupDragging();
        this._connectSignals();
    }

    _buildScene() {
        const scene = this.renderer.scene;

        // Ground
        const groundGeo = new THREE.PlaneGeometry(12, 12);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.85,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Subject — stylized head/bust (sphere + cylinder)
        const headGeo = new THREE.SphereGeometry(0.45, 32, 32);
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xd4a37a,
            roughness: 0.6,
            metalness: 0.05
        });
        this.head = new THREE.Mesh(headGeo, skinMat);
        this.head.position.set(0, 1.6, 0);
        this.head.castShadow = true;
        scene.add(this.head);

        const bodyGeo = new THREE.CylinderGeometry(0.35, 0.5, 1.2, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.2
        });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.position.set(0, 0.6, 0);
        this.body.castShadow = true;
        scene.add(this.body);

        // Pedestal
        const pedestalGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.1, 32);
        const pedestalMat = new THREE.MeshStandardMaterial({
            color: 0x444444, roughness: 0.4, metalness: 0.5
        });
        const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
        pedestal.receiveShadow = true;
        scene.add(pedestal);

        // Ambient (very low)
        const ambient = new THREE.AmbientLight(0x222233, 0.15);
        scene.add(ambient);

        // Background
        scene.background = new THREE.Color(0x111111);

        // Create the 3 lights
        this._createLight('key', 0xfff4e0, 1.0, { x: -2, y: 3, z: 2 });
        this._createLight('fill', 0xe0e8ff, 0.4, { x: 2, y: 2, z: 1 });
        this._createLight('back', 0xffffff, 0.6, { x: 0, y: 2, z: -3 });
    }

    _createLight(name, color, intensity, pos) {
        const light = new THREE.SpotLight(color, intensity, 15, Math.PI / 4, 0.5, 1);
        light.position.set(pos.x, pos.y, pos.z);
        light.target.position.set(0, 1.2, 0);
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        light.shadow.bias = -0.001;
        this.renderer.scene.add(light);
        this.renderer.scene.add(light.target);

        // Helper sphere (draggable)
        const colors = { key: 0xffd700, fill: 0x6699ff, back: 0xffffff };
        const helperGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const helperMat = new THREE.MeshBasicMaterial({
            color: colors[name],
            transparent: true,
            opacity: 0.8
        });
        const helper = new THREE.Mesh(helperGeo, helperMat);
        helper.position.copy(light.position);
        helper.userData.lightName = name;
        this.renderer.scene.add(helper);

        // Label sprite
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 128, 48);
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = name === 'key' ? '#ffd700' : name === 'fill' ? '#6699ff' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(name.toUpperCase(), 64, 32);
        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9 });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(0.6, 0.22, 1);
        sprite.position.set(0, 0.25, 0);
        helper.add(sprite);

        // Line from helper to target
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(), new THREE.Vector3(0, 0, 0)
        ]);
        const lineMat = new THREE.LineBasicMaterial({
            color: colors[name],
            transparent: true,
            opacity: 0.25
        });
        const line = new THREE.Line(lineGeo, lineMat);
        this.renderer.scene.add(line);

        this.lights[name] = light;
        this.helpers[name] = { mesh: helper, line };

        // Update line each frame
        this.renderer.onUpdate(() => {
            const positions = line.geometry.attributes.position;
            if (positions) {
                positions.setXYZ(0, helper.position.x, helper.position.y, helper.position.z);
                positions.setXYZ(1, 0, 1.2, 0);
                positions.needsUpdate = true;
            }
        });
    }

    _setupDragging() {
        const canvas = this.renderer.renderer.domElement;
        const helpers = Object.values(this.helpers).map(h => h.mesh);

        canvas.addEventListener('pointerdown', (e) => {
            this.mouse.x = (e.offsetX / canvas.clientWidth) * 2 - 1;
            this.mouse.y = -(e.offsetY / canvas.clientHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.renderer.camera);

            const hits = this.raycaster.intersectObjects(helpers, false);
            if (hits.length > 0) {
                this.dragging = hits[0].object;
                this.renderer.controls.enabled = false;
                canvas.style.cursor = 'grabbing';
            }
        });

        canvas.addEventListener('pointermove', (e) => {
            if (!this.dragging) {
                // Hover cursor
                this.mouse.x = (e.offsetX / canvas.clientWidth) * 2 - 1;
                this.mouse.y = -(e.offsetY / canvas.clientHeight) * 2 + 1;
                this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
                const hits = this.raycaster.intersectObjects(helpers, false);
                canvas.style.cursor = hits.length > 0 ? 'grab' : 'default';
                return;
            }

            this.mouse.x = (e.offsetX / canvas.clientWidth) * 2 - 1;
            this.mouse.y = -(e.offsetY / canvas.clientHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.renderer.camera);

            // Project onto a plane at the light's Y height
            const dragPlane = new THREE.Plane(
                new THREE.Vector3(0, 1, 0),
                -this.dragging.position.y
            );
            const point = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(dragPlane, point);

            if (point) {
                this.dragging.position.x = point.x;
                this.dragging.position.z = point.z;

                // Sync light position
                const name = this.dragging.userData.lightName;
                this.lights[name].position.copy(this.dragging.position);

                // Update signal
                const state = { ...lightingState.value };
                state[`${name}Position`] = {
                    x: point.x,
                    y: this.dragging.position.y,
                    z: point.z
                };
                lightingState.value = state;
            }
        });

        canvas.addEventListener('pointerup', () => {
            this.dragging = null;
            this.renderer.controls.enabled = true;
            canvas.style.cursor = 'default';
        });
    }

    _connectSignals() {
        // React to signal changes (e.g., from UI sliders)
        effect(() => {
            const state = lightingState.value;

            ['key', 'fill', 'back'].forEach(name => {
                const light = this.lights[name];
                const helper = this.helpers[name]?.mesh;
                if (!light || !helper) return;

                const pos = state[`${name}Position`];
                const intensity = state[`${name}Intensity`];
                const temp = state[`${name}Temp`];

                light.position.set(pos.x, pos.y, pos.z);
                helper.position.set(pos.x, pos.y, pos.z);
                light.intensity = intensity;
                light.color = kelvinToColor(temp);
            });
        });
    }

    // Creates slider UI for the playground
    createControls(parentEl) {
        const controls = document.createElement('div');
        controls.className = 'playground-controls';
        controls.innerHTML = `
            <div class="pg-control-group">
                <label class="pg-label" style="color: #ffd700">⊕ Key Light</label>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">Intensity</span>
                    <input type="range" class="pg-slider" data-light="key" data-prop="Intensity" min="0" max="3" step="0.05" value="${lightingState.value.keyIntensity}">
                    <span class="pg-slider-value" id="key-intensity-val">${lightingState.value.keyIntensity.toFixed(1)}</span>
                </div>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">Color Temp</span>
                    <input type="range" class="pg-slider" data-light="key" data-prop="Temp" min="2000" max="10000" step="100" value="${lightingState.value.keyTemp}">
                    <span class="pg-slider-value" id="key-temp-val">${lightingState.value.keyTemp}K</span>
                </div>
            </div>
            <div class="pg-control-group">
                <label class="pg-label" style="color: #6699ff">◐ Fill Light</label>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">Intensity</span>
                    <input type="range" class="pg-slider" data-light="fill" data-prop="Intensity" min="0" max="3" step="0.05" value="${lightingState.value.fillIntensity}">
                    <span class="pg-slider-value" id="fill-intensity-val">${lightingState.value.fillIntensity.toFixed(1)}</span>
                </div>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">Color Temp</span>
                    <input type="range" class="pg-slider" data-light="fill" data-prop="Temp" min="2000" max="10000" step="100" value="${lightingState.value.fillTemp}">
                    <span class="pg-slider-value" id="fill-temp-val">${lightingState.value.fillTemp}K</span>
                </div>
            </div>
            <div class="pg-control-group">
                <label class="pg-label" style="color: #ffffff">◑ Back Light</label>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">Intensity</span>
                    <input type="range" class="pg-slider" data-light="back" data-prop="Intensity" min="0" max="3" step="0.05" value="${lightingState.value.backIntensity}">
                    <span class="pg-slider-value" id="back-intensity-val">${lightingState.value.backIntensity.toFixed(1)}</span>
                </div>
                <div class="pg-slider-row">
                    <span class="pg-slider-label">Color Temp</span>
                    <input type="range" class="pg-slider" data-light="back" data-prop="Temp" min="2000" max="10000" step="100" value="${lightingState.value.backTemp}">
                    <span class="pg-slider-value" id="back-temp-val">${lightingState.value.backTemp}K</span>
                </div>
            </div>
        `;

        // Wire up sliders
        controls.querySelectorAll('.pg-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const light = e.target.dataset.light;
                const prop = e.target.dataset.prop;
                const val = parseFloat(e.target.value);

                const state = { ...lightingState.value };
                state[`${light}${prop}`] = val;
                lightingState.value = state;

                // Update label
                const labelEl = controls.querySelector(`#${light}-${prop.toLowerCase()}-val`);
                if (labelEl) {
                    labelEl.textContent = prop === 'Temp' ? `${val}K` : val.toFixed(1);
                }
            });
        });

        parentEl.appendChild(controls);
        return controls;
    }

    dispose() {
        this.renderer.dispose();
    }
}
