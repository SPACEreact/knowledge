/**
 * Story Mind Map - Main Entry Point
 * Initializes all modules and coordinates events
 */

import { scene } from './3d/scene.js';
import { storytellingCore } from './3d/layers/storytellingCore.js';
import { structureRing } from './3d/layers/structureRing.js';
import { domainsRing } from './3d/layers/domainsRing.js';
import { connectionRenderer } from './3d/connections.js';
import { interactions } from './3d/interactions.js';
import { store } from './data/store.js';
import { initModeToggle } from './ui/modeToggle.js';
import { initNodePanel } from './ui/nodePanel.js';
import { initFilters } from './ui/filters.js';
import { initNodeEditor } from './ui/nodeEditor.js';
import { initConnectionEditor } from './ui/connectionEditor.js';

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

async function init() {
    const container = document.getElementById('canvas-container');
    const loading = document.getElementById('loading');

    try {
        // Initialize 3D scene
        scene.init(container);

        // Create 3D layers
        const storytellingGroup = storytellingCore.create();
        const structureGroup = structureRing.create();
        const domainsGroup = domainsRing.create();
        const connectionsGroup = connectionRenderer.create();

        scene.add(storytellingGroup);
        scene.add(structureGroup);
        scene.add(domainsGroup);
        scene.add(connectionsGroup);

        // Register update callbacks
        scene.onUpdate((delta, elapsed) => {
            storytellingCore.update(delta, elapsed);
            structureRing.update(delta, elapsed);
            domainsRing.update(delta, elapsed);
            connectionRenderer.update(delta, elapsed);
        });

        // Initialize interactions
        interactions.init(container);

        // Initialize UI components
        initModeToggle();
        const nodePanel = initNodePanel();
        initFilters();
        const nodeEditor = initNodeEditor();
        const connectionEditor = initConnectionEditor();

        // Wire up interactions to UI
        interactions.setNodeClickHandler((node) => {
            if (node) {
                nodePanel.show(node);
            } else {
                nodePanel.hide();
            }
        });

        interactions.setNodeEditHandler((node) => {
            if (store.getMode() === 'build') {
                nodeEditor.open(node);
            }
        });

        // Subscribe to store changes for rebuilding
        store.subscribe((state) => {
            // Could trigger 3D rebuild here if needed
            // For now, connections update dynamically
        });

        // Hide loading screen
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 500);

        console.log('🎬 Story Mind Map initialized');
        console.log(`📊 Loaded ${store.getNodes().length} nodes`);
        console.log(`🔗 Loaded ${store.getConnections().length} connections`);

    } catch (error) {
        console.error('Failed to initialize:', error);
        loading.innerHTML = `
      <p style="color: #ef4444;">Failed to initialize: ${error.message}</p>
      <button onclick="location.reload()">Retry</button>
    `;
    }
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
        case 'e':
            // Toggle Explore mode
            store.setMode('explore');
            break;
        case 'b':
            // Toggle Build mode
            store.setMode('build');
            break;
        case 'n':
            // New node (if Build mode)
            if (store.getMode() === 'build') {
                document.getElementById('add-node-btn').click();
            }
            break;
        case 'r':
            // Reset camera
            scene.focusOnPosition({ x: 0, y: 0, z: 0 });
            break;
    }
});

// ═══════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', init);
