/**
 * Three.js Scene Setup
 * Initializes renderer, camera, controls, lighting
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

class Scene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.controls = null;
        this.animationId = null;
        this.clock = new THREE.Clock();
        this.updateCallbacks = [];
    }

    init(container) {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050508, 0.015);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(15, 12, 20);
        this.camera.lookAt(0, 0, 0);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        container.appendChild(this.renderer.domElement);

        // CSS2D Label Renderer
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.left = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        container.appendChild(this.labelRenderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 80;
        this.controls.maxPolarAngle = Math.PI * 0.85;
        this.controls.target.set(0, 0, 0);

        // Lighting
        this.setupLighting();

        // Background elements
        this.createBackground();

        // Handle resize
        window.addEventListener('resize', this.onResize.bind(this));

        // Start animation loop
        this.animate();

        return this;
    }

    setupLighting() {
        // Ambient light for base visibility
        const ambient = new THREE.AmbientLight(0x404060, 0.4);
        this.scene.add(ambient);

        // Main key light
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(10, 20, 10);
        this.scene.add(keyLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x8080ff, 0.3);
        fillLight.position.set(-10, 5, -10);
        this.scene.add(fillLight);

        // Storytelling core glow light
        const coreLight = new THREE.PointLight(0xf59e0b, 2, 20);
        coreLight.position.set(0, 0, 0);
        this.scene.add(coreLight);
        this.coreLight = coreLight;
    }

    createBackground() {
        // Starfield
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            const radius = 50 + Math.random() * 150;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
        this.stars = stars;

        // Grid helper (subtle)
        const grid = new THREE.GridHelper(100, 50, 0x1a1a25, 0x0a0a0f);
        grid.position.y = -5;
        grid.material.transparent = true;
        grid.material.opacity = 0.3;
        this.scene.add(grid);
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.labelRenderer.setSize(width, height);
    }

    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Update controls
        this.controls.update();

        // Subtle star rotation
        if (this.stars) {
            this.stars.rotation.y += delta * 0.01;
        }

        // Pulse core light
        if (this.coreLight) {
            this.coreLight.intensity = 2 + Math.sin(elapsed * 2) * 0.5;
        }

        // Run update callbacks
        this.updateCallbacks.forEach(cb => cb(delta, elapsed));

        // Render
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    focusOnPosition(position, duration = 1000) {
        const targetPos = new THREE.Vector3(
            position.x + 8,
            position.y + 6,
            position.z + 8
        );

        // Simple tween to position
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const endTarget = new THREE.Vector3(position.x, position.y, position.z);

        let startTime = null;

        const animateCamera = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            this.camera.position.lerpVectors(startPos, targetPos, eased);
            this.controls.target.lerpVectors(startTarget, endTarget, eased);

            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };

        requestAnimationFrame(animateCamera);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.renderer.dispose();
        window.removeEventListener('resize', this.onResize);
    }
}

export const scene = new Scene();
