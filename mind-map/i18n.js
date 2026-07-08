/**
 * i18n — Lightweight Bilingual System (English / Hindi)
 * This is an ES module so Vite can inject import.meta.env.BASE_URL at build time.
 */

const STORAGE_KEY = 'site-language';
const DEFAULT_LANG = 'en';
const SUPPORTED = ['en', 'hi'];

// Cache loaded language packs
const langCache = {};

// Vite replaces import.meta.env.BASE_URL with the actual base at build time (e.g. '/knowledge/')
const BASE_URL = import.meta.env.BASE_URL || '/';

const I18n = {
  currentLang: DEFAULT_LANG,

  async init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const lang = SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
    await this.setLanguage(lang, false);
  },

  async setLanguage(lang, animate = true) {
    if (!SUPPORTED.includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    document.documentElement.setAttribute('lang', lang);
    document.body.classList.remove('lang-en', 'lang-hi');
    document.body.classList.add('lang-' + lang);

    if (!langCache[lang]) {
      try {
        const resp = await fetch(BASE_URL + 'lang/' + lang + '.json');
        if (resp.ok) {
          langCache[lang] = await resp.json();
        } else {
          console.warn('[i18n] Could not load lang/' + lang + '.json — status:', resp.status);
          return;
        }
      } catch (e) {
        console.warn('[i18n] Fetch error for', lang, e);
        return;
      }
    }

    const strings = langCache[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = this.resolve(strings, key);
      if (value === undefined) return;

      const apply = () => {
        if (el.hasAttribute('data-i18n-html')) {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
      };

      if (animate) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(4px)';
        el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        setTimeout(() => {
          apply();
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 150);
      } else {
        apply();
      }
    });

    this.updateSwitcherUI(lang);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  },

  toggle() {
    const next = this.currentLang === 'en' ? 'hi' : 'en';
    this.setLanguage(next, true);
  },

  resolve(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  },

  updateSwitcherUI(lang) {
    document.querySelectorAll('.lang-en-label').forEach(el => el.classList.toggle('active-lang', lang === 'en'));
    document.querySelectorAll('.lang-hi-label').forEach(el => el.classList.toggle('active-lang', lang === 'hi'));
  }
};

// Expose globally
window.I18n = I18n;

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}
