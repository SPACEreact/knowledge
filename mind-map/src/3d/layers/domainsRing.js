/**
 * Domains Outer Ring
 * 5 domain nodes with expandable subgroups
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { store } from '../../data/store.js';
import { DOMAIN_COLORS } from '../../data/schema.js';

class DomainsRing {
    constructor() {
        this.group = new THREE.Group();
        this.nodeMeshes = new Map();
        this.subgroupMeshes = new Map();
        this.labels = new Map();
        this.orbitRadius = 12;
        this.expandedDomain = null;
        this.expandAnimations = new Map();
    }

    create() {
        const domains = store.getNodes().filter(
            n => n.layer === 'domain' && !n.subgroup
        );

        // Create outer ring visual
        this.createOuterRing();

        // Create domain nodes
        domains.forEach((node, index) => {
            const angle = (index / domains.length) * Math.PI * 2 - Math.PI / 2;
            this.createDomainNode(node, angle);
        });

        // Create subgroup nodes (initially hidden)
        this.createSubgroups();

        return this.group;
    }

    createOuterRing() {
        // Dashed ring for outer boundary
        const geometry = new THREE.RingGeometry(this.orbitRadius - 0.1, this.orbitRadius + 0.1, 120);
        const material = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = -Math.PI / 2;
        this.group.add(ring);
    }

    createDomainNode(node, angle) {
        const color = DOMAIN_COLORS[node.domain] || 0xffffff;

        // Octahedron for domain nodes (distinct shape)
        const geometry = new THREE.OctahedronGeometry(0.7, 0);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.2,
            metalness: 0.6,
            roughness: 0.2
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Position
        const x = Math.cos(angle) * this.orbitRadius;
        const z = Math.sin(angle) * this.orbitRadius;
        mesh.position.set(x, 0, z);
        mesh.userData = { nodeId: node.id, type: 'domain', domain: node.domain };

        // Glow ring around domain
        const glowGeometry = new THREE.TorusGeometry(1, 0.08, 8, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = Math.PI / 2;
        mesh.add(glow);

        // Label
        const label = this.createLabel(node);
        label.position.set(0, 1.2, 0);
        mesh.add(label);

        this.nodeMeshes.set(node.id, mesh);
        this.labels.set(node.id, label);
        this.group.add(mesh);

        // Store original position
        mesh.userData.originalPosition = mesh.position.clone();
        mesh.userData.angle = angle;
    }

    createSubgroups() {
        const subgroups = store.getNodes().filter(n => n.layer === 'domain' && n.subgroup);

        subgroups.forEach(node => {
            this.createSubgroupNode(node);
        });
    }

    createSubgroupNode(node) {
        const color = DOMAIN_COLORS[node.domain] || 0xffffff;

        // Smaller sphere for subgroups
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.15,
            metalness: 0.4,
            roughness: 0.4,
            transparent: true,
            opacity: 0
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Start at parent domain position (will animate out)
        const parentNode = store.getNodeById(node.subgroup);
        const parentMesh = this.nodeMeshes.get(node.subgroup);

        if (parentMesh) {
            mesh.position.copy(parentMesh.position);
        } else {
            mesh.position.set(node.x, node.y, node.z);
        }

        mesh.userData = {
            nodeId: node.id,
            type: 'subgroup',
            domain: node.domain,
            parentId: node.subgroup,
            targetPosition: new THREE.Vector3(node.x, node.y, node.z)
        };
        mesh.visible = false;

        // Label
        const label = this.createLabel(node, true);
        label.position.set(0, 0.5, 0);
        label.element.style.opacity = '0';
        mesh.add(label);

        this.subgroupMeshes.set(node.id, mesh);
        this.labels.set(node.id, label);
        this.group.add(mesh);
    }

    createLabel(node, isSubgroup = false) {
        const div = document.createElement('div');
        div.className = `node-label ${isSubgroup ? '' : 'domain'} ${node.domain}`;
        div.textContent = node.title;
        if (node.unclear) div.classList.add('unclear');

        return new CSS2DObject(div);
    }

    expandDomain(domainId) {
        if (this.expandedDomain === domainId) {
            // Toggle off
            this.collapseDomain(domainId);
            return;
        }

        // Collapse previous
        if (this.expandedDomain) {
            this.collapseDomain(this.expandedDomain);
        }

        this.expandedDomain = domainId;
        store.toggleDomainExpand(domainId);

        // Animate subgroups out
        this.subgroupMeshes.forEach((mesh, id) => {
            if (mesh.userData.parentId === domainId) {
                mesh.visible = true;
                this.animateSubgroupExpand(mesh, true);
            }
        });

        // Highlight domain
        this.highlightNode(domainId, true);
    }

    collapseDomain(domainId) {
        this.expandedDomain = null;
        store.toggleDomainExpand(domainId);

        // Animate subgroups back
        this.subgroupMeshes.forEach((mesh, id) => {
            if (mesh.userData.parentId === domainId) {
                this.animateSubgroupExpand(mesh, false);
            }
        });

        // Un-highlight
        this.highlightNode(domainId, false);
    }

    animateSubgroupExpand(mesh, expand) {
        const startTime = performance.now();
        const duration = 600;
        const parentMesh = this.nodeMeshes.get(mesh.userData.parentId);

        const startPos = mesh.position.clone();
        const endPos = expand
            ? mesh.userData.targetPosition.clone()
            : parentMesh.position.clone();

        const label = this.labels.get(mesh.userData.nodeId);

        const animate = (time) => {
            const progress = Math.min((time - startTime) / duration, 1);
            const eased = expand
                ? 1 - Math.pow(1 - progress, 3) // ease out
                : Math.pow(progress, 2); // ease in

            mesh.position.lerpVectors(startPos, endPos, eased);
            mesh.material.opacity = expand ? eased : 1 - eased;

            if (label) {
                label.element.style.opacity = expand ? eased.toString() : (1 - eased).toString();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (!expand) {
                mesh.visible = false;
            }
        };

        requestAnimationFrame(animate);
    }

    update(delta, elapsed) {
        // Gentle rotation of domain nodes
        this.nodeMeshes.forEach((mesh, nodeId) => {
            mesh.rotation.y += delta * 0.3;
            mesh.rotation.x = Math.sin(elapsed * 0.5) * 0.1;

            // Slight hover
            const baseY = 0;
            mesh.position.y = baseY + Math.sin(elapsed + mesh.userData.angle) * 0.2;
        });

        // Subgroups gentle movement
        this.subgroupMeshes.forEach(mesh => {
            if (mesh.visible) {
                mesh.rotation.y += delta * 0.5;
            }
        });
    }

    getMesh(nodeId) {
        return this.nodeMeshes.get(nodeId) || this.subgroupMeshes.get(nodeId);
    }

    getAllMeshes() {
        return [
            ...Array.from(this.nodeMeshes.values()),
            ...Array.from(this.subgroupMeshes.values()).filter(m => m.visible)
        ];
    }

    highlightNode(nodeId, highlight = true) {
        const mesh = this.nodeMeshes.get(nodeId) || this.subgroupMeshes.get(nodeId);
        if (!mesh) return;

        mesh.material.emissiveIntensity = highlight ? 0.5 : 0.2;
        if (!mesh.userData.parentId) {
            mesh.scale.setScalar(highlight ? 1.3 : 1);
        }
    }

    dispose() {
        this.nodeMeshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.subgroupMeshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.group.clear();
    }
}

export const domainsRing = new DomainsRing();
