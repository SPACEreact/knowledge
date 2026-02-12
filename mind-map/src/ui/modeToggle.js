/**
 * Mode Toggle UI
 * Switches between Explore and Build modes
 */

import { store } from '../data/store.js';

export function initModeToggle() {
    const exploreBtn = document.getElementById('btn-explore');
    const buildBtn = document.getElementById('btn-build');
    const addNodeBtn = document.getElementById('add-node-btn');
    const unclearCheckbox = document.querySelector('.explore-only');

    function updateUI(mode) {
        if (mode === 'explore') {
            exploreBtn.classList.add('active');
            buildBtn.classList.remove('active');
            if (unclearCheckbox) unclearCheckbox.style.display = 'block';
        } else {
            buildBtn.classList.add('active');
            exploreBtn.classList.remove('active');
            if (unclearCheckbox) unclearCheckbox.style.display = 'none';
        }
    }

    exploreBtn.addEventListener('click', () => {
        store.setMode('explore');
        updateUI('explore');
    });

    buildBtn.addEventListener('click', () => {
        // Confirm mode switch
        const hasUnclear = store.getNodes().some(n => n.unclear);
        if (hasUnclear) {
            const confirm = window.confirm(
                'Switching to Build mode will require you to classify all unclear nodes. Continue?'
            );
            if (!confirm) return;
        }

        store.setMode('build');
        updateUI('build');
    });

    // Initial state
    updateUI(store.getMode());

    // Subscribe to changes
    store.subscribe(state => {
        updateUI(state.mode);
    });
}
