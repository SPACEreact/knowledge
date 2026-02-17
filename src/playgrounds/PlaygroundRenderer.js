/**
 * Playground Renderer
 * Lightweight Three.js scene factory for interactive concept demos.
 * Uses standard WebGLRenderer for maximum compatibility.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class PlaygroundRenderer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            antialias: true,
            alpha: true,
            shadows: true,
            ...options
        };

        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.updateCallbacks = [];
        this.disposed = false;

        this._init();
    }

    _init() {
        const rect = this.container.getBoundingClientRect();
        const w = rect.width || 600;
        const h = rect.height || 400;

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        this.camera.position.set(0, 2, 6);

        // Renderer — standard WebGL for widest browser support
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.options.antialias,
            alpha: this.options.alpha
        });

        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        if (this.options.shadows && this.renderer.shadowMap) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 20;

        // Resize
        this._resizeObserver = new ResizeObserver(() => this._onResize());
        this._resizeObserver.observe(this.container);

        // Animation loop
        this._animate();
    }

    _onResize() {
        if (this.disposed) return;
        const rect = this.container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w === 0 || h === 0) return;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    _animate() {
        if (this.disposed) return;
        requestAnimationFrame(() => this._animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        this.controls?.update();

        for (const cb of this.updateCallbacks) {
            cb(delta, elapsed);
        }

        this.renderer.render(this.scene, this.camera);
    }

    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    dispose() {
        this.disposed = true;
        this._resizeObserver?.disconnect();
        this.controls?.dispose();
        this.renderer?.dispose();
        if (this.renderer?.domElement?.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}
