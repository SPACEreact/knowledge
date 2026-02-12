/**
 * 3D Interactions Handler
 * Raycasting, hover, click events
 */

import * as THREE from 'three';
import { scene } from './scene.js';
import { storytellingCore } from './layers/storytellingCore.js';
import { structureRing } from './layers/structureRing.js';
import { domainsRing } from './layers/domainsRing.js';
import { connectionRenderer } from './connections.js';
import { store } from '../data/store.js';

class Interactions {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredNode = null;
        this.selectedNode = null;
        this.onNodeClick = null;
        this.onNodeHover = null;
        this.onConnectionHover = null;
    }

    init(container) {
        container.addEventListener('mousemove', this.onMouseMove.bind(this));
        container.addEventListener('click', this.onClick.bind(this));
        container.addEventListener('dblclick', this.onDoubleClick.bind(this));
    }

    getAllInteractableMeshes() {
        return [
            ...storytellingCore.getAllMeshes(),
            ...structureRing.getAllMeshes(),
            ...domainsRing.getAllMeshes()
        ];
    }

    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.checkHover();
    }

    checkHover() {
        this.raycaster.setFromCamera(this.mouse, scene.getCamera());

        const meshes = this.getAllInteractableMeshes();
        const intersects = this.raycaster.intersectObjects(meshes, false);

        // Clear previous hover
        if (this.hoveredNode) {
            this.unhighlightNode(this.hoveredNode);
            this.hoveredNode = null;
        }

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const nodeId = hit.userData.nodeId;

            if (nodeId) {
                this.hoveredNode = nodeId;
                this.highlightNode(nodeId);
                document.body.style.cursor = 'pointer';

                if (this.onNodeHover) {
                    this.onNodeHover(store.getNodeById(nodeId));
                }
            }
        } else {
            document.body.style.cursor = 'default';
            if (this.onNodeHover) {
                this.onNodeHover(null);
            }
        }
    }

    onClick(event) {
        if (this.hoveredNode) {
            const node = store.getNodeById(this.hoveredNode);

            // If it's a domain node, expand/collapse
            if (node && node.layer === 'domain' && !node.subgroup) {
                domainsRing.expandDomain(this.hoveredNode);
                connectionRenderer.updateConnections();
            }

            // Select the node
            store.selectNode(this.hoveredNode);
            this.selectedNode = this.hoveredNode;

            if (this.onNodeClick) {
                this.onNodeClick(node);
            }

            // Focus camera on node
            const mesh = this.getMeshForNode(this.hoveredNode);
            if (mesh) {
                const pos = new THREE.Vector3();
                mesh.getWorldPosition(pos);
                scene.focusOnPosition(pos);
            }
        } else {
            // Clicked on empty space - deselect
            store.deselectNode();
            this.selectedNode = null;
            if (this.onNodeClick) {
                this.onNodeClick(null);
            }
        }
    }

    onDoubleClick(event) {
        if (this.hoveredNode) {
            const node = store.getNodeById(this.hoveredNode);
            // Could open edit modal in Build mode
            if (store.getMode() === 'build' && this.onNodeEdit) {
                this.onNodeEdit(node);
            }
        }
    }

    getMeshForNode(nodeId) {
        return storytellingCore.getMesh(nodeId)
            || structureRing.getMesh(nodeId)
            || domainsRing.getMesh(nodeId);
    }

    highlightNode(nodeId) {
        const node = store.getNodeById(nodeId);
        if (!node) return;

        switch (node.layer) {
            case 'storytelling':
                storytellingCore.highlightNode(nodeId, true);
                break;
            case 'structure':
                structureRing.highlightNode(nodeId, true);
                break;
            case 'domain':
                domainsRing.highlightNode(nodeId, true);
                break;
        }

        // Highlight connections
        const connections = store.getConnectionsForNode(nodeId);
        connections.forEach(conn => {
            connectionRenderer.highlightConnection(conn.id, true);
        });
    }

    unhighlightNode(nodeId) {
        const node = store.getNodeById(nodeId);
        if (!node) return;

        switch (node.layer) {
            case 'storytelling':
                storytellingCore.highlightNode(nodeId, false);
                break;
            case 'structure':
                structureRing.highlightNode(nodeId, false);
                break;
            case 'domain':
                domainsRing.highlightNode(nodeId, false);
                break;
        }

        // Unhighlight connections
        const connections = store.getConnectionsForNode(nodeId);
        connections.forEach(conn => {
            connectionRenderer.highlightConnection(conn.id, false);
        });
    }

    setNodeClickHandler(handler) {
        this.onNodeClick = handler;
    }

    setNodeHoverHandler(handler) {
        this.onNodeHover = handler;
    }

    setNodeEditHandler(handler) {
        this.onNodeEdit = handler;
    }
}

export const interactions = new Interactions();
