/**
 * Complete Taxonomy from PDF Source Material
 * 5 Domains → Subgroups → Skills
 * + Storytelling Core + Structure Models
 */

import { createNode } from './schema.js';

// ═══════════════════════════════════════════════════════════════
// STORYTELLING LAYER (CENTER CORE)
// Meaning Architecture - Why things matter
// ═══════════════════════════════════════════════════════════════

export const STORYTELLING_NODES = [
    createNode({
        id: 'storytelling-core',
        title: 'Storytelling',
        definition: 'Meaning architecture. The invisible logic that makes content resonate.',
        problemSolved: 'Gives purpose to every creative decision',
        breaksIfMisused: 'Work becomes hollow despite technical excellence',
        example: 'Pixar opens with emotional stakes before spectacle',
        layer: 'storytelling',
        x: 0, y: 0, z: 0
    }),
    createNode({
        id: 'story-structure-models',
        title: 'Story Structure Models',
        definition: 'Frameworks that organize narrative beats into emotional arcs.',
        problemSolved: 'Prevents aimless meandering in narrative',
        breaksIfMisused: 'Story feels formulaic or mechanically predictable',
        example: 'Breaking Bad follows classical tragedy structure',
        layer: 'storytelling',
        x: 2, y: 0.5, z: 1
    }),
    createNode({
        id: 'storytelling-film',
        title: 'Storytelling for Film',
        definition: 'Visual narrative where image carries meaning over dialogue.',
        problemSolved: 'Achieves show-don\'t-tell clarity',
        breaksIfMisused: 'Over-reliance on exposition breaks immersion',
        example: 'Wall-E\'s first 40 minutes - pure visual storytelling',
        layer: 'storytelling',
        x: -1.5, y: 1, z: 2
    }),
    createNode({
        id: 'storytelling-ads',
        title: 'Storytelling for Ads',
        definition: 'Compressed emotional journey with brand integration.',
        problemSolved: 'Creates memorable brand associations',
        breaksIfMisused: 'Feels manipulative or disconnected from product',
        example: 'Apple "1984" - story first, product reveal last',
        layer: 'storytelling',
        x: 1.5, y: 1.2, z: -1.5
    }),
    createNode({
        id: 'storytelling-no-dialogue',
        title: 'Storytelling Without Dialogue',
        definition: 'Narrative through action, expression, and environment alone.',
        problemSolved: 'Universal communication across languages',
        breaksIfMisused: 'Confusion when visual grammar is unclear',
        example: 'A Quiet Place opening sequence',
        layer: 'storytelling',
        x: -2, y: -0.5, z: -1
    }),
    createNode({
        id: 'storytelling-editing',
        title: 'Storytelling Through Editing',
        definition: 'Meaning created by juxtaposition and sequence.',
        problemSolved: 'Controls audience emotion without dialogue',
        breaksIfMisused: 'Cuts feel arbitrary, rhythm destroyed',
        example: 'Kuleshov effect - same face, different meaning',
        layer: 'storytelling',
        x: 0.5, y: -1, z: 2.5
    }),
    createNode({
        id: 'story-vs-style',
        title: 'Story vs Style',
        definition: 'Story is why, style is how. Never let style override story.',
        problemSolved: 'Maintains focus on emotional core',
        breaksIfMisused: 'Beautiful but meaningless content',
        example: 'Zack Snyder vs Denis Villeneuve approach',
        layer: 'storytelling',
        x: -0.5, y: 0.8, z: -2
    })
];

// ═══════════════════════════════════════════════════════════════
// STRUCTURE MODELS (ORBITING RING)
// Lives inside storytelling, not above it
// ═══════════════════════════════════════════════════════════════

export const STRUCTURE_NODES = [
    createNode({
        id: 'heros-journey',
        title: "Hero's Journey",
        definition: '17-stage monomyth: ordinary world → call → transformation → return.',
        problemSolved: 'Provides mythic resonance to any story',
        breaksIfMisused: 'Feels like checklist storytelling',
        example: 'Star Wars, The Matrix, Lion King',
        layer: 'structure',
        x: 6, y: 0, z: 0
    }),
    createNode({
        id: 'story-circle',
        title: 'Story Circle / Harmonic',
        definition: '8-beat cycle: you → need → go → search → find → take → return → change.',
        problemSolved: 'Simpler alternative to Hero\'s Journey',
        breaksIfMisused: 'Loss of nuance in complex narratives',
        example: 'Rick and Morty episode structure',
        layer: 'structure',
        x: 0, y: 0, z: 6
    }),
    createNode({
        id: 'three-act',
        title: '3-Act Structure',
        definition: 'Setup → Confrontation → Resolution. Foundation of Western drama.',
        problemSolved: 'Clear beginning, middle, end satisfaction',
        breaksIfMisused: 'Predictable midpoint and climax timing',
        example: 'Most Hollywood films follow this',
        layer: 'structure',
        x: -6, y: 0, z: 0
    }),
    createNode({
        id: 'five-act',
        title: '5-Act Structure',
        definition: 'Exposition → Rising → Climax → Falling → Denouement. Shakespearean model.',
        problemSolved: 'More nuanced arc for longer narratives',
        breaksIfMisused: 'Overcomplication of simple stories',
        example: 'Breaking Bad season arcs',
        layer: 'structure',
        x: 0, y: 0, z: -6
    })
];

