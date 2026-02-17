/**
 * AI Tutor — Knowledge-Based
 * Provides instant explanations of cinematic concepts using the taxonomy database.
 * Falls back to a built-in knowledge base instead of requiring WebLLM/WebGPU.
 */

import { aiStatus, aiMessages, aiModelProgress, selectedNode } from '../state/signals.js';
import { getAllInitialNodes } from '../data/taxonomy.js';
import { SUBGROUPS, STYLE_CATEGORIES } from '../data/taxonomy.js';

let knowledgeBase = [];

const TUTOR_TIPS = {
    'three-point lighting': `The 3-point lighting setup is the foundation of cinematic lighting:

**Key Light** — Your main light source. Sets the mood. Hard key = drama (film noir), soft key = beauty (romantic comedy).

**Fill Light** — Reduces shadows from the key. A low fill ratio (like 4:1) creates mystery. A high fill (1:1) feels flat and safe, like a sitcom.

**Back Light** — Separates the subject from background. Creates a rim/halo effect. Roger Deakins often uses subtle backlighting for depth.

⚠️ If misused: Over-lit scenes feel like corporate videos. Under-lit feels like a horror film. The ratio between key and fill determines the emotional tone.`,

    'focal length': `Focal length isn't just zoom — it fundamentally changes how your audience **feels** about a character.

**Wide (18-24mm)** — Exaggerates depth, makes spaces feel vast. Used for establishing shots and isolation. Think Kubrick's hallways in The Shining.

**Normal (35-50mm)** — Closest to human eye perception. Feels natural and intimate. Many dialogue scenes use 40-50mm.

**Telephoto (85-200mm)** — Compresses depth, flattens space. Creates claustrophobia or voyeuristic distance. Used for surveillance scenes or to isolate subjects from busy backgrounds.

The Hitchcock "dolly zoom" (Vertigo effect) uses changing focal length while moving the camera to create a surreal sense of disorientation.`,

    'composition': `Composition is how you guide the viewer's eye through the frame.

**Rule of Thirds** — Place key elements at intersection points. Creates natural visual tension. Breaking this rule (centering) can feel powerful or static.

**Golden Ratio (φ = 1.618)** — A more organic guide than thirds. Creates pleasing spiral paths. Wes Anderson centers obsessively, which creates his signature symmetry.

**Leading Lines** — Roads, hallways, fences, shadows — they pull the eye toward your subject. Diagonal lines = energy and movement.

**Negative Space** — Empty areas create breathing room and loneliness. Lean into it for contemplative moments.

⚠️ Common mistake: Overcomposing. Sometimes the most powerful frame is the imperfect one that feels raw and documentary.`,

    'color temperature': `Color temperature (measured in Kelvin) is one of cinema's most powerful unconscious storytelling tools.

**Warm (2000-3500K)** — Candlelight, tungsten, golden hour. Feels intimate, nostalgic, safe. Think Amélie's amber Paris.

**Neutral (4000-5500K)** — Daylight. Feels grounded and real. Documentary standard.

**Cool (6500-10000K)** — Overcast sky, moonlight, blue shade. Feels clinical, lonely, cold. Think The Revenant's frozen landscapes.

Many films use warm/cool contrast between interior (safe) and exterior (dangerous). Breaking Bad uses this masterfully — warm Mexico vs. cold Albuquerque.`,

    'depth of field': `Depth of field is your focus storytelling tool.

**Shallow DOF (f/1.4-2.8)** — Only your subject is sharp. Background becomes creamy bokeh. Instantly cinematic. Draws the eye to exactly what matters.

**Deep DOF (f/8-16)** — Everything is in focus. Used for landscapes, architecture, group scenes. Orson Welles loved deep focus in Citizen Kane.

**Rack Focus** — Shifting focus from one depth to another mid-shot. Guides the viewer's attention. "Look at THIS now."

⚠️ Shallow DOF is overused in amateur work. Sometimes a deep focus shot with intentional composition is more powerful than shallow DOF that screams "I have an expensive lens."`,

    'easing': `Easing is what separates amateur animation from professional motion.

**Linear** — Constant speed. Feels robotic and unnatural. Almost never used for character animation.

**Ease In** — Starts slow, accelerates. Like a car pulling away. Creates anticipation.

**Ease Out** — Starts fast, decelerates. Like a ball coming to rest. Feels natural and satisfying.

**Ease In-Out** — Slow start AND slow end. The most common choice for UI animation.

**Overshoot/Bounce** — Goes past the target, then settles. Adds personality and energy. Think Pixar character animation.

The 12 Principles of Animation (Disney) all connect to easing: Slow In/Slow Out is literally ease in/out.`,

    'sound design': `Sound is 50% of the cinematic experience, yet most beginners ignore it.

**Dialogue** — Should be crystal clear. -12dB to -6dB is the standard range. If your audience can't hear words, nothing else matters.

**Music** — Sets emotional context. Duck it under dialogue (-18dB to -12dB). Let it breathe in pauses.

**SFX** — Sound effects ground your scene in reality. Foley (footsteps, cloth, objects) is what makes a scene feel "real."

**Ambience** — Room tone, wind, traffic, birds. This layer creates the sense of PLACE. Remove it and scenes feel like they're shot in a void.

⚠️ The biggest mistake: music too loud over dialogue. If you can't hear the words, you've failed. Always prioritize clarity.`,

    'editing rhythm': `Editing is invisible when done well. The audience should feel, not notice, your cuts.

**Pace = Emotion**. Fast cuts = tension, excitement. Slow cuts = contemplation, dread. Match your cut rhythm to the emotional beat.

**Cut on Action** — Cutting during movement hides the edit. The eye follows the motion, not the splice.

**J-Cut / L-Cut** — Audio leads or trails the visual cut. Creates flow between scenes. Every professional editor uses these constantly.

**The Kuleshov Effect** — The same face shown after different images (food, coffin, child) reads as different emotions. Context creates meaning.

⚠️ Jump cuts should be intentional (Godard used them as style). Unintentional jump cuts are the #1 sign of amateur editing.`
};

