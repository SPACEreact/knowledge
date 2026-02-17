/**
 * Reactive State Management with Preact Signals
 * Replaces class-based Store with fine-grained reactivity
 */

import { signal, computed, effect, batch } from '@preact/signals-core';
import { getAllInitialNodes } from '../data/taxonomy.js';
import { DEFAULT_CONNECTIONS } from '../data/connections.js';

const STORAGE_KEY = 'story-mind-map-state';

// ═══════════════════════════════════════════════════════════════
// CORE STATE SIGNALS
// ═══════════════════════════════════════════════════════════════

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (data.nodes?.length > 0) return data;
        }
    } catch (e) { /* fallback */ }
    return {
        nodes: getAllInitialNodes(),
        connections: DEFAULT_CONNECTIONS
    };
}

const initial = loadState();

// Primary state
export const nodes = signal(initial.nodes);
export const connections = signal(initial.connections);
export const mode = signal('explore'); // 'explore' | 'build'
export const selectedNodeId = signal(null);
export const expandedDomains = signal(new Set());

// Filters
export const filterLayer = signal('');
export const filterDomain = signal('');
export const filterIntent = signal('');

// Search
export const searchQuery = signal('');
export const searchResults = signal([]);

// AI
export const aiStatus = signal('idle'); // 'idle' | 'loading' | 'ready' | 'thinking'
export const aiMessages = signal([]);
export const aiModelProgress = signal(0);

// GPU
export const gpuCapabilities = signal({
    webgpu: false,
    webgl2: true,
    vram: 0
});

// Active playground
export const activePlayground = signal(null);

// ═══════════════════════════════════════════════════════════════
// PLAYGROUND SIGNALS (per-demo reactive controls)
// ═══════════════════════════════════════════════════════════════

// Lighting playground
export const lightingState = signal({
    keyPosition: { x: -2, y: 3, z: 2 },
    keyIntensity: 1.0,
    keyTemp: 5600,
    fillPosition: { x: 2, y: 2, z: 1 },
    fillIntensity: 0.4,
    fillTemp: 5600,
    backPosition: { x: 0, y: 2, z: -3 },
    backIntensity: 0.6,
    backTemp: 6500,
});

// Focal length playground
export const focalLength = signal(50);

// DOF playground
export const aperture = signal(2.8);
export const focusDistance = signal(5);

// Exposure playground
export const exposureState = signal({
    aperture: 5.6,
    shutter: 48,  // 1/48
    iso: 800
});

// Color temperature playground
export const colorTemp = signal(5600);

// Easing playground
export const easingPoints = signal({
    p1: { x: 0.42, y: 0 },
    p2: { x: 0.58, y: 1 }
});

// Motion blur playground
export const shutterAngle = signal(180);

// Sound mixer playground
export const mixerLevels = signal({
    dialogue: 0.8,
    music: 0.5,
    sfx: 0.6,
    ambience: 0.3
});

// Editing timeline playground
export const timelineCuts = signal([0, 2.5, 4.0, 6.5, 8.0]);
export const timelineBpm = signal(120);

// ═══════════════════════════════════════════════════════════════
// COMPUTED STATE
// ═══════════════════════════════════════════════════════════════

export const filteredNodes = computed(() => {
    return nodes.value.filter(node => {
        if (filterLayer.value && node.layer !== filterLayer.value) return false;
        if (filterDomain.value && node.domain !== filterDomain.value) return false;
        return true;
    });
});

export const selectedNode = computed(() => {
    if (!selectedNodeId.value) return null;
    return nodes.value.find(n => n.id === selectedNodeId.value) || null;
});

export const activeConnections = computed(() => {
    if (!selectedNodeId.value) return [];
    return connections.value.filter(
        c => c.from === selectedNodeId.value || c.to === selectedNodeId.value
    );
});

// Exposure brightness (should stay ~constant when balanced)
export const exposureBrightness = computed(() => {
    const e = exposureState.value;
    // EV = log2(aperture² / shutter) - log2(iso / 100)
    const ev = Math.log2((e.aperture * e.aperture) / (1 / e.shutter)) - Math.log2(e.iso / 100);
    return Math.max(0, Math.min(1, 1 - (ev / 16)));
});

// Color temperature to RGB
export const colorTempRGB = computed(() => {
    const temp = colorTemp.value;
    // Approximation of Planckian locus
    let r, g, b;
    const t = temp / 100;
    if (t <= 66) {
        r = 255;
        g = Math.min(255, Math.max(0, 99.47 * Math.log(t) - 161.12));
        b = t <= 19 ? 0 : Math.min(255, Math.max(0, 138.52 * Math.log(t - 10) - 305.04));
    } else {
        r = Math.min(255, Math.max(0, 329.7 * Math.pow(t - 60, -0.133)));
        g = Math.min(255, Math.max(0, 288.12 * Math.pow(t - 60, -0.0755)));
        b = 255;
    }
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
});

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE (auto-save via effect)
// ═══════════════════════════════════════════════════════════════

effect(() => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            nodes: nodes.value,
            connections: connections.value
        }));
    } catch (e) { /* quota exceeded, ignore */ }
});

// ═══════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════

export function selectNode(id) {
    selectedNodeId.value = id;
}

export function deselectNode() {
    selectedNodeId.value = null;
}

export function setMode(m) {
    mode.value = m;
}

export function setFilter(key, value) {
    if (key === 'layer') filterLayer.value = value;
    if (key === 'domain') filterDomain.value = value;
    if (key === 'intent') filterIntent.value = value;
}

export function clearFilters() {
    batch(() => {
        filterLayer.value = '';
        filterDomain.value = '';
        filterIntent.value = '';
    });
}

export function addNode(data) {
    const { createNode } = require('../data/schema.js');
    const node = createNode(data);
    nodes.value = [...nodes.value, node];
    return node;
}

export function deleteNode(id) {
    batch(() => {
        nodes.value = nodes.value.filter(n => n.id !== id);
        connections.value = connections.value.filter(
            c => c.from !== id && c.to !== id
        );
    });
}

export function addConnection(data) {
    const { createConnection } = require('../data/schema.js');
    const conn = createConnection(data);
    connections.value = [...connections.value, conn];
    return conn;
}

export function deleteConnection(id) {
    connections.value = connections.value.filter(c => c.id !== id);
}

export function resetState() {
    batch(() => {
        nodes.value = getAllInitialNodes();
        connections.value = DEFAULT_CONNECTIONS;
        selectedNodeId.value = null;
        expandedDomains.value = new Set();
    });
}

export function toggleDomainExpand(domainId) {
    const current = new Set(expandedDomains.value);
    if (current.has(domainId)) {
        current.delete(domainId);
    } else {
        current.add(domainId);
    }
    expandedDomains.value = current;
}

// GPU detection
export async function detectGPU() {
    const caps = { webgpu: false, webgl2: true, vram: 0 };

    if (navigator.gpu) {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                caps.webgpu = true;
                const info = await adapter.requestAdapterInfo?.();
                caps.vram = adapter.limits?.maxBufferSize || 0;
                caps.gpuName = info?.device || 'Unknown GPU';
            }
        } catch (e) { /* no WebGPU */ }
    }

    const canvas = document.createElement('canvas');
    caps.webgl2 = !!canvas.getContext('webgl2');

    gpuCapabilities.value = caps;
    return caps;
}
