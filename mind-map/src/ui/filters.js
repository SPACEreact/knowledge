/**
 * Filters Panel
 * Layer and domain filtering
 */

import { store } from '../data/store.js';
import { storytellingCore } from '../3d/layers/storytellingCore.js';
import { structureRing } from '../3d/layers/structureRing.js';
import { domainsRing } from '../3d/layers/domainsRing.js';

export function initFilters() {
    const layerSelect = document.getElementById('filter-layer');
    const domainSelect = document.getElementById('filter-domain');
    const clearBtn = document.getElementById('clear-filters');

    function applyFilters() {
        const layer = layerSelect.value;
        const domain = domainSelect.value;

        store.setFilter('layer', layer);
        store.setFilter('domain', domain);

        // Update visibility
        const nodes = store.getNodes();

        nodes.forEach(node => {
            const visible = matchesFilters(node, layer, domain);
            updateNodeVisibility(node, visible);
        });
    }

    function matchesFilters(node, layer, domain) {
        if (layer && node.layer !== layer) return false;
        if (domain && node.domain !== domain) return false;
        return true;
    }

    function updateNodeVisibility(node, visible) {
        let mesh;

        switch (node.layer) {
            case 'storytelling':
                mesh = storytellingCore.getMesh(node.id);
                break;
            case 'structure':
                mesh = structureRing.getMesh(node.id);
                break;
            case 'domain':
                mesh = domainsRing.getMesh(node.id);
                break;
        }

        if (mesh) {
            // Dim instead of hide for better UX
            mesh.material.opacity = visible ? 1 : 0.15;
            mesh.material.transparent = true;

            // Also dim labels
            const label = mesh.children.find(c => c.isCSS2DObject);
            if (label) {
                label.element.style.opacity = visible ? '1' : '0.2';
            }
        }
    }

    layerSelect.addEventListener('change', applyFilters);
    domainSelect.addEventListener('change', applyFilters);

    clearBtn.addEventListener('click', () => {
        layerSelect.value = '';
        domainSelect.value = '';
        store.clearFilters();

        // Reset all visibility
        store.getNodes().forEach(node => {
            updateNodeVisibility(node, true);
        });
    });

    // Legend click filtering
    document.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('click', () => {
            const layer = item.dataset.layer;
            layerSelect.value = layer;
            applyFilters();
        });
    });
}
