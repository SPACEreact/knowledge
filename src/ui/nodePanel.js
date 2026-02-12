/**
 * Node Detail Panel
 * Shows selected node information
 */

import { store } from '../data/store.js';

export function initNodePanel() {
    const panel = document.getElementById('node-panel');
    const closeBtn = document.getElementById('close-panel');
    const titleEl = document.getElementById('node-title');
    const layerEl = document.getElementById('node-layer');
    const definitionEl = document.getElementById('node-definition');
    const problemEl = document.getElementById('node-problem');
    const breaksEl = document.getElementById('node-breaks');
    const exampleEl = document.getElementById('node-example');
    const notesEl = document.getElementById('node-notes');
    const saveNotesBtn = document.getElementById('save-notes');
    const connectionsEl = document.getElementById('node-connections');

    function showPanel(node) {
        if (!node) {
            panel.classList.add('hidden');
            return;
        }

        // Populate fields
        titleEl.textContent = node.title;

        // Layer badge
        layerEl.textContent = node.layer;
        layerEl.className = 'badge ' + (node.domain || node.layer);

        if (node.domain) {
            layerEl.textContent = `${node.layer} → ${node.domain}`;
        }

        definitionEl.textContent = node.definition || '—';
        problemEl.textContent = node.problemSolved || '—';
        breaksEl.textContent = node.breaksIfMisused || '—';
        exampleEl.textContent = node.example || '—';
        notesEl.value = node.personalNote || '';

        // Connections
        const connections = store.getConnectionsForNode(node.id);
        connectionsEl.innerHTML = '';

        if (connections.length === 0) {
            connectionsEl.innerHTML = '<li>No connections</li>';
        } else {
            connections.forEach(conn => {
                const otherNodeId = conn.from === node.id ? conn.to : conn.from;
                const otherNode = store.getNodeById(otherNodeId);
                const direction = conn.from === node.id ? '→' : '←';

                const li = document.createElement('li');
                li.innerHTML = `
          <strong>${direction} ${otherNode?.title || 'Unknown'}</strong>
          <br><small>${conn.explanation || 'No explanation'}</small>
        `;
                connectionsEl.appendChild(li);
            });
        }

        panel.classList.remove('hidden');
    }

    closeBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
        store.deselectNode();
    });

    saveNotesBtn.addEventListener('click', () => {
        const selectedNode = store.getSelectedNode();
        if (selectedNode) {
            store.updateNodeNotes(selectedNode.id, notesEl.value);
            // Visual feedback
            saveNotesBtn.textContent = 'Saved!';
            setTimeout(() => {
                saveNotesBtn.textContent = 'Save Notes';
            }, 1500);
        }
    });

    // Subscribe to selection changes
    store.subscribe(state => {
        const node = store.getSelectedNode();
        showPanel(node);
    });

    return {
        show: showPanel,
        hide: () => panel.classList.add('hidden')
    };
}
