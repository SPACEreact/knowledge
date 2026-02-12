/**
 * State Management Store
 * Handles nodes, connections, mode, filters
 * Persists to localStorage
 */

import { getAllInitialNodes } from './taxonomy.js';
import { DEFAULT_CONNECTIONS } from './connections.js';
import { createNode, createConnection, validateNode } from './schema.js';

const STORAGE_KEY = 'story-mind-map-state';

class Store {
    constructor() {
        this.state = {
            nodes: [],
            connections: [],
            mode: 'explore', // 'explore' | 'build'
            selectedNodeId: null,
            filters: {
                layer: '',
                domain: '',
                intent: ''
            },
            expandedDomains: new Set(),
            history: [] // For undo in Build mode
        };

        this.listeners = new Set();
        this.load();
    }

    // ═══════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════

    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.state.nodes = data.nodes || [];
                this.state.connections = data.connections || [];
                // Merge with defaults if empty
                if (this.state.nodes.length === 0) {
                    this.state.nodes = getAllInitialNodes();
                    this.state.connections = DEFAULT_CONNECTIONS;
                }
            } else {
                // First load - use defaults
                this.state.nodes = getAllInitialNodes();
                this.state.connections = DEFAULT_CONNECTIONS;
            }
        } catch (e) {
            console.error('Failed to load state:', e);
            this.state.nodes = getAllInitialNodes();
            this.state.connections = DEFAULT_CONNECTIONS;
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                nodes: this.state.nodes,
                connections: this.state.connections
            }));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // SUBSCRIPTIONS
    // ═══════════════════════════════════════════════════════════════

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.state));
    }

    // ═══════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════

    getState() {
        return this.state;
    }

    getNodes() {
        return this.state.nodes;
    }

    getConnections() {
        return this.state.connections;
    }

    getNodeById(id) {
        return this.state.nodes.find(n => n.id === id);
    }

    getMode() {
        return this.state.mode;
    }

    getSelectedNode() {
        if (!this.state.selectedNodeId) return null;
        return this.getNodeById(this.state.selectedNodeId);
    }

    getFilteredNodes() {
        return this.state.nodes.filter(node => {
            if (this.state.filters.layer && node.layer !== this.state.filters.layer) {
                return false;
            }
            if (this.state.filters.domain && node.domain !== this.state.filters.domain) {
                return false;
            }
            return true;
        });
    }

    getConnectionsForNode(nodeId) {
        return this.state.connections.filter(
            c => c.from === nodeId || c.to === nodeId
        );
    }

    isNodeVisible(nodeId) {
        const node = this.getNodeById(nodeId);
        if (!node) return false;

        // Check if domain is expanded
        if (node.subgroup && !this.state.expandedDomains.has(node.subgroup)) {
            return false;
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════

    setMode(mode) {
        this.state.mode = mode;
        this.notify();
    }

    selectNode(id) {
        this.state.selectedNodeId = id;
        this.notify();
    }

    deselectNode() {
        this.state.selectedNodeId = null;
        this.notify();
    }

    setFilter(key, value) {
        this.state.filters[key] = value;
        this.notify();
    }

    clearFilters() {
        this.state.filters = { layer: '', domain: '', intent: '' };
        this.notify();
    }

    toggleDomainExpand(domainId) {
        if (this.state.expandedDomains.has(domainId)) {
            this.state.expandedDomains.delete(domainId);
        } else {
            this.state.expandedDomains.add(domainId);
        }
        this.notify();
    }

    // ═══════════════════════════════════════════════════════════════
    // NODE CRUD
    // ═══════════════════════════════════════════════════════════════

    addNode(data) {
        // In Build mode, validate strictly
        if (this.state.mode === 'build') {
            const validation = validateNode(data);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }
            // In Build mode, unclear flag not allowed
            data.unclear = false;
        }

        const node = createNode(data);
        this.state.nodes.push(node);
        this.save();
        this.notify();
        return { success: true, node };
    }

    updateNode(id, updates) {
        const index = this.state.nodes.findIndex(n => n.id === id);
        if (index === -1) return { success: false, error: 'Node not found' };

        const updated = { ...this.state.nodes[index], ...updates };

        if (this.state.mode === 'build') {
            const validation = validateNode(updated);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }
        }

        this.state.nodes[index] = updated;
        this.save();
        this.notify();
        return { success: true, node: updated };
    }

    updateNodeNotes(id, notes) {
        const index = this.state.nodes.findIndex(n => n.id === id);
        if (index === -1) return;

        this.state.nodes[index].personalNote = notes;
        this.save();
        // Don't notify for just notes - too noisy
    }

    deleteNode(id) {
        // Remove node
        this.state.nodes = this.state.nodes.filter(n => n.id !== id);
        // Remove related connections
        this.state.connections = this.state.connections.filter(
            c => c.from !== id && c.to !== id
        );
        this.save();
        this.notify();
    }

    // ═══════════════════════════════════════════════════════════════
    // CONNECTION CRUD
    // ═══════════════════════════════════════════════════════════════

    addConnection(data) {
        if (!data.from || !data.to) {
            return { success: false, error: 'From and To nodes required' };
        }
        if (!data.explanation && this.state.mode === 'build') {
            return { success: false, error: 'Explanation required in Build mode' };
        }

        const connection = createConnection(data);
        this.state.connections.push(connection);
        this.save();
        this.notify();
        return { success: true, connection };
    }

    deleteConnection(id) {
        this.state.connections = this.state.connections.filter(c => c.id !== id);
        this.save();
        this.notify();
    }

    // ═══════════════════════════════════════════════════════════════
    // RESET
    // ═══════════════════════════════════════════════════════════════

    reset() {
        this.state.nodes = getAllInitialNodes();
        this.state.connections = DEFAULT_CONNECTIONS;
        this.state.selectedNodeId = null;
        this.state.expandedDomains.clear();
        this.save();
        this.notify();
    }
}

export const store = new Store();
