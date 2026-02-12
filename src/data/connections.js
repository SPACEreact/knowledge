/**
 * Default connections between nodes
 * Cause → Effect relationships
 */

import { createConnection } from './schema.js';

export const DEFAULT_CONNECTIONS = [
    // Structure models connect to storytelling core
    createConnection({
        id: 'conn-hero-story',
        from: 'heros-journey',
        to: 'storytelling-core',
        explanation: 'Hero\'s Journey is a framework for organizing meaning',
        strength: 5
    }),
    createConnection({
        id: 'conn-circle-story',
        from: 'story-circle',
        to: 'storytelling-core',
        explanation: 'Story Circle simplifies meaning into 8 emotional beats',
        strength: 5
    }),
    createConnection({
        id: 'conn-3act-story',
        from: 'three-act',
        to: 'storytelling-core',
        explanation: '3-Act provides the fundamental meaning container',
        strength: 5
    }),
    createConnection({
        id: 'conn-5act-story',
        from: 'five-act',
        to: 'storytelling-core',
        explanation: '5-Act adds nuance to meaning delivery',
        strength: 4
    }),

    // Domains connect to storytelling
    createConnection({
        id: 'conn-edit-storytelling',
        from: 'domain-editing',
        to: 'storytelling-editing',
        explanation: 'Editing is where storytelling decisions are executed',
        strength: 5
    }),
    createConnection({
        id: 'conn-cine-film',
        from: 'domain-cinematography',
        to: 'storytelling-film',
        explanation: 'Cinematography serves visual storytelling',
        strength: 4
    }),
    createConnection({
        id: 'conn-sound-emotion',
        from: 'domain-sound',
        to: 'storytelling-core',
        explanation: 'Sound creates emotional truth in storytelling',
        strength: 4
    }),
    createConnection({
        id: 'conn-design-style',
        from: 'domain-design',
        to: 'story-vs-style',
        explanation: 'Design defines the visual language that style operates within',
        strength: 3
    }),
    createConnection({
        id: 'conn-motion-emotion',
        from: 'domain-motion',
        to: 'storytelling-core',
        explanation: 'Motion brings energy and life to storytelling',
        strength: 3
    }),

    // Cross-domain connections
    createConnection({
        id: 'conn-edit-sound',
        from: 'domain-editing',
        to: 'domain-sound',
        explanation: 'Editing rhythm syncs with sound design',
        strength: 4
    }),
    createConnection({
        id: 'conn-cine-design',
        from: 'domain-cinematography',
        to: 'domain-design',
        explanation: 'Cinematography inherits composition from design thinking',
        strength: 3
    }),
    createConnection({
        id: 'conn-motion-cine',
        from: 'domain-motion',
        to: 'domain-cinematography',
        explanation: 'Motion graphics follow cinematic physics when realistic',
        strength: 3
    })
];

export const getConnectionsForNode = (nodeId, connections) => {
    return connections.filter(c => c.from === nodeId || c.to === nodeId);
};
