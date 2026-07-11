/**
 * i18n — Bilingual system (English / Hindi)
 * ES module so Vite injects import.meta.env.BASE_URL at build time.
 */

const STORAGE_KEY = 'site-language';
const DEFAULT_LANG = 'en';
const SUPPORTED = ['en', 'hi'];

const langCache = {};
/** @type {WeakMap<Element, { html: string, text: string }>} */
const originalCache = new WeakMap();
const originalTitle = { value: null };

// Vite replaces this at build time (e.g. '/knowledge/')
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';

/**
 * Resolve a key against a language pack.
 * Supports flat keys ("index.abc123") and nested paths ("nav.brand").
 */
function resolve(obj, path) {
  if (!obj || !path) return undefined;
  // Flat key wins (auto-generated hashes use dots in the key name)
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path];
  }
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

async function loadLang(lang) {
  if (langCache[lang]) return langCache[lang];

  const candidates = [
    BASE_URL.replace(/\/?$/, '/') + 'lang/' + lang + '.json',
    'lang/' + lang + '.json',
    './lang/' + lang + '.json',
    'public/lang/' + lang + '.json',
  ];

  for (const url of candidates) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        langCache[lang] = await resp.json();
        return langCache[lang];
      }
    } catch (_) {
      /* try next */
    }
  }

  console.warn('[i18n] Could not load lang/' + lang + '.json from any path');
  langCache[lang] = {};
  return langCache[lang];
}

function cacheOriginal(el) {
  if (!originalCache.has(el)) {
    originalCache.set(el, {
      html: el.innerHTML,
      text: el.textContent,
    });
  }
}

function applyValue(el, value, useHtml) {
  cacheOriginal(el);
  if (useHtml || (typeof value === 'string' && /<[a-z][\s\S]*>/i.test(value))) {
    el.innerHTML = value;
  } else {
    el.textContent = value;
  }
}

function restoreOriginal(el) {
  const orig = originalCache.get(el);
  if (!orig) return;
  el.innerHTML = orig.html;
}

/**
 * Apply language pack strings to all marked elements on the page.
 * - [data-i18n="nav.brand"] → nested or flat key, text by default
 * - [data-i18n-html="index.abc"] → HTML-capable string (key is the attribute value)
 * - element with both: data-i18n is the key, data-i18n-html is a flag for HTML mode
 */
async function applyTranslations(lang, { animate = false } = {}) {
  if (!SUPPORTED.includes(lang)) return;

  if (originalTitle.value === null) {
    originalTitle.value = document.title;
  }

  const strings = await loadLang(lang);
  document.documentElement.setAttribute('lang', lang);
  document.body.classList.remove('lang-en', 'lang-hi');
  document.body.classList.add('lang-' + lang);

  // Restore English originals first when switching back
  if (lang === 'en') {
    document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach(restoreOriginal);
    if (originalTitle.value) document.title = originalTitle.value;
    updateSwitcherUI(lang);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    return;
  }

  // Title from pack if present
  const titleKey = strings.pageTitle || (strings.meta && strings.meta.title);
  if (typeof titleKey === 'string') {
    document.title = titleKey;
  }

  // 1) data-i18n-html as key carrier first (index.*, auto.*, page hashes)
  //    Skip nodes that only use the attribute as a boolean HTML flag.
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (!key || key === 'true') return;
    // If this element also has data-i18n AND the html attr is not a real key, skip
    const value = resolve(strings, key);
    if (value === undefined || value === null || typeof value === 'object') return;

    const apply = () => applyValue(el, value, true);
    if (animate) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.2s ease';
      setTimeout(() => {
        apply();
        el.style.opacity = '1';
      }, 120);
    } else {
      apply();
    }
  });

  // 2) Nested data-i18n keys second so child labels win over parent HTML blobs
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = resolve(strings, key);
    if (value === undefined || value === null || typeof value === 'object') return;

    const apply = () => applyValue(el, value, false);
    if (animate) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.2s ease';
      setTimeout(() => {
        apply();
        el.style.opacity = '1';
      }, 120);
    } else {
      apply();
    }
  });

  updateSwitcherUI(lang);
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

function updateSwitcherUI(lang) {
  document.querySelectorAll('.lang-en-label').forEach((el) => el.classList.toggle('active-lang', lang === 'en'));
  document.querySelectorAll('.lang-hi-label').forEach((el) => el.classList.toggle('active-lang', lang === 'hi'));
}

const I18n = {
  currentLang: DEFAULT_LANG,
  resolve,
  loadLang,
  applyTranslations,

  async init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lang = SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
    this.currentLang = lang;
    await applyTranslations(lang, { animate: false });
  },

  async setLanguage(lang, animate = true) {
    if (!SUPPORTED.includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    await applyTranslations(lang, { animate });
  },

  toggle() {
    const next = this.currentLang === 'en' ? 'hi' : 'en';
    return this.setLanguage(next, true);
  },

  updateSwitcherUI,
};

window.I18n = I18n;

export {
  I18n,
  applyTranslations,
  loadLang,
  resolve,
  updateSwitcherUI,
  cacheOriginal,
  restoreOriginal,
  originalCache,
  BASE_URL,
  STORAGE_KEY,
  SUPPORTED,
};

// No auto-init here. global-lang.js owns the language switcher lifecycle.
// Pages that only need the pack API can call I18n.init() / GlobalLang.set().
