/**
 * Storytelling Core Layer
 * Central glowing nodes representing meaning architecture
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { store } from '../../data/store.js';
import { LAYER_COLORS } from '../../data/schema.js';

class StorytellingCore {
    constructor() {
        this.group = new THREE.Group();
        this.nodeMeshes = new Map();
        this.labels = new Map();
        this.glowMeshes = [];
    }

    create() {
        const nodes = store.getNodes().filter(n => n.layer === 'storytelling');

        nodes.forEach(node => {
            this.createNodeMesh(node);
        });

        // Create central glow sphere
        this.createCoreGlow();

        return this.group;
    }

    createNodeMesh(node) {
        // Node sphere
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: LAYER_COLORS.storytelling,
            emissive: LAYER_COLORS.storytelling,
            emissiveIntensity: 0.3,
            metalness: 0.3,
            roughness: 0.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(node.x, node.y, node.z);
        mesh.userData = { nodeId: node.id, type: 'node' };

        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: LAYER_COLORS.storytelling,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glow);
        this.glowMeshes.push(glow);

        // Label
        const label = this.createLabel(node);
        label.position.set(0, 0.9, 0);
        mesh.add(label);

        this.nodeMeshes.set(node.id, mesh);
        this.labels.set(node.id, label);
        this.group.add(mesh);
    }

    createLabel(node) {
        const div = document.createElement('div');
        div.className = `node-label storytelling`;
        div.textContent = node.title;
        if (node.unclear) div.classList.add('unclear');

        return new CSS2DObject(div);
    }

    createCoreGlow() {
        // Large ambient glow at center
        const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: LAYER_COLORS.storytelling,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 0, 0);
        this.group.add(glow);
        this.centralGlow = glow;
    }

    update(delta, elapsed) {
        // Subtle pulsing
        this.glowMeshes.forEach((glow, i) => {
            const phase = elapsed * 2 + i * 0.5;
            glow.material.opacity = 0.1 + Math.sin(phase) * 0.05;
        });

        if (this.centralGlow) {
            this.centralGlow.material.opacity = 0.06 + Math.sin(elapsed) * 0.02;
            this.centralGlow.scale.setScalar(1 + Math.sin(elapsed * 0.5) * 0.05);
        }
    }

    getMesh(nodeId) {
        return this.nodeMeshes.get(nodeId);
    }

    getAllMeshes() {
        return Array.from(this.nodeMeshes.values());
    }

    highlightNode(nodeId, highlight = true) {
        const mesh = this.nodeMeshes.get(nodeId);
        if (!mesh) return;

        mesh.material.emissiveIntensity = highlight ? 0.8 : 0.3;
        mesh.scale.setScalar(highlight ? 1.2 : 1);
    }

    dispose() {
        this.nodeMeshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.group.clear();
    }
}

export const storytellingCore = new StorytellingCore();