export async function initAITutor() {
    aiStatus.value = 'loading';
    aiModelProgress.value = 0.5;

    try {
        // Build knowledge base from taxonomy
        const nodes = getAllInitialNodes();
        knowledgeBase = nodes.map(n => ({
            title: n.title?.toLowerCase() || '',
            definition: n.definition || '',
            example: n.example || '',
            problemSolved: n.problemSolved || '',
            breaksIfMisused: n.breaksIfMisused || '',
            domain: n.domain || ''
        }));

        // Add subgroups
        for (const [domain, groups] of Object.entries(SUBGROUPS)) {
            for (const g of groups) {
                knowledgeBase.push({
                    title: g.title?.toLowerCase() || '',
                    definition: g.definition || '',
                    example: '',
                    problemSolved: '',
                    breaksIfMisused: '',
                    domain
                });
            }
        }

        aiModelProgress.value = 1;
        aiStatus.value = 'ready';
        console.log('🧠 AI Tutor ready (knowledge base mode)');

    } catch (e) {
        console.error('AI Tutor init failed:', e);
        aiStatus.value = 'error';
    }
}

export async function askTutor(userMessage) {
    if (aiStatus.value !== 'ready') return;

    aiStatus.value = 'thinking';

    // Add user message
    const messages = [
        ...aiMessages.value,
        { role: 'user', content: userMessage }
    ];
    aiMessages.value = messages;

    // Simulate brief thinking delay
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

    try {
        const response = generateResponse(userMessage);

        aiMessages.value = [
            ...messages,
            { role: 'assistant', content: response }
        ];

        aiStatus.value = 'ready';

    } catch (e) {
        console.error('AI error:', e);
        aiMessages.value = [
            ...messages,
            { role: 'assistant', content: '⚠️ Sorry, I couldn\'t find an answer. Try asking about a specific concept like "three-point lighting" or "focal length".' }
        ];
        aiStatus.value = 'ready';
    }
}

