/**
 * Node Schema Definition
 * Each node must answer: Why, What, How
 */

/**
 * @typedef {Object} Node
 * @property {string} id - Unique identifier
 * @property {string} title - Node name
 * @property {string} definition - 1-2 lines max
 * @property {string} problemSolved - What problem does this solve?
 * @property {string} breaksIfMisused - What breaks if misused?
 * @property {string} example - Real film/ad/scene example
 * @property {string} personalNote - User editable notes
 * @property {'storytelling'|'structure'|'domain'} layer - Which layer
 * @property {string|null} domain - Design, Cinematography, Sound, Editing, Motion
 * @property {string|null} subgroup - Parent subgroup if applicable
 * @property {boolean} unclear - Flagged as unclear (Explore mode)
 * @property {number} x - 3D position x
 * @property {number} y - 3D position y
 * @property {number} z - 3D position z
 */

/**
 * @typedef {Object} Connection
 * @property {string} id - Unique identifier
 * @property {string} from - Source node ID
 * @property {string} to - Target node ID
 * @property {string} explanation - Why this link exists
 * @property {number} strength - 1-5, affects line thickness
 */

export const createNode = (data) => ({
    id: data.id || crypto.randomUUID(),
    title: data.title || 'Untitled',
    definition: data.definition || '',
    problemSolved: data.problemSolved || '',
    breaksIfMisused: data.breaksIfMisused || '',
    example: data.example || '',
    personalNote: data.personalNote || '',
    layer: data.layer || 'storytelling',
    domain: data.domain || null,
    subgroup: data.subgroup || null,
    unclear: data.unclear || false,
    x: data.x || 0,
    y: data.y || 0,
    z: data.z || 0
});

export const createConnection = (data) => ({
    id: data.id || crypto.randomUUID(),
    from: data.from,
    to: data.to,
    explanation: data.explanation || '',
    strength: Math.min(5, Math.max(1, data.strength || 3))
});

/**
 * Validate node before saving in Build mode
 * @param {Node} node 
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateNode = (node) => {
    if (!node.title || node.title.trim() === '') {
        return { valid: false, error: 'Title is required' };
    }

    if (!node.layer) {
        return { valid: false, error: 'Layer classification is required' };
    }

    if (node.layer === 'domain' && !node.domain) {
        return { valid: false, error: 'Domain nodes must specify which domain' };
    }

    return { valid: true, error: null };
};

/**
 * Domain color mapping
 */
export const DOMAIN_COLORS = {
    design: 0xec4899,
    cinematography: 0x8b5cf6,
    sound: 0x06b6d4,
    editing: 0x22c55e,
    motion: 0xf97316
};

export const LAYER_COLORS = {
    storytelling: 0xf59e0b,
    structure: 0x3b82f6
};
