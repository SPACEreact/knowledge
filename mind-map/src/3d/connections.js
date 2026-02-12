/**
 * Connection Lines Renderer
 * Draws lines between nodes with variable thickness
 */

import * as THREE from 'three';
import { store } from '../data/store.js';
import { storytellingCore } from './layers/storytellingCore.js';
import { structureRing } from './layers/structureRing.js';
import { domainsRing } from './layers/domainsRing.js';

class ConnectionRenderer {
    constructor() {
        this.group = new THREE.Group();
        this.lines = new Map();
        this.hoveredLine = null;
    }

    create() {
        this.updateConnections();
        return this.group;
    }

    getMeshForNode(nodeId) {
        return storytellingCore.getMesh(nodeId)
            || structureRing.getMesh(nodeId)
            || domainsRing.getMesh(nodeId);
    }

    updateConnections() {
        // Clear existing
        this.group.clear();
        this.lines.clear();

        const connections = store.getConnections();

        connections.forEach(conn => {
            const fromMesh = this.getMeshForNode(conn.from);
            const toMesh = this.getMeshForNode(conn.to);

            if (!fromMesh || !toMesh) return;

            // Skip if either node is not visible
            if (!fromMesh.visible || !toMesh.visible) return;

            this.createConnectionLine(conn, fromMesh, toMesh);
        });
    }

    createConnectionLine(conn, fromMesh, toMesh) {
        const fromPos = new THREE.Vector3();
        const toPos = new THREE.Vector3();
        fromMesh.getWorldPosition(fromPos);
        toMesh.getWorldPosition(toPos);

        // Create curved line (QuadraticBezier)
        const midPoint = new THREE.Vector3()
            .addVectors(fromPos, toPos)
            .multiplyScalar(0.5);

        // Lift the midpoint for arc effect
        const distance = fromPos.distanceTo(toPos);
        midPoint.y += distance * 0.2;

        const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
        const points = curve.getPoints(32);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Line width based on strength (1-5)
        const baseOpacity = 0.3 + (conn.strength / 5) * 0.4;

        // Gradient color based on node types
        const fromNode = store.getNodeById(conn.from);
        const toNode = store.getNodeById(conn.to);

        let color = 0x3b82f6; // Default blue
        if (fromNode?.layer === 'storytelling' || toNode?.layer === 'storytelling') {
            color = 0xf59e0b; // Amber for storytelling connections
        }

        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: baseOpacity,
            linewidth: 1 // Note: linewidth > 1 only works in WebGL with specific extensions
        });

        const line = new THREE.Line(geometry, material);
        line.userData = {
            connectionId: conn.id,
            explanation: conn.explanation,
            from: conn.from,
            to: conn.to,
            strength: conn.strength
        };

        this.lines.set(conn.id, line);
        this.group.add(line);

        // Add flow particles for stronger connections
        if (conn.strength >= 4) {
            this.addFlowParticles(curve, color, conn.id);
        }
    }

    addFlowParticles(curve, color, connId) {
        const particleCount = 3;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.15,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            curve,
            particles: true,
            offsets: Array.from({ length: particleCount }, (_, i) => i / particleCount)
        };

        this.group.add(particles);
    }

    update(delta, elapsed) {
        // Update dynamic connections (for orbiting structure nodes)
        store.getConnections().forEach(conn => {
            const line = this.lines.get(conn.id);
            if (!line) return;

            const fromMesh = this.getMeshForNode(conn.from);
            const toMesh = this.getMeshForNode(conn.to);

            if (!fromMesh || !toMesh) return;

            const fromPos = new THREE.Vector3();
            const toPos = new THREE.Vector3();
            fromMesh.getWorldPosition(fromPos);
            toMesh.getWorldPosition(toPos);

            const midPoint = new THREE.Vector3()
                .addVectors(fromPos, toPos)
                .multiplyScalar(0.5);
            midPoint.y += fromPos.distanceTo(toPos) * 0.2;

            const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
            const points = curve.getPoints(32);

            line.geometry.setFromPoints(points);
            line.geometry.attributes.position.needsUpdate = true;
        });

        // Animate flow particles
        this.group.children.forEach(child => {
            if (child.userData.particles) {
                const { curve, offsets } = child.userData;
                const positions = child.geometry.attributes.position.array;

                offsets.forEach((offset, i) => {
                    const t = (offset + elapsed * 0.2) % 1;
                    const point = curve.getPoint(t);
                    positions[i * 3] = point.x;
                    positions[i * 3 + 1] = point.y;
                    positions[i * 3 + 2] = point.z;
                });

                child.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    highlightConnection(connId, highlight = true) {
        const line = this.lines.get(connId);
        if (!line) return;

        line.material.opacity = highlight ? 0.9 : (0.3 + (line.userData.strength / 5) * 0.4);
        this.hoveredLine = highlight ? line : null;
    }

    getHoveredConnection() {
        return this.hoveredLine?.userData || null;
    }

    dispose() {
        this.lines.forEach(line => {
            line.geometry.dispose();
            line.material.dispose();
        });
        this.group.clear();
    }
}

export const connectionRenderer = new ConnectionRenderer();