function generateResponse(query) {
    const q = query.toLowerCase().trim();

    // Check curated tips first
    for (const [key, tip] of Object.entries(TUTOR_TIPS)) {
        if (q.includes(key) || key.split(' ').every(w => q.includes(w))) {
            return tip;
        }
    }

    // Keyword matching against curated tips
    const keywords = {
        'light': 'three-point lighting',
        'key light': 'three-point lighting',
        'fill light': 'three-point lighting',
        'back light': 'three-point lighting',
        'rim light': 'three-point lighting',
        'lens': 'focal length',
        'zoom': 'focal length',
        'wide angle': 'focal length',
        'telephoto': 'focal length',
        'mm': 'focal length',
        'bokeh': 'depth of field',
        'aperture': 'depth of field',
        'focus': 'depth of field',
        'f-stop': 'depth of field',
        'f/': 'depth of field',
        'rule of thirds': 'composition',
        'golden ratio': 'composition',
        'framing': 'composition',
        'negative space': 'composition',
        'leading line': 'composition',
        'kelvin': 'color temperature',
        'warm': 'color temperature',
        'cool light': 'color temperature',
        'white balance': 'color temperature',
        'ease': 'easing',
        'bezier': 'easing',
        'animation curve': 'easing',
        'motion curve': 'easing',
        'slow in': 'easing',
        'slow out': 'easing',
        'audio': 'sound design',
        'mix': 'sound design',
        'dialogue': 'sound design',
        'foley': 'sound design',
        'ambience': 'sound design',
        'sfx': 'sound design',
        'sound effect': 'sound design',
        'cut': 'editing rhythm',
        'pace': 'editing rhythm',
        'pacing': 'editing rhythm',
        'j-cut': 'editing rhythm',
        'l-cut': 'editing rhythm',
        'jump cut': 'editing rhythm',
        'montage': 'editing rhythm',
        'rhythm': 'editing rhythm',
        'kuleshov': 'editing rhythm',
    };

    for (const [keyword, tipKey] of Object.entries(keywords)) {
        if (q.includes(keyword)) {
            return TUTOR_TIPS[tipKey];
        }
    }

    // Search taxonomy knowledge base
    const matches = knowledgeBase
        .map(item => {
            const words = q.split(/\s+/);
            const score = words.reduce((s, w) => {
                if (item.title.includes(w)) s += 3;
                if (item.definition.toLowerCase().includes(w)) s += 2;
                if (item.example.toLowerCase().includes(w)) s += 1;
                if (item.problemSolved.toLowerCase().includes(w)) s += 1;
                return s;
            }, 0);
            return { ...item, score };
        })
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    if (matches.length > 0) {
        const best = matches[0];
        let response = `**${best.title.charAt(0).toUpperCase() + best.title.slice(1)}** (${best.domain})\n\n${best.definition}`;

        if (best.example) response += `\n\n🎬 **Example:** ${best.example}`;
        if (best.problemSolved) response += `\n\n✅ **Solves:** ${best.problemSolved}`;
        if (best.breaksIfMisused) response += `\n\n⚠️ **Breaks if misused:** ${best.breaksIfMisused}`;

        if (matches.length > 1) {
            response += `\n\n---\n**Related:** ${matches.slice(1).map(m => m.title).join(', ')}`;
        }

        return response;
    }

    // Fallback
    return `I don't have a specific entry for "${query}" yet, but try asking about:\n\n• **Lighting** — three-point setup, color temperature\n• **Camera** — focal length, depth of field, aperture\n• **Composition** — rule of thirds, golden ratio\n• **Motion** — easing curves, animation principles\n• **Sound** — mixing, dialogue vs music levels\n• **Editing** — pacing, cut types, rhythm\n\nOr try the 🔍 search (Ctrl+K) to find specific concepts!`;
}

export function clearChat() {
    aiMessages.value = [];
}

export function getAIStatus() {
    return aiStatus.value;
}
