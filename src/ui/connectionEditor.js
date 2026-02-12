/**
 * Connection Editor
 * Create and manage connections between nodes
 */

import { store } from '../data/store.js';

export function initConnectionEditor() {
    // This could be expanded to a full modal, but for now
    // we'll use a simple prompt-based approach

    let connectionMode = false;
    let sourceNodeId = null;

    function startConnectionMode(fromNodeId) {
        connectionMode = true;
        sourceNodeId = fromNodeId;
        document.body.style.cursor = 'crosshair';

        // Show instruction
        showToast('Click on another node to create a connection');
    }

    function endConnectionMode() {
        connectionMode = false;
        sourceNodeId = null;
        document.body.style.cursor = 'default';
    }

    function createConnection(toNodeId) {
        if (!sourceNodeId || sourceNodeId === toNodeId) {
            endConnectionMode();
            return;
        }

        const explanation = prompt('Why does this connection exist?');
        if (!explanation) {
            endConnectionMode();
            return;
        }

        const strengthStr = prompt('Connection strength (1-5)?', '3');
        const strength = parseInt(strengthStr) || 3;

        const result = store.addConnection({
            from: sourceNodeId,
            to: toNodeId,
            explanation,
            strength: Math.min(5, Math.max(1, strength))
        });

        if (result.success) {
            showToast('Connection created!');
        } else {
            showToast('Error: ' + result.error);
        }

        endConnectionMode();
    }

    function showToast(message) {
        // Simple toast notification
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: rgba(18, 18, 26, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #f8fafc;
      font-size: 13px;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    return {
        isConnectionMode: () => connectionMode,
        start: startConnectionMode,
        complete: createConnection,
        cancel: endConnectionMode
    };
}
