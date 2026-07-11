/**
 * global-lang.js
 * Injects EN/HI language switcher and applies translations on every page.
 * - Uses i18n.js for data-i18n / data-i18n-html + lang JSON packs
 * - Falls back to hardcoded page/sidebar maps for untagged content
 */

import {
  applyTranslations,
  loadLang,
  cacheOriginal,
  restoreOriginal,
  originalCache,
  updateSwitcherUI,
  STORAGE_KEY,
  I18n,
} from './i18n.js';

// ─── Hindi translations keyed by page filename (fallback for untagged heroes) ───
const PAGE_TRANSLATIONS = {
  'index.html': {
    pageTitle: 'विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क — सिनेमाई आर्किटेक्ट की तरह सोचें',
    h1: 'AI इसे परफ़ेक्ट बना सकता है। इंसान इसे इंसानी बनाते हैं।',
    heroSub1: 'हम इमोशन मीटर हैं।',
    heroSub2:
      'हमने 3 बजे का दर्द जिया है, सालों की कोशिश के बाद चुप्पी में मिली जीत, और वो धोखा जो अब भी चुभता है। AI बड़े पैमाने पर परफ़ेक्ट कंटेंट बना सकता है। लेकिन उसे महसूस कराना — सिर्फ इंसान कर सकता है।',
    heroQuote:
      '"मैंने यह फ़्रेमवर्क इसलिए बनाया क्योंकि भविष्य सबसे अच्छे prompt writer का नहीं है। ये सबसे अच्छे emotion director का है।"',
  },
  'storytelling.html': {
    pageTitle: 'कहानी सुनाना — कोर लेयर — विज़ुअल स्टोरीटेलिंग',
    domainLabel: 'डोमेन 00',
    h1: 'कहानी सुनाना',
    heroItalic: '"अगर यह सच्चाई से connect नहीं करती, तो बाकी सब बेकार है।"',
    heroDesc:
      'कहानी lead करती है। स्टाइल serve करता है। डोमेन execute करते हैं। अगर आप यहाँ से skip करोगे, तो बाकी सब beautiful nonsense बन जाएगा।',
  },
  'design.html': {
    pageTitle: 'डिज़ाइन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    domainLabel: 'डोमेन 01',
    h1: 'डिज़ाइन',
    heroItalic: '"अगर यह कभी हिले नहीं, तो भी काम करेगा?"',
    heroDesc:
      'डिज़ाइन यह है कि इसके हिलने से पहले यह कैसा दिखता है। Composition, color, typography — ये visual कहानी का मौन व्याकरण हैं।',
  },
  'cinematography.html': {
    pageTitle: 'सिनेमेटोग्राफ़ी — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    domainLabel: 'डोमेन 02',
    h1: 'सिनेमेटोग्राफ़ी',
    heroItalic: '"क्या यह physically real लगता है?"',
    heroDesc:
      'सिनेमेटोग्राफ़ी यानी रोशनी और space से लिखना। हक़ीक़त को कैसे photograph किया जाता है। Clip ख़त्म होते ही cinematography ख़त्म — बाद में editing में meaning बनती है। यह physics, optics, और controlled chaos है।',
    sectionA: 'A · लाइट फ़िज़िक्स',
    sectionADesc: 'रोशनी ही एकमात्र चीज़ है जो कैमरा देखता है। बाकी सब अनुमान है।',
    sectionB: 'B · Motivated Lighting',
    sectionBDesc: 'हर लाइट का एक कारण होना चाहिए। अगर तुम source नहीं दिखा सकते, तो audience को झूठ बोल रहे हो।',
    sectionC: 'C · कैमरा ऑप्टिक्स',
    sectionCDesc: 'Lenses reality capture नहीं करते — वो उसे interpret करते हैं। हर focal length एक अलग झूठ बोलता है।',
    sectionD: 'D · Exposure Control',
    sectionDDesc: 'रोशनी का triangle: aperture, shutter, ISO। इसे master करो या कुछ भी नहीं।',
    sectionE: 'E · Blocking और Camera Movement',
    sectionEDesc: 'Actor कहाँ हिलते हैं और camera कहाँ follow करता है। Dance के बिना choreography।',
    sectionF: 'F · Continuity और Coverage',
    sectionFDesc: 'वो invisible discipline जो editing को breathe करने देती है। Cut के लिए shoot करो।',
  },
  'sound.html': {
    pageTitle: 'साउंड — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    domainLabel: 'डोमेन 03',
    h1: 'साउंड डिज़ाइन',
    heroItalic: '"क्या आँखें बंद करके भी real लगेगा?"',
    heroDesc:
      'साउंड फ़िल्ममेकिंग का invisible आधा हिस्सा है। Audience महसूस करती है कि picture में क्या है, लेकिन वो जो feel करते हैं वो अक्सर sound से आता है।',
  },
  'editing.html': {
    pageTitle: 'एडिटिंग — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    domainLabel: 'डोमेन 04',
    h1: 'एडिटिंग',
    heroItalic: '"यह sequence क्या कह रहा है?"',
    heroDesc:
      'एडिटिंग वो जगह है जहाँ फ़िल्म असल में बनती है। यह shots को arrange करने के बारे में नहीं है — यह time और emotion को control करने के बारे में है।',
  },
  'motion.html': {
    pageTitle: 'मोशन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    domainLabel: 'डोमेन 05',
    h1: 'मोशन डिज़ाइन',
    heroItalic: '"क्या यह ज़िंदा लगता है?"',
    heroDesc:
      'मोशन डिज़ाइन animation principles को visual storytelling के साथ मर्ज करता है। जो हिलता है वह eye को guide करता है, emotion बनाता है, और rhythm establish करता है।',
  },
  'ai-visual.html': {
    pageTitle: 'AI विज़ुअल जनरेशन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'AI विज़ुअल जनरेशन',
    heroDesc:
      'AI tools creative vision को amplify करते हैं — replace नहीं करते। इन्हें cinematographer की तरह use करो: ये तेज़ हैं, ये scalable हैं, लेकिन ये direction तुमसे ही लेते हैं।',
  },
  'emotion-grammar.html': {
    pageTitle: 'इमोशन ग्रामर — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'इमोशन ग्रामर',
    heroDesc:
      '24 core emotions को visual, sonic, और narrative elements पर map करना। एक reference system जो creative decisions को इमोशन से backwards बनाने में मदद करता है।',
  },
  'scene-grammar.html': {
    pageTitle: 'सीन ग्रामर — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'सीन ग्रामर',
    heroDesc: '10 scene archetypes universal हैं। हर scene एक function serve करता है। इन्हें समझो और तुम किसी भी story में कहाँ हो जान सकते हो।',
  },
  'story-emotion.html': {
    pageTitle: 'कहानी × इमोशन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'कहानी और इमोशन',
  },
  'human-layers.html': {
    pageTitle: 'ह्यूमन लेयर्स — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'ह्यूमन लेयर्स',
    heroDesc: 'हर compelling character में multiple layers होती हैं। Surface के नीचे जो है वही story को human बनाता है।',
  },
  'audience-participation.html': {
    pageTitle: 'ऑडियंस पार्टिसिपेशन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'ऑडियंस पार्टिसिपेशन',
    heroDesc:
      'Audience passive नहीं है। वो story में actively participate करती है। अच्छी storytelling इस participation को design करती है।',
  },
  'ideation.html': {
    pageTitle: 'आइडिया इंजन — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'आइडिया इंजन',
    heroDesc: 'Creative constraints creativity को kill नहीं करते — वो उसे focus करते हैं। Random constraints use करो breakthrough ideas पाने के लिए।',
  },
  'skill-tree.html': {
    pageTitle: 'स्किल ट्री — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'स्किल ट्री',
    heroDesc: 'अपनी filmmaking skills को map करो। देखो कि तुम कहाँ हो और कहाँ जाना है।',
  },
  'style-reference.html': {
    pageTitle: 'स्टाइल रेफ़रेंस — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'स्टाइल रेफ़रेंस',
    heroDesc: 'Visual styles का encyclopedia। हर style का अपना grammar है। इन्हें study करो, फिर अपनी भाषा बनाओ।',
  },
  'craft-notes.html': {
    pageTitle: 'क्राफ़्ट नोट्स — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'क्राफ़्ट नोट्स',
    heroDesc: 'Personal working notes। Raw observations जो practice से आए हैं।',
  },
  'resources.html': {
    pageTitle: 'रिसोर्सेज़ — विज़ुअल स्टोरीटेलिंग फ़्रेमवर्क',
    h1: 'रिसोर्सेज़',
    heroDesc: 'Curated YouTube channels, tools, और references। Noise cut करो। Best study करो।',
  },
  'start-here.html': {
    pageTitle: 'यहाँ से शुरू करो — तेरा Creative सफ़र',
  },
  'filmmaking-keywords.html': {
    pageTitle: 'फ़िल्ममेकिंग कीवर्ड्स — विज़ुअल स्टोरीटेलिंग',
    h1: 'फ़िल्ममेकिंग कीवर्ड्स',
  },
  'mograph-keywords.html': {
    pageTitle: 'मोशन ग्राफ़िक्स कीवर्ड्स — विज़ुअल स्टोरीटेलिंग',
    h1: 'मोशन ग्राफ़िक्स कीवर्ड्स',
  },
  'editing-rhythm.html': {
    pageTitle: 'एडिटिंग रिदम — विज़ुअल स्टोरीटेलिंग',
    h1: 'एडिटिंग रिदम',
  },
  'playgrounds.html': {
    pageTitle: 'प्लेग्राउंड्स — विज़ुअल स्टोरीटेलिंग',
    h1: 'प्लेग्राउंड्स',
  },
  'visual-story.html': {
    pageTitle: 'द विज़ुअल स्टोरी — ब्रूस ब्लॉक',
    h1: 'द विज़ुअल स्टोरी',
  },
};