// ═══════════════════════════════════════════════════════════════
// DOMAINS (OUTER RING)
// Execution layer - How ideas are executed
// ═══════════════════════════════════════════════════════════════

export const DOMAIN_NODES = [
    // DESIGN DOMAIN
    createNode({
        id: 'domain-design',
        title: 'Design',
        definition: 'Still frame thinking. What it looks like frozen in time.',
        problemSolved: '"If this never moved, would it still work?"',
        breaksIfMisused: 'Confusion between static and motion concerns',
        example: 'A perfectly composed movie poster',
        layer: 'domain',
        domain: 'design',
        x: 12, y: 0, z: 0
    }),
    // CINEMATOGRAPHY DOMAIN
    createNode({
        id: 'domain-cinematography',
        title: 'Cinematography',
        definition: 'Writing with light and space. Physical reality capture.',
        problemSolved: '"Does this feel physically real?"',
        breaksIfMisused: 'Lighting/camera choices that fight the story',
        example: 'Roger Deakins\' work on 1917',
        layer: 'domain',
        domain: 'cinematography',
        x: 3.7, y: 0, z: 11.4
    }),
    // SOUND DOMAIN
    createNode({
        id: 'domain-sound',
        title: 'Sound',
        definition: 'Invisible reality glue. Emotional realism through audio.',
        problemSolved: '"Would this feel real with eyes closed?"',
        breaksIfMisused: 'Bad sound kills great visuals instantly',
        example: 'Dunkirk\'s ticking clock motif',
        layer: 'domain',
        domain: 'sound',
        x: -9.7, y: 0, z: 7.1
    }),
    // EDITING DOMAIN
    createNode({
        id: 'domain-editing',
        title: 'Editing',
        definition: 'Where meaning is born. Control of time and sequence.',
        problemSolved: '"What does this sequence say?"',
        breaksIfMisused: 'Cuts that confuse rather than clarify',
        example: 'Edgar Wright\'s rhythmic cutting',
        layer: 'domain',
        domain: 'editing',
        x: -9.7, y: 0, z: -7.1
    }),
    // MOTION DOMAIN
    createNode({
        id: 'domain-motion',
        title: 'Motion',
        definition: 'Design obeying physics over time. Life and energy.',
        problemSolved: '"Does this feel alive?"',
        breaksIfMisused: 'Motion that fights physics or feels mechanical',
        example: 'Apple product reveal animations',
        layer: 'domain',
        domain: 'motion',
        x: 3.7, y: 0, z: -11.4
    })
];

// ═══════════════════════════════════════════════════════════════
// SUBGROUPS PER DOMAIN
// ═══════════════════════════════════════════════════════════════

export const SUBGROUPS = {
    design: [
        { id: 'design-composition', title: 'Composition & Hierarchy', definition: 'Visual hierarchy, scale, contrast, alignment, negative space' },
        { id: 'design-typography', title: 'Typography', definition: 'Font personality, kerning, leading, readability vs expression' },
        { id: 'design-color', title: 'Color & Tone', definition: 'Color theory, psychology, palettes, emotional temperature' },
        { id: 'design-vector', title: 'Vector & Asset Design', definition: 'Illustrator/SVG, shape logic, scalable assets, icon systems' },
        { id: 'design-layout', title: 'Layout Systems', definition: 'Grid systems, modular layouts, UI rhythm, balance vs tension' }
    ],
    cinematography: [
        { id: 'cine-light-physics', title: 'Light Physics', definition: 'Key/Fill/Back ratios, hard vs soft, falloff, color temperature' },
        { id: 'cine-motivated', title: 'Motivated Lighting', definition: 'Practical lights, source logic, shadow motivation' },
        { id: 'cine-optics', title: 'Camera Optics', definition: 'Focal length, compression, lens personality, sensor size' },
        { id: 'cine-exposure', title: 'Exposure Control', definition: 'Aperture, shutter speed, ISO, noise vs texture' },
        { id: 'cine-blocking', title: 'Blocking & Movement', definition: 'Actor movement, camera placement, eye lines' }
    ],
    sound: [
        { id: 'sound-production', title: 'Production Sound', definition: 'Mic placement, signal-to-noise, clean capture' },
        { id: 'sound-room-tone', title: 'Room Tone', definition: 'Ambient silence, continuity glue, edit patching' },
        { id: 'sound-foley', title: 'Foley & SFX', definition: 'Layering, texture building, weight creation' },
        { id: 'sound-design-logic', title: 'Sound Design Logic', definition: 'Diegetic vs non-diegetic, emotional cues, silence' },
        { id: 'sound-mixing', title: 'Mixing', definition: 'EQ, compression, loudness balance' }
    ],
    editing: [
        { id: 'edit-narrative', title: 'Narrative Editing', definition: 'Kuleshov effect, cause & effect, emotional continuity' },
        { id: 'edit-pacing', title: 'Pacing & Rhythm', definition: 'Cut timing, breathing room, tension control' },
        { id: 'edit-montage', title: 'Montage', definition: 'Time compression, emotional escalation, visual metaphors' },
        { id: 'edit-technical', title: 'Technical Discipline', definition: 'File organization, version control, iteration safety' }
    ],
    motion: [
        { id: 'motion-physics', title: 'Motion Physics', definition: '12 principles, weight & inertia, cause → reaction' },
        { id: 'motion-easing', title: 'Easing & Interpolation', definition: 'Speed graph, bezier curves, organic vs robotic' },
        { id: 'motion-blur', title: 'Motion Blur & Shutter', definition: '180° rule, artificial blur sync, cinematic consistency' },
        { id: 'motion-secondary', title: 'Secondary Animation', definition: 'Follow-through, environmental reaction, life leakage' },
        { id: 'motion-parallax', title: 'Parallax & Depth', definition: '2.5D space, scale illusion, foreground/background' }
    ]
};

