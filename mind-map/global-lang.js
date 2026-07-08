/**
 * global-lang.js
 * Auto-injects the language switcher into every page.
 * Performs smart Hindi translations by targeting specific elements.
 * Works via: import type="module" src="global-lang.js"
 */

import { applyTranslations } from './i18n.js';

// ─── Hindi translations keyed by page filename ───
const PAGE_TRANSLATIONS = {

    'index.html': {
        pageTitle: { hi: 'विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क — सिनेमाई आर्किटेक्ट की तरह सोचें' },
        h1: { hi: 'AI इसे परफ़ेक्ट बना सकता है। इंसान इसे इंसानी बनाते हैं।' },
        heroSub1: { hi: 'हम इमोशन मीटर हैं।' },
        heroSub2: { hi: 'हमने 3 बजे का दर्द जिया है, सालों की कोशिश के बाद चुप्पी में मिली जीत, और वो धोखा जो अब भी चुभता है। AI बड़े पैमाने पर परफ़ेक्ट कंटेंट बना सकता है। लेकिन उसे महसूस कराना — सिर्फ इंसान कर सकता है।' },
        heroQuote: { hi: '"मैंने यह फ़्रेमवर्क इसलिए बनाया क्योंकि भविष्य सबसे अच्छे prompt writer का नहीं है। ये सबसे अच्छे emotion director का है।"' },
    },

    'storytelling.html': {
        pageTitle: { hi: 'कहानी सुनाना — कोर लेयर — विज़ुअल स्टोरीटेलिंग' },
        domainLabel: { hi: 'डोमेन 00' },
        h1: { hi: 'कहानी सुनाना' },
        heroItalic: { hi: '"अगर यह सच्चाई से connect नहीं करती, तो बाकी सब बेकार है।"' },
        heroDesc: { hi: 'कहानी lead करती है। स्टाइल serve करता है। डोमेन execute करते हैं। अगर आप यहाँ से skip करोगे, तो बाकी सब beautiful nonsense बन जाएगा।' },
    },

    'design.html': {
        pageTitle: { hi: 'डिज़ाइन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        domainLabel: { hi: 'डोमेन 01' },
        h1: { hi: 'डिज़ाइन' },
        heroItalic: { hi: '"अगर यह कभी हिले नहीं, तो भी काम करेगा?"' },
        heroDesc: { hi: 'डिज़ाइन यह है कि इसके हिलने से पहले यह कैसा दिखता है। Composition, color, typography — ये visual कहानी का मौन व्याकरण हैं।' },
    },

    'cinematography.html': {
        pageTitle: { hi: 'सिनेमेटोग्राफ़ी — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        domainLabel: { hi: 'डोमेन 02' },
        h1: { hi: 'सिनेमेटोग्राफ़ी' },
        heroItalic: { hi: '"क्या यह physically real लगता है?"' },
        heroDesc: { hi: 'सिनेमेटोग्राफ़ी यानी रोशनी और space से लिखना। हक़ीक़त को कैसे photograph किया जाता है। Clip ख़त्म होते ही cinematography ख़त्म — बाद में editing में meaning बनती है। यह physics, optics, और controlled chaos है।' },
        sectionA: { hi: 'A · लाइट फ़िज़िक्स' },
        sectionADesc: { hi: 'रोशनी ही एकमात्र चीज़ है जो कैमरा देखता है। बाकी सब अनुमान है।' },
        sectionB: { hi: 'B · Motivated Lighting' },
        sectionBDesc: { hi: 'हर लाइट का एक कारण होना चाहिए। अगर तुम source नहीं दिखा सकते, तो audience को झूठ बोल रहे हो।' },
        sectionC: { hi: 'C · कैमरा ऑप्टिक्स' },
        sectionCDesc: { hi: 'Lenses reality capture नहीं करते — वो उसे interpret करते हैं। हर focal length एक अलग झूठ बोलता है।' },
        sectionD: { hi: 'D · Exposure Control' },
        sectionDDesc: { hi: 'रोशनी का triangle: aperture, shutter, ISO। इसे master करो या कुछ भी नहीं।' },
        sectionE: { hi: 'E · Blocking और Camera Movement' },
        sectionEDesc: { hi: 'Actor कहाँ हिलते हैं और camera कहाँ follow करता है। Dance के बिना choreography।' },
        sectionF: { hi: 'F · Continuity और Coverage' },
        sectionFDesc: { hi: 'वो invisible discipline जो editing को breathe करने देती है। Cut के लिए shoot करो।' },
    },

    'sound.html': {
        pageTitle: { hi: 'साउंड — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        domainLabel: { hi: 'डोमेन 03' },
        h1: { hi: 'साउंड डिज़ाइन' },
        heroItalic: { hi: '"क्या आँखें बंद करके भी real लगेगा?"' },
        heroDesc: { hi: 'साउंड फ़िल्ममेकिंग का invisible आधा हिस्सा है। Audience महसूस करती है कि picture में क्या है, लेकिन वो जो feel करते हैं वो अक्सर sound से आता है।' },
    },

    'editing.html': {
        pageTitle: { hi: 'एडिटिंग — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        domainLabel: { hi: 'डोमेन 04' },
        h1: { hi: 'एडिटिंग' },
        heroItalic: { hi: '"यह sequence क्या कह रहा है?"' },
        heroDesc: { hi: 'एडिटिंग वो जगह है जहाँ फ़िल्म असल में बनती है। यह shots को arrange करने के बारे में नहीं है — यह time और emotion को control करने के बारे में है।' },
    },

    'motion.html': {
        pageTitle: { hi: 'मोशन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        domainLabel: { hi: 'डोमेन 05' },
        h1: { hi: 'मोशन डिज़ाइन' },
        heroItalic: { hi: '"क्या यह ज़िंदा लगता है?"' },
        heroDesc: { hi: 'मोशन डिज़ाइन animation principles को visual storytelling के साथ मर्ज करता है। जो हिलता है वह eye को guide करता है, emotion बनाता है, और rhythm establish करता है।' },
    },

    'ai-visual.html': {
        pageTitle: { hi: 'AI विज़ुअल जनरेशन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'AI विज़ुअल जनरेशन' },
        heroDesc: { hi: 'AI tools creative vision को amplify करते हैं — replace नहीं करते। इन्हें cinematographer की तरह use करो: ये तेज़ हैं, ये scalable हैं, लेकिन ये direction तुमसे ही लेते हैं।' },
    },

    'emotion-grammar.html': {
        pageTitle: { hi: 'इमोशन ग्रामर — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'इमोशन ग्रामर' },
        heroDesc: { hi: '24 core emotions को visual, sonic, और narrative elements पर map करना। एक reference system जो creative decisions को इमोशन से backwards بنाने में मदद करता है।' },
    },

    'scene-grammar.html': {
        pageTitle: { hi: 'सीन ग्रामर — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'सीन ग्रामर' },
        heroDesc: { hi: '10 scene archetypes universal हैं। हर scene एक function serve करता है। इन्हें समझो और तुम किसी भी story में कहाँ हो जान सकते हो।' },
    },

    'story-emotion.html': {
        pageTitle: { hi: 'कहानी × इमोशन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'कहानी और इमोशन' },
    },

    'human-layers.html': {
        pageTitle: { hi: 'ह्यूमन लेयर्स — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'ह्यूमन लेयर्स' },
        heroDesc: { hi: 'हर compelling character में multiple layers होती हैं। Surface के नीचे जो है वही story को human बनाता है।' },
    },

    'audience-participation.html': {
        pageTitle: { hi: 'ऑडियंस पार्टिसिपेशन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'ऑडियंस पार्टिसिपेशन' },
        heroDesc: { hi: 'Audience passive नहीं है। वो story में actively participate करती है। अच्छी storytelling इस participation को design करती है।' },
    },

    'ideation.html': {
        pageTitle: { hi: 'आइडिया इंजन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'आइडिया इंजन' },
        heroDesc: { hi: 'Creative constraints creativity को kill नहीं करते — वो उसे focus करते हैं। Random constraints use करो breakthrough ideas पाने के लिए।' },
    },

    'skill-tree.html': {
        pageTitle: { hi: 'स्किल ट्री — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'स्किल ट्री' },
        heroDesc: { hi: 'अपनी filmmaking skills को map करो। देखो कि तुम कहाँ हो और कहाँ जाना है।' },
    },

    'style-reference.html': {
        pageTitle: { hi: 'स्टाइल रेफ़रेंस — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'स्टाइल रेफ़रेंस' },
        heroDesc: { hi: 'Visual styles का encyclopedia। हर style का अपना grammar है। इन्हें study करो, फिर अपनी भाषा बनाओ।' },
    },

    'craft-notes.html': {
        pageTitle: { hi: 'क्राफ़्ट नोट्स — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'क्राफ़्ट नोट्स' },
        heroDesc: { hi: 'Personal working notes। Raw observations जो practice से आए हैं।' },
    },

    'resources.html': {
        pageTitle: { hi: 'रिसोर्सेज़ — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क' },
        h1: { hi: 'रिसोर्सेज़' },
        heroDesc: { hi: 'Curated YouTube channels, tools, और references। Noise cut करो। Best study करो।' },
    },

    'start-here.html': {
        pageTitle: { hi: 'यहाँ से शुरू करो — तेरा Creative सफ़र' },
    },
};

// ─── Sidebar Hindi translations ───
const SIDEBAR_HI = {
    'VISUAL STORYTELLING': 'विज़ुअल स्टोरीटेलिंग',
    'Knowledge Framework': 'नॉलेज फ़्रेमवर्क',
    'Core': 'कोर',
    'Domains': 'डोमेन्स',
    'Advanced Systems': 'एडवांस्ड सिस्टम्स',
    'Tools & Reference': 'टूल्स और रेफ़रेंस',
    'Overview': 'ओवरव्यू',
    'Storytelling': 'कहानी',
    'Design': 'डिज़ाइन',
    'Cinematography': 'सिनेमेटोग्राफ़ी',
    'Sound': 'साउंड',
    'Editing': 'एडिटिंग',
    'Motion': 'मोशन',
    'AI Visual Generation': 'AI विज़ुअल जनरेशन',
    'Emotion Grammar': 'इमोशन ग्रामर',
    'Scene Grammar': 'सीन ग्रामर',
    'Story × Emotion': 'कहानी × इमोशन',
    'Human Layers': 'ह्यूमन लेयर्स',
    'Audience Participation': 'ऑडियंस पार्टिसिपेशन',
    'Ideation Engine': 'आइडिया इंजन',
    'Skill Tree': 'स्किल ट्री',
    'Style Reference': 'स्टाइल रेफ़रेंस',
    'Craft Notes': 'क्राफ़्ट नोट्स',
    'Resources': 'रिसोर्सेज़',
    '← Back to Overview': '← ओवरव्यू पर वापस',
};

// Cache original text for reverting to English
const originalTexts = new Map();

// Cache loaded language packs
const langCache = {};

// Vite replaces import.meta.env.BASE_URL with the actual base at build time (e.g. '/knowledge/')
const BASE_URL = import.meta.env.BASE_URL || '/';

function getPageName() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    return file || 'index.html';
}

function injectSwitcher() {
    if (document.getElementById('global-lang-switcher')) return;

    const el = document.createElement('div');
    el.id = 'global-lang-switcher';
    el.innerHTML = `
    <style>
      #global-lang-switcher {
        position: fixed; top: .75rem; right: .75rem; z-index: 9999;
        display: flex; gap: 3px; padding: 5px;
        background: rgba(12,12,15,0.85);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 999px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }
      #global-lang-switcher .glb-icon {
        display:flex; align-items:center; padding:0 6px 0 4px; color:#52525b;
      }
      #global-lang-switcher button {
        padding: 6px 14px; border-radius: 999px; font-size:13px; font-weight:600;
        cursor:pointer; color:#71717a; background:none; border:none;
        transition: all 0.25s ease; font-family: inherit;
      }
      #global-lang-switcher button.active-lang {
        background: rgba(139,92,246,0.2); color:#d8b4fe;
        box-shadow: inset 0 0 0 1px rgba(139,92,246,0.4);
      }
      body.lang-hi { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif !important; line-height: 1.8; }
    </style>
    <div class="glb-icon">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
      </svg>
    </div>
    <button id="glb-en-btn" class="lang-en-label active-lang" onclick="window.GlobalLang.set('en')">English</button>
    <button id="glb-hi-btn" class="lang-hi-label" onclick="window.GlobalLang.set('hi')">हिंदी</button>
  `;
    document.body.appendChild(el);

    // Load Noto Sans Devanagari if not already loaded
    if (!document.getElementById('noto-devanagari-font')) {
        const link = document.createElement('link');
        link.id = 'noto-devanagari-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap';
        document.head.appendChild(link);
    }
}

function cacheAndReplace(el, hiText) {
    if (!originalTexts.has(el)) {
        originalTexts.set(el, el.textContent.trim());
    }
    el.textContent = hiText;
}

function revert(el) {
    if (originalTexts.has(el)) {
        el.textContent = originalTexts.get(el);
    }
}

function applyPageHindi(pageName, strings) {
    // Page title
    if (strings.pageTitle) document.title = strings.pageTitle.hi;

    // H1
    if (strings.h1) {
        const h1 = document.querySelector('h1');
        if (h1) cacheAndReplace(h1, strings.h1.hi);
    }

    // Domain label (small uppercase text above h1)
    if (strings.domainLabel) {
        const labels = document.querySelectorAll('p');
        labels.forEach(p => {
            if (/Domain\s+0\d/i.test(p.textContent)) cacheAndReplace(p, strings.domainLabel.hi);
        });
    }

    // Hero italic (question)
    if (strings.heroItalic) {
        const italics = document.querySelectorAll('p.italic, p[style*="italic"]');
        if (italics.length > 0) cacheAndReplace(italics[0], strings.heroItalic.hi);
    }

    // Hero description
    if (strings.heroDesc) {
        const mainDesc = document.querySelector('header p:not(.italic):not([style*="italic"])');
        if (mainDesc) cacheAndReplace(mainDesc, strings.heroDesc.hi);
    }

    // Hero quote (index only)
    if (strings.heroQuote) {
        const quotes = document.querySelectorAll('p.italic, blockquote p, p[style*="italic"]');
        quotes.forEach(q => { if (q.textContent.includes('built this framework')) cacheAndReplace(q, strings.heroQuote.hi); });
    }

    // Section dividers (cinematography has A·B·C·D·E·F)
    const sectionMap = { sectionA: 'A ·', sectionB: 'B ·', sectionC: 'C ·', sectionD: 'D ·', sectionE: 'E ·', sectionF: 'F ·' };
    Object.entries(sectionMap).forEach(([key, prefix]) => {
        if (strings[key]) {
            document.querySelectorAll('.section-divider').forEach(div => {
                if (div.textContent.startsWith(prefix)) cacheAndReplace(div, strings[key].hi);
            });
        }
        const descKey = key + 'Desc';
        if (strings[descKey]) {
            // Find the <p> immediately after matching section-divider
            document.querySelectorAll('.section-divider').forEach(div => {
                if (div.textContent.startsWith(prefix)) {
                    const next = div.nextElementSibling;
                    if (next && next.tagName === 'P') cacheAndReplace(next, strings[descKey].hi);
                }
            });
        }
    });
}

function revertPage() {
    document.title = originalTexts.get('__title__') || document.title;
    originalTexts.forEach((orig, el) => {
        if (typeof el !== 'string') el.textContent = orig;
    });
}

function applySidebarHindi() {
    document.querySelectorAll('.sidebar-link, .sidebar-section-title, .sidebar a').forEach(el => {
        const text = el.textContent.trim();
        if (SIDEBAR_HI[text]) cacheAndReplace(el, SIDEBAR_HI[text]);
        // For links that combine icon + text
        el.childNodes.forEach(node => {
            if (node.nodeType === 3 && SIDEBAR_HI[node.textContent.trim()]) {
                if (!originalTexts.has(node)) originalTexts.set(node, node.textContent);
                node.textContent = ' ' + SIDEBAR_HI[node.textContent.trim()];
            }
        });
    });
}

function revertSidebar() {
    document.querySelectorAll('.sidebar-link, .sidebar-section-title, .sidebar a').forEach(el => {
        el.childNodes.forEach(node => {
            if (node.nodeType === 3 && originalTexts.has(node)) {
                node.textContent = originalTexts.get(node);
            }
        });
        if (originalTexts.has(el)) el.textContent = originalTexts.get(el);
    });
}

function updateSwitcherUI(lang) {
    const en = document.getElementById('glb-en-btn');
    const hi = document.getElementById('glb-hi-btn');
    if (en) en.classList.toggle('active-lang', lang === 'en');
    if (hi) hi.classList.toggle('active-lang', lang === 'hi');
}

const GlobalLang = {
    current: 'en',

    init() {
        const saved = localStorage.getItem('site-language') || 'en';
        this.current = saved;

        // Inject switcher after DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => { injectSwitcher(); if (saved === 'hi') this.applyHindi(); });
        } else {
            injectSwitcher();
            if (saved === 'hi') this.applyHindi();
        }
    },

    set(lang) {
        this.current = lang;
        localStorage.setItem('site-language', lang);
        document.documentElement.setAttribute('lang', lang);
        document.body.classList.toggle('lang-hi', lang === 'hi');
        document.body.classList.toggle('lang-en', lang === 'en');
        updateSwitcherUI(lang);

        if (lang === 'hi') {
            this.applyHindi();
        } else {
            this.revertToEnglish();
        }
    },

    async applyHindi() {
        document.documentElement.setAttribute('lang', 'hi');
        document.body.classList.add('lang-hi');
        document.body.classList.remove('lang-en');
        updateSwitcherUI('hi');

        // Cache original title
        if (!originalTexts.has('__title__')) originalTexts.set('__title__', document.title);

        const pageName = getPageName();
        const strings = PAGE_TRANSLATIONS[pageName];
        if (strings) applyPageHindi(pageName, strings);

        applySidebarHindi();

        // Process data-i18n-html from hi.json
        if (!langCache['hi']) {
            try {
                const resp = await fetch(BASE_URL + 'lang/hi.json');
                if (resp.ok) langCache['hi'] = await resp.json();
            } catch (e) {
                console.warn('[i18n] Fetch error for hi.json', e);
            }
        }

        if (langCache['hi']) {
            document.querySelectorAll('[data-i18n-html]').forEach(el => {
                const key = el.getAttribute('data-i18n-html');
                const hiText = langCache['hi'][key];
                if (hiText) cacheAndReplace(el, hiText);
            });
        }
    },

    revertToEnglish() {
        document.documentElement.setAttribute('lang', 'en');
        document.body.classList.remove('lang-hi');
        document.body.classList.add('lang-en');
        updateSwitcherUI('en');
        revertPage();
        revertSidebar();
    }
};

window.GlobalLang = GlobalLang;
GlobalLang.init();