// ─── Sidebar / common UI Hindi map (exact English text → Hindi) ───
const SIDEBAR_HI = {
  'VISUAL STORYTELLING': 'विज़ुअल स्टोरीटेलिंग',
  'Knowledge Framework': 'नॉलेज फ़्रेमवर्क',
  Core: 'कोर',
  Domains: 'डोमेन्स',
  'Advanced Systems': 'एडवांस्ड सिस्टम्स',
  'Tools & Reference': 'टूल्स और रेफ़रेंस',
  'Tools &amp; Reference': 'टूल्स और रेफ़रेंस',
  Overview: 'ओवरव्यू',
  Storytelling: 'कहानी',
  Design: 'डिज़ाइन',
  Cinematography: 'सिनेमेटोग्राफ़ी',
  Sound: 'साउंड',
  Editing: 'एडिटिंग',
  Motion: 'मोशन',
  'AI Visual Generation': 'AI विज़ुअल जनरेशन',
  'AI Visual': 'AI विज़ुअल',
  'Emotion Grammar': 'इमोशन ग्रामर',
  'Scene Grammar': 'सीन ग्रामर',
  'Story × Emotion': 'कहानी × इमोशन',
  'Human Layers': 'ह्यूमन लेयर्स',
  'Audience Participation': 'ऑडियंस पार्टिसिपेशन',
  'Ideation Engine': 'आइडिया इंजन',
  Ideation: 'आइडिया इंजन',
  'Skill Tree': 'स्किल ट्री',
  'Style Reference': 'स्टाइल रेफ़रेंस',
  'Craft Notes': 'क्राफ़्ट नोट्स',
  Resources: 'रिसोर्सेज़',
  'Keyword Maps': 'कीवर्ड मैप्स',
  'Filmmaking Keywords': 'फ़िल्ममेकिंग कीवर्ड्स',
  'Motion Graphics Keywords': 'मोशन ग्राफ़िक्स कीवर्ड्स',
  'Editing Rhythm': 'एडिटिंग रिदम',
  '← Back to Overview': '← ओवरव्यू पर वापस',
  'Skip to main content': 'मुख्य सामग्री पर जाएँ',
};