// ═══════════════════════════════════════════════════════════════
// STYLE SUBCATEGORIES PER DOMAIN (From PDF 2)
// ═══════════════════════════════════════════════════════════════

export const STYLE_CATEGORIES = {
    design: {
        structural: ['Minimalism', 'Maximalism', 'Brutalist', 'Modular', 'Editorial'],
        graphicLanguage: ['Flat', 'Skeuomorphic', 'Geometric', 'Organic', 'Neo-Swiss', 'Bauhaus'],
        colorLanguage: ['Pastel', 'Muted', 'High-contrast', 'Monochrome', 'Duotone', 'Neo-vintage'],
        typographyCulture: ['Swiss/Modernist', 'Experimental', 'Editorial', 'Corporate-clean', 'Neo-grotesk', 'Retro-futurist']
    },
    cinematography: {
        lighting: ['Naturalistic', 'High-key', 'Low-key', 'Chiaroscuro', 'Practical-heavy', 'Neo-noir'],
        cameraBehavior: ['Locked-off', 'Handheld', 'Floating', 'Observational', 'Aggressive', 'Documentary'],
        lensCulture: ['Wide-biased', 'Telephoto-biased', 'Vintage glass', 'Clinical modern', 'Distorted'],
        exposureTexture: ['Clean', 'Grain-forward', 'Crushed blacks', 'Highlight roll-off', 'Overexposed aesthetic']
    },
    editing: {
        rhythm: ['Slow cinema', 'Snappy', 'Aggressive', 'Breath-heavy', 'Staccato'],
        continuity: ['Classical', 'Invisible', 'Jump-cut driven', 'Fragmented', 'Associative'],
        temporal: ['Linear', 'Elliptical', 'Collage', 'Memory-based', 'Dream logic'],
        cutMotivation: ['Action-driven', 'Emotion-driven', 'Sound-driven', 'Graphic match-driven']
    },
    motion: {
        energy: ['Floaty', 'Snappy', 'Heavy', 'Elastic', 'Mechanical'],
        culture: ['Minimal UI', 'Maximalist', 'Kinetic typography-led', 'Cinematic', 'Data-driven'],
        complexity: ['Primary-only', 'Secondary-rich', 'Environmental-reactive', 'Micro-detail heavy'],
        realism: ['Hyper-real', 'Stylized-real', 'Abstract', 'Surreal']
    },
    sound: {
        texture: ['Clean', 'Gritty', 'Analog', 'Digital', 'Lo-fi'],
        spaceT: ['Dry', 'Roomy', 'Reverb-heavy', 'Intimate', 'Distant'],
        mixBias: ['Dialogue-forward', 'Music-forward', 'Atmosphere-forward', 'Silence-forward']
    }
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Get all initial nodes
// ═══════════════════════════════════════════════════════════════

export const getAllInitialNodes = () => {
    const subgroupNodes = [];

    // Create subgroup nodes for each domain
    Object.entries(SUBGROUPS).forEach(([domain, groups]) => {
        const domainNode = DOMAIN_NODES.find(d => d.domain === domain);
        if (!domainNode) return;

        groups.forEach((group, index) => {
            const angle = (index / groups.length) * Math.PI * 2;
            const radius = 4;
            subgroupNodes.push(createNode({
                id: group.id,
                title: group.title,
                definition: group.definition,
                layer: 'domain',
                domain: domain,
                subgroup: `domain-${domain}`,
                x: domainNode.x + Math.cos(angle) * radius,
                y: 2 + index * 0.3,
                z: domainNode.z + Math.sin(angle) * radius
            }));
        });
    });

    return [
        ...STORYTELLING_NODES,
        ...STRUCTURE_NODES,
        ...DOMAIN_NODES,
        ...subgroupNodes
    ];
};
