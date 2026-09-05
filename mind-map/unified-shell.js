import './handcrafted-pages.css';
import './unified-shell.css';
import './global-lang.js';
import { orderedItems } from './atlas-navigation.js';

// The shell and theme are in the initial HTML. Reading never waits for JS.
document.documentElement.classList.remove('ua-no-js');
const current = location.pathname.split('/').pop() || 'index.html';
const main = document.querySelector('.ua-main');
const menuButton = document.querySelector('.ua-menu');
const mobileBar = document.querySelector('.ua-mobile-bar');
const closeButton = document.querySelector('.ua-close');
const scrim = document.querySelector('.ua-scrim');
const rail = document.querySelector('.ua-rail');
const narrowScreen = window.matchMedia('(max-width: 920px)');
let drawerOpen = false;

function setOpen(requestedOpen, restoreFocus = true) {
  drawerOpen = requestedOpen && narrowScreen.matches;
  document.body.classList.toggle('ua-open', drawerOpen);
  menuButton?.setAttribute('aria-expanded', String(drawerOpen));
  scrim?.setAttribute('aria-hidden', String(!drawerOpen));
  if (rail) {
    rail.inert = narrowScreen.matches && !drawerOpen;
    if (drawerOpen) {
      rail.setAttribute('role', 'dialog');
      rail.setAttribute('aria-modal', 'true');
    } else {
      rail.removeAttribute('role');
      rail.removeAttribute('aria-modal');
    }
  }
  if (main) main.inert = drawerOpen;
  if (mobileBar) mobileBar.inert = drawerOpen;
  if (drawerOpen) closeButton?.focus({ preventScroll: true });
  else if (restoreFocus && narrowScreen.matches) menuButton?.focus({ preventScroll: true });
}

setOpen(false, false);
menuButton?.addEventListener('click', () => setOpen(!drawerOpen));
closeButton?.addEventListener('click', () => setOpen(false));
scrim?.addEventListener('click', () => setOpen(false));
rail?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false, false)));
narrowScreen.addEventListener('change', () => setOpen(false, false));
document.addEventListener('keydown', (event) => {
  if (!drawerOpen) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    setOpen(false);
  }
  if (event.key !== 'Tab' || !rail) return;
  const focusable = [...rail.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')]
    .filter((element) => element.getClientRects().length);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

// The rail scrolls independently; a deep reference page must remain findable.
const currentLink = rail?.querySelector('[aria-current="page"]');
const navigation = rail?.querySelector('.ua-nav');
if (currentLink && navigation) {
  navigation.scrollTop = Math.max(0, currentLink.offsetTop - navigation.offsetTop - 70);
}

const currentIndex = orderedItems.findIndex(([href]) => href === current);
if (main && currentIndex > 0 && !main.querySelector('.ua-route-nav')) {
  const previous = orderedItems[currentIndex - 1];
  const next = orderedItems[currentIndex + 1];
  const routeNav = document.createElement('nav');
  routeNav.className = 'ua-route-nav';
  routeNav.setAttribute('aria-label', 'Related atlas sections');
  routeNav.innerHTML = `
    <a href="${previous[0]}"><small>Previous</small><span>← ${previous[1]}</span></a>
    <a class="ua-route-home" href="index.html"><small>Knowledge atlas</small><span>Overview</span></a>
    ${next ? `<a href="${next[0]}"><small>Next</small><span>${next[1]} →</span></a>` : '<span></span>'}`;
  main.append(routeNav);
}

document.querySelectorAll('img').forEach((image) => { image.decoding ||= 'async'; });

// Only decorative images move, only on fine-pointer desktop devices, and only
// after a real scroll/resize. No animation library or permanent frame loop.
const motionAllowed = window.matchMedia('(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 921px)');
const layers = [...document.querySelectorAll('[data-ua-parallax]')]
  .filter((element) => element.matches('img') && element.closest('[aria-hidden="true"]'));
let pendingFrame = 0;

function paintDepth() {
  pendingFrame = 0;
  if (!motionAllowed.matches || document.hidden) return;
  const viewport = window.innerHeight;
  layers.forEach((layer) => {
    const bounds = layer.parentElement.getBoundingClientRect();
    if (bounds.bottom < -40 || bounds.top > viewport + 40) return;
    const progress = Math.max(-1, Math.min(1, (viewport / 2 - (bounds.top + bounds.height / 2)) / viewport));
    const travel = Math.min(24, Math.max(8, Number(layer.dataset.uaParallax) || 16));
    layer.style.transform = `translate3d(0, ${Math.round(progress * travel)}px, 0)`;
  });
}

function queueDepth() {
  if (motionAllowed.matches && !pendingFrame && layers.length) pendingFrame = requestAnimationFrame(paintDepth);
}

function syncMotion() {
  cancelAnimationFrame(pendingFrame);
  pendingFrame = 0;
  layers.forEach((layer) => { layer.style.transform = ''; });
  queueDepth();
}

window.addEventListener('scroll', queueDepth, { passive: true });
window.addEventListener('resize', queueDepth, { passive: true });
document.addEventListener('visibilitychange', syncMotion);
motionAllowed.addEventListener('change', syncMotion);
syncMotion();
