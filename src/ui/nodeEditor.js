/**
 * Node Editor Modal
 * Create and edit nodes with classification enforcement
 */

import { store } from '../data/store.js';

export function initNodeEditor() {
    const modal = document.getElementById('node-editor-modal');
    const backdrop = modal.querySelector('.modal-backdrop');
    const form = document.getElementById('node-form');
    const editorTitle = document.getElementById('editor-title');
    const titleInput = document.getElementById('edit-title');
    const layerSelect = document.getElementById('edit-layer');
    const domainGroup = document.querySelector('.domain-select');
    const domainSelect = document.getElementById('edit-domain');
    const definitionInput = document.getElementById('edit-definition');
    const problemInput = document.getElementById('edit-problem');
    const breaksInput = document.getElementById('edit-breaks');
    const exampleInput = document.getElementById('edit-example');
    const unclearCheckbox = document.getElementById('edit-unclear');
    const rejectionWarning = document.getElementById('rejection-warning');
    const cancelBtn = document.getElementById('cancel-edit');
    const addNodeBtn = document.getElementById('add-node-btn');

    let editingNodeId = null;

    function openModal(node = null) {
        editingNodeId = node?.id || null;
        editorTitle.textContent = node ? 'Edit Node' : 'Add New Node';

        // Populate form
        titleInput.value = node?.title || '';
        layerSelect.value = node?.layer || '';
        domainSelect.value = node?.domain || '';
        definitionInput.value = node?.definition || '';
        problemInput.value = node?.problemSolved || '';
        breaksInput.value = node?.breaksIfMisused || '';
        exampleInput.value = node?.example || '';
        unclearCheckbox.checked = node?.unclear || false;

        // Show/hide domain selector
        updateDomainVisibility();

        // Show/hide unclear option based on mode
        const exploreOnly = document.querySelector('.explore-only');
        if (exploreOnly) {
            exploreOnly.style.display = store.getMode() === 'explore' ? 'block' : 'none';
        }

        rejectionWarning.classList.add('hidden');
        modal.classList.remove('hidden');
        titleInput.focus();
    }

    function closeModal() {
        modal.classList.add('hidden');
        form.reset();
        editingNodeId = null;
    }

    function updateDomainVisibility() {
        if (layerSelect.value === 'domain') {
            domainGroup.classList.remove('hidden');
            domainSelect.required = true;
        } else {
            domainGroup.classList.add('hidden');
            domainSelect.required = false;
        }
    }

    layerSelect.addEventListener('change', updateDomainVisibility);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const mode = store.getMode();
        const layer = layerSelect.value;
        const domain = domainSelect.value;

        // Build mode requires classification
        if (mode === 'build' && !layer) {
            rejectionWarning.classList.remove('hidden');
            rejectionWarning.textContent = '⚠️ This concept is unclear. Refine or discard.';
            return;
        }

        if (mode === 'build' && layer === 'domain' && !domain) {
            rejectionWarning.classList.remove('hidden');
            rejectionWarning.textContent = '⚠️ Domain nodes must specify which domain.';
            return;
        }

        const nodeData = {
            title: titleInput.value.trim(),
            layer: layer,
            domain: layer === 'domain' ? domain : null,
            definition: definitionInput.value.trim(),
            problemSolved: problemInput.value.trim(),
            breaksIfMisused: breaksInput.value.trim(),
            example: exampleInput.value.trim(),
            unclear: mode === 'explore' ? unclearCheckbox.checked : false
        };

        // Calculate position based on layer
        if (!editingNodeId) {
            const pos = calculateNewPosition(nodeData.layer, nodeData.domain);
            nodeData.x = pos.x;
            nodeData.y = pos.y;
            nodeData.z = pos.z;
        }

        let result;
        if (editingNodeId) {
            result = store.updateNode(editingNodeId, nodeData);
        } else {
            result = store.addNode(nodeData);
        }

        if (result.success) {
            closeModal();
            // Refresh would happen via subscription
        } else {
            rejectionWarning.classList.remove('hidden');
            rejectionWarning.textContent = `⚠️ ${result.error}`;
        }
    });

    function calculateNewPosition(layer, domain) {
        const existingNodes = store.getNodes().filter(n => n.layer === layer);
        const count = existingNodes.length;
        const angle = (count / 8) * Math.PI * 2;

        switch (layer) {
            case 'storytelling':
                return {
                    x: Math.cos(angle) * 2.5,
                    y: 0.5 + Math.random() * 0.5,
                    z: Math.sin(angle) * 2.5
                };
            case 'structure':
                return {
                    x: Math.cos(angle) * 6,
                    y: 0,
                    z: Math.sin(angle) * 6
                };
            case 'domain':
                // Position near parent domain
                const domainNode = store.getNodes().find(
                    n => n.layer === 'domain' && n.domain === domain && !n.subgroup
                );
                if (domainNode) {
                    return {
                        x: domainNode.x + Math.cos(angle) * 3,
                        y: 2 + Math.random(),
                        z: domainNode.z + Math.sin(angle) * 3
                    };
                }
                return { x: Math.cos(angle) * 12, y: 0, z: Math.sin(angle) * 12 };
            default:
                return { x: 0, y: 0, z: 0 };
        }
    }

    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    addNodeBtn.addEventListener('click', () => {
        openModal(null);
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    return {
        open: openModal,
        close: closeModal
    };
}