/** English exact-match map for common body labels not tagged with data-i18n */
const COMMON_HI = {
  ...SIDEBAR_HI,
  NEW: 'नया',
  Advanced: 'एडवांस्ड',
  'Core Principle': 'कोर सिद्धांत',
  Intent: 'इंटेंट',
  Story: 'कहानी',
  'The Framework': 'फ़्रेमवर्क',
  'The Five Pillars': 'पाँच स्तंभ',
  'Beyond Craft': 'क्राफ़्ट से आगे',
  'Practice & Apply': 'अभ्यास और लागू करें',
  'Learning Paths': 'लर्निंग पाथ्स',
  Beginner: 'बिगिनर',
  Intermediate: 'इंटरमीडिएट',
  Advanced: 'एडवांस्ड',
};

const fallbackTouched = new Set();

function getPageName() {
  const path = window.location.pathname;
  let file = path.split('/').pop() || 'index.html';
  if (!file || !file.includes('.')) file = 'index.html';
  return file;
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
      body.lang-hi {
        font-family: 'Noto Sans Devanagari', 'Inter', system-ui, sans-serif !important;
        line-height: 1.8;
      }
    </style>
    <div class="glb-icon" aria-hidden="true">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
      </svg>
    </div>
    <button type="button" id="glb-en-btn" class="lang-en-label active-lang" data-lang="en">English</button>
    <button type="button" id="glb-hi-btn" class="lang-hi-label" data-lang="hi">हिंदी</button>
  `;
  document.body.appendChild(el);

  el.querySelectorAll('button[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => GlobalLang.set(btn.getAttribute('data-lang')));
  });

  if (!document.getElementById('noto-devanagari-font')) {
    const link = document.createElement('link');
    link.id = 'noto-devanagari-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
}

function setTextIfMatch(el, hiText) {
  if (!el || !hiText) return;
  cacheOriginal(el);
  el.textContent = hiText;
  fallbackTouched.add(el);
}

function applyPageFallback(pageName, strings) {
  if (!strings) return;

  if (strings.pageTitle) document.title = strings.pageTitle;

  // Only fill heroes if element is not already i18n-tagged (JSON path handles those)
  if (strings.h1) {
    const h1 = document.querySelector('h1:not([data-i18n]):not([data-i18n-html])');
    if (h1) setTextIfMatch(h1, strings.h1);
  }

  if (strings.domainLabel) {
    document.querySelectorAll('p:not([data-i18n]):not([data-i18n-html])').forEach((p) => {
      if (/Domain\s+0\d/i.test(p.textContent)) setTextIfMatch(p, strings.domainLabel);
    });
  }

  if (strings.heroItalic) {
    const italics = document.querySelectorAll('p.italic:not([data-i18n]):not([data-i18n-html]), p[style*="italic"]:not([data-i18n]):not([data-i18n-html])');
    if (italics[0]) setTextIfMatch(italics[0], strings.heroItalic);
  }

  if (strings.heroDesc) {
    const mainDesc = document.querySelector(
      'header p:not(.italic):not([style*="italic"]):not([data-i18n]):not([data-i18n-html]), main > section:first-of-type p:not([data-i18n]):not([data-i18n-html])'
    );
    if (mainDesc) setTextIfMatch(mainDesc, strings.heroDesc);
  }

  if (strings.heroQuote) {
    document.querySelectorAll('p.italic:not([data-i18n]), blockquote p:not([data-i18n]), p[style*="italic"]:not([data-i18n])').forEach((q) => {
      if (/built this framework/i.test(q.textContent)) setTextIfMatch(q, strings.heroQuote);
    });
  }

  const sectionMap = {
    sectionA: 'A ·',
    sectionB: 'B ·',
    sectionC: 'C ·',
    sectionD: 'D ·',
    sectionE: 'E ·',
    sectionF: 'F ·',
  };
  Object.entries(sectionMap).forEach(([key, prefix]) => {
    if (!strings[key]) return;
    document.querySelectorAll('.section-divider').forEach((div) => {
      if (div.textContent.trim().startsWith(prefix)) {
        setTextIfMatch(div, strings[key]);
        const descKey = key + 'Desc';
        if (strings[descKey]) {
          const next = div.nextElementSibling;
          if (next && next.tagName === 'P') setTextIfMatch(next, strings[descKey]);
        }
      }
    });
  });
}

function applyExactTextMap(map) {
  const selectors = [
    '.sidebar-link',
    '.sidebar-section-title',
    '.sidebar a',
    'nav a',
    '.tag',
    'h2',
    'h3',
    'h4',
    'label',
    'button',
    'th',
    'td',
    'span',
    'p',
    'div',
    'a',
    'li',
  ].join(',');

  document.querySelectorAll(selectors).forEach((el) => {
    if (el.closest('#global-lang-switcher')) return;
    if (el.hasAttribute('data-i18n') || el.hasAttribute('data-i18n-html')) return;

    // Prefer leaf text nodes for mixed icon+label links
    let applied = false;
    el.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        const raw = node.textContent;
        const trimmed = raw.trim();
        if (map[trimmed]) {
          if (!originalCache.has(el)) cacheOriginal(el);
          node.textContent = raw.replace(trimmed, map[trimmed]);
          fallbackTouched.add(el);
          applied = true;
        }
      }
    });

    if (!applied) {
      const text = el.textContent.trim();
      if (map[text] && el.children.length === 0) {
        setTextIfMatch(el, map[text]);
      }
    }
  });
}

function revertFallbacks() {
  fallbackTouched.forEach((el) => {
    if (el && el.isConnected) restoreOriginal(el);
  });
  fallbackTouched.clear();
}

/**
 * Dictionary-driven translation for any remaining English text nodes that
 * appear as keys in hi.json under en→hi reverse map built from paired packs.
 */
async function applyDictionarySweep() {
  const en = await loadLang('en');
  const hi = await loadLang('hi');
  if (!en || !hi) return;

  const reverse = new Map();

  function walk(enNode, hiNode, path) {
    if (typeof enNode === 'string' && typeof hiNode === 'string') {
      const key = enNode.trim();
      if (key.length >= 2) reverse.set(key, hiNode);
      return;
    }
    if (enNode && hiNode && typeof enNode === 'object' && !Array.isArray(enNode)) {
      Object.keys(enNode).forEach((k) => walk(enNode[k], hiNode[k], path + '.' + k));
    }
  }
  walk(en, hi, '');

  // Also index flat auto/index keys: en[key] → hi[key]
  Object.keys(en).forEach((k) => {
    if (typeof en[k] === 'string' && typeof hi[k] === 'string') {
      reverse.set(en[k].trim(), hi[k]);
    }
  });

  if (reverse.size === 0) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.parentElement) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (p.closest('#global-lang-switcher, script, style, noscript, code, pre, svg')) {
        return NodeFilter.FILTER_REJECT;
      }
      if (p.hasAttribute('data-i18n') || p.hasAttribute('data-i18n-html')) {
        return NodeFilter.FILTER_REJECT;
      }
      const t = node.textContent.trim();
      if (t.length < 2 || !reverse.has(t)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const parent = node.parentElement;
    cacheOriginal(parent);
    const trimmed = node.textContent.trim();
    const hiText = reverse.get(trimmed);
    if (hiText) {
      node.textContent = node.textContent.replace(trimmed, hiText);
      fallbackTouched.add(parent);
    }
  });
}

const GlobalLang = {
  current: 'en',

  init() {
    const saved = localStorage.getItem(STORAGE_KEY) || 'en';
    this.current = saved;
    I18n.currentLang = saved;

    const boot = async () => {
      injectSwitcher();
      updateSwitcherUI(saved);
      await this.set(saved, false);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  },

  async set(lang, animate = true) {
    if (lang !== 'en' && lang !== 'hi') return;
    this.current = lang;
    I18n.currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('lang-hi', lang === 'hi');
    document.body.classList.toggle('lang-en', lang === 'en');
    updateSwitcherUI(lang);

    // Always restore fallbacks before re-applying
    revertFallbacks();

    // Primary path: JSON packs + data-i18n / data-i18n-html
    await applyTranslations(lang, { animate });

    if (lang === 'hi') {
      const pageName = getPageName();
      applyPageFallback(pageName, PAGE_TRANSLATIONS[pageName]);
      applyExactTextMap(COMMON_HI);
      // Sweep remaining strings present in en/hi packs
      await applyDictionarySweep();
    }

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  },

  toggle() {
    return this.set(this.current === 'en' ? 'hi' : 'en');
  },

  // Back-compat aliases used by older markup
  applyHindi() {
    return this.set('hi');
  },
  revertToEnglish() {
    return this.set('en');
  },
};

window.GlobalLang = GlobalLang;
GlobalLang.init();
