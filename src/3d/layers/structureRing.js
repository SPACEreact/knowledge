/**
 * Structure Models Ring
 * Orbiting nodes: Hero's Journey, Story Circle, 3-Act, 5-Act
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { store } from '../../data/store.js';
import { LAYER_COLORS } from '../../data/schema.js';

class StructureRing {
    constructor() {
        this.group = new THREE.Group();
        this.nodeMeshes = new Map();
        this.labels = new Map();
        this.orbitRadius = 6;
        this.orbitSpeed = 0.05;
        this.baseAngles = new Map();
    }

    create() {
        const nodes = store.getNodes().filter(n => n.layer === 'structure');

        // Create orbit ring visual
        this.createOrbitRing();

        // Create nodes
        nodes.forEach((node, index) => {
            const angle = (index / nodes.length) * Math.PI * 2;
            this.baseAngles.set(node.id, angle);
            this.createNodeMesh(node, angle);
        });

        return this.group;
    }

    createOrbitRing() {
        // Torus for orbit path
        const ringGeometry = new THREE.TorusGeometry(this.orbitRadius, 0.02, 8, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: LAYER_COLORS.structure,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        this.group.add(ring);
        this.orbitRing = ring;

        // Glow ring
        const glowGeometry = new THREE.TorusGeometry(this.orbitRadius, 0.15, 8, 100);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: LAYER_COLORS.structure,
            transparent: true,
            opacity: 0.08
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = Math.PI / 2;
        this.group.add(glow);
        this.orbitGlow = glow;
    }

    createNodeMesh(node, angle) {
        // Icosahedron for structure nodes (distinct from storytelling spheres)
        const geometry = new THREE.IcosahedronGeometry(0.45, 1);
        const material = new THREE.MeshStandardMaterial({
            color: LAYER_COLORS.structure,
            emissive: LAYER_COLORS.structure,
            emissiveIntensity: 0.2,
            metalness: 0.5,
            roughness: 0.3,
            flatShading: true
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Position on orbit
        const x = Math.cos(angle) * this.orbitRadius;
        const z = Math.sin(angle) * this.orbitRadius;
        mesh.position.set(x, 0, z);
        mesh.userData = { nodeId: node.id, type: 'node' };

        // Glow
        const glowGeometry = new THREE.IcosahedronGeometry(0.6, 1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: LAYER_COLORS.structure,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glow);

        // Label
        const label = this.createLabel(node);
        label.position.set(0, 0.8, 0);
        mesh.add(label);

        this.nodeMeshes.set(node.id, mesh);
        this.labels.set(node.id, label);
        this.group.add(mesh);
    }

    createLabel(node) {
        const div = document.createElement('div');
        div.className = 'node-label structure';
        div.textContent = node.title;

        return new CSS2DObject(div);
    }

    update(delta, elapsed) {
        // Slow orbital rotation
        const offset = elapsed * this.orbitSpeed;

        this.nodeMeshes.forEach((mesh, nodeId) => {
            const baseAngle = this.baseAngles.get(nodeId) || 0;
            const angle = baseAngle + offset;

            mesh.position.x = Math.cos(angle) * this.orbitRadius;
            mesh.position.z = Math.sin(angle) * this.orbitRadius;

            // Gentle bobbing
            mesh.position.y = Math.sin(elapsed * 0.5 + baseAngle) * 0.3;

            // Slow rotation
            mesh.rotation.y += delta * 0.2;
            mesh.rotation.x += delta * 0.1;
        });

        // Pulse orbit glow
        if (this.orbitGlow) {
            this.orbitGlow.material.opacity = 0.06 + Math.sin(elapsed * 2) * 0.02;
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

        mesh.material.emissiveIntensity = highlight ? 0.6 : 0.2;
        mesh.scale.setScalar(highlight ? 1.3 : 1);
    }

    dispose() {
        this.nodeMeshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.group.clear();
    }
}

export const structureRing = new StructureRing();
