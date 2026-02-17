/**
 * Orama Semantic Search Engine
 * Full-text + vector search across all study guide content.
 * Runs entirely client-side.
 */

import { create, insert, search as oramaSearch } from '@orama/orama';
import { searchQuery, searchResults } from '../state/signals.js';
import { effect } from '@preact/signals-core';
import { getAllInitialNodes } from '../data/taxonomy.js';
import { SUBGROUPS, STYLE_CATEGORIES } from '../data/taxonomy.js';

let db = null;

export async function initSearch() {
    db = await create({
        schema: {
            title: 'string',
            definition: 'string',
            domain: 'string',
            layer: 'string',
            category: 'string',
            keywords: 'string',
            type: 'string', // 'node' | 'subgroup' | 'style' | 'playground'
            link: 'string'
        }
    });

    // Index all taxonomy nodes
    const nodes = getAllInitialNodes();
    for (const node of nodes) {
        await insert(db, {
            title: node.title,
            definition: node.definition || '',
            domain: node.domain || '',
            layer: node.layer || '',
            category: '',
            keywords: `${node.problemSolved || ''} ${node.breaksIfMisused || ''} ${node.example || ''}`,
            type: 'node',
            link: '#' + node.id
        });
    }

    // Index subgroups with their skills
    for (const [domain, groups] of Object.entries(SUBGROUPS)) {
        for (const group of groups) {
            await insert(db, {
                title: group.title,
                definition: group.definition,
                domain: domain,
                layer: 'domain',
                category: 'subgroup',
                keywords: '',
                type: 'subgroup',
                link: `${domain}.html`
            });
        }
    }

    // Index style categories
    for (const [domain, categories] of Object.entries(STYLE_CATEGORIES)) {
        for (const [catName, styles] of Object.entries(categories)) {
            await insert(db, {
                title: `${catName} styles`,
                definition: styles.join(', '),
                domain: domain,
                layer: 'style',
                category: catName,
                keywords: styles.join(' '),
                type: 'style',
                link: 'style-reference.html'
            });
        }
    }

    // Index playgrounds
    const playgrounds = [
        { title: '3-Point Lighting', definition: 'Drag key, fill, and back lights. Adjust intensity and color temperature.', domain: 'cinematography', link: 'playgrounds.html#lighting' },
        { title: 'Focal Length Simulator', definition: 'Slide between 18mm and 200mm. See perspective distortion change.', domain: 'cinematography', link: 'playgrounds.html#focal-length' },
        { title: 'Easing Curve Editor', definition: 'Draw bezier curves. See animated motion follow your easing.', domain: 'motion', link: 'playgrounds.html#easing' },
        { title: 'Sound Mixer', definition: '4-channel audio mixer with dialogue, music, SFX, ambience faders.', domain: 'sound', link: 'playgrounds.html#sound-mixer' }
    ];

    for (const pg of playgrounds) {
        await insert(db, {
            title: pg.title,
            definition: pg.definition,
            domain: pg.domain,
            layer: 'playground',
            category: 'playground',
            keywords: '',
            type: 'playground',
            link: pg.link
        });
    }

    console.log('🔍 Orama search indexed');

    // React to search query changes
    effect(() => {
        const query = searchQuery.value;
        if (!query || query.length < 2) {
            searchResults.value = [];
            return;
        }
        performSearch(query);
    });
}

async function performSearch(query) {
    if (!db) return;

    const results = await oramaSearch(db, {
        term: query,
        limit: 10,
        boost: {
            title: 3,
            definition: 2,
            keywords: 1
        }
    });

    searchResults.value = results.hits.map(hit => ({
        id: hit.id,
        score: hit.score,
        title: hit.document.title,
        definition: hit.document.definition,
        domain: hit.document.domain,
        type: hit.document.type,
        link: hit.document.link
    }));
}

export function getSearchEngine() {
    return db;
}
