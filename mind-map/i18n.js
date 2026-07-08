/**
 * i18n — Lightweight Bilingual System (English / Hindi)
 * - Reads `data-i18n` attributes on elements
 * - Swaps textContent from loaded JSON language files
 * - Persists choice in localStorage
 * - Sets <html lang="..."> for accessibility
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'site-language';
  const DEFAULT_LANG = 'en';
  const SUPPORTED = ['en', 'hi'];

  // Cache loaded language packs
  const langCache = {};

  // ─── Public API ───
  window.I18n = {
    currentLang: DEFAULT_LANG,

    /** Initialize: load saved language, apply it */
    async init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      const lang = SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
      await this.setLanguage(lang, false);
    },

    /** Switch language */
    async setLanguage(lang, animate = true) {
      if (!SUPPORTED.includes(lang)) return;
      this.currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);

      // Set HTML lang attribute
      document.documentElement.setAttribute('lang', lang);

      // Toggle body class for CSS hooks
      document.body.classList.remove('lang-en', 'lang-hi');
      document.body.classList.add('lang-' + lang);

      // Load language pack if not cached
      if (!langCache[lang]) {
        try {
          const basePath = this.getBasePath();
          const resp = await fetch(basePath + 'lang/' + lang + '.json');
          if (resp.ok) {
            langCache[lang] = await resp.json();
          } else {
            console.warn('[i18n] Could not load lang/' + lang + '.json');
            return;
          }
        } catch (e) {
          console.warn('[i18n] Fetch error for', lang, e);
          return;
        }
      }

      const strings = langCache[lang];

      // Apply to all [data-i18n] elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = this.resolve(strings, key);
        if (value !== undefined) {
          if (animate) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(4px)';
            setTimeout(() => {
              if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = value;
              } else {
                el.textContent = value;
              }
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, 150);
          } else {
            if (el.hasAttribute('data-i18n-html')) {
              el.innerHTML = value;
            } else {
              el.textContent = value;
            }
          }
        }
      });

      // Update switcher button labels
      this.updateSwitcherUI(lang);

      // Dispatch event for other scripts
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    /** Toggle between en ↔ hi */
    toggle() {
      const next = this.currentLang === 'en' ? 'hi' : 'en';
      this.setLanguage(next, true);
    },

    /** Resolve dot-notation key from object */
    resolve(obj, path) {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    },

    /** Detect base path relative to current page */
    getBasePath() {
      const scripts = document.querySelectorAll('script[src*="i18n.js"]');
      if (scripts.length > 0) {
        const src = scripts[0].getAttribute('src');
        return src.replace('i18n.js', '');
      }
      return '';
    },

    /** Update switcher button visual state */
    updateSwitcherUI(lang) {
      const switcher = document.getElementById('lang-switcher');
      if (!switcher) return;

      const enLabel = switcher.querySelector('.lang-en-label');
      const hiLabel = switcher.querySelector('.lang-hi-label');

      if (enLabel && hiLabel) {
        enLabel.classList.toggle('active-lang', lang === 'en');
        hiLabel.classList.toggle('active-lang', lang === 'hi');
      }
    }
  };

  // ─── Auto-init on DOMContentLoaded ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.I18n.init());
  } else {
    window.I18n.init();
  }
})();
