// Actual Thinking Orbs geometry, MIT © 2026 Jakub Antalik.
// The engine entry point is framework-free; no React renderer is shipped.
import { resolvePreset, MODE_FRAMES, paintFrame } from 'thinking-orbs/engine';
import './atlas-orbs.css';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const desktop = matchMedia('(min-width: 921px)');
const instances = [];
let raf = 0;
let lastPaint = 0;
let paused = false;
try { paused = localStorage.getItem('atlas-orbs-paused') === 'true'; } catch { /* Storage is optional. */ }
const moving = () => !paused && !reduceMotion.matches;
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const orb = instances.find(item => item.canvas === entry.target);
    if (orb) orb.visible = entry.isIntersecting;
  }
  schedule();
});

function createOrb(parent, state, displaySize, { presetSize = 64, speed = 1, active = true } = {}) {
  if (!parent) return null;
  const canvas = document.createElement('canvas');
  canvas.className = 'atlas-orb';
  canvas.dataset.orbState = state;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.width = `${displaySize}px`;
  canvas.style.height = `${displaySize}px`;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(displaySize * dpr);
  canvas.height = Math.round(displaySize * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const orb = { canvas, ctx, presetSize, speed, visible: false, active, preset: resolvePreset(state, presetSize) };
  parent.append(canvas);
  instances.push(orb);
  observer.observe(canvas);
  draw(orb, 1.25);
  return orb;
}

function draw(orb, time) {
  const { ctx, canvas, preset, presetSize } = orb;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = canvas.width / presetSize;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  paintFrame(ctx, MODE_FRAMES[preset.mode](presetSize, time * preset.speed * orb.speed, preset.opts), true);
}

function schedule() {
  if (!raf && moving() && !document.hidden && instances.some(orb => orb.visible && orb.active)) {
    raf = requestAnimationFrame(tick);
  }
}
function tick(now) {
  raf = 0;
  if (!moving() || document.hidden) return;
  // Shared clock, capped at 30fps; offscreen and inactive ornaments do no work.
  if (now - lastPaint >= 1000 / 30) {
    for (const orb of instances) if (orb.visible && orb.active) draw(orb, now / 1000);
    lastPaint = now;
  }
  schedule();
}

const brand = document.querySelector('.ua-brand-mark');
if (createOrb(brand, 'breathing', 54, { speed: .65 })) brand.classList.add('orb-brand');
createOrb(document.querySelector('.ua-page-meta > a'), 'breathing', 20, { presetSize: 20, speed: .65 });

const atmosphere = document.createElement('div');
atmosphere.className = 'orb-atmosphere';
atmosphere.setAttribute('aria-hidden', 'true');
document.body.append(atmosphere);
const background = createOrb(atmosphere, 'connecting', 380, { speed: .3, active: desktop.matches });

const domainStates = ['composing', 'shaping', 'searching', 'listening', 'weaving', 'working'];
document.querySelectorAll('.rp-domain-grid > a').forEach((card, index) => {
  const orb = createOrb(card, domainStates[index % domainStates.length], 40, { active: false, speed: .75 });
  if (!orb) return;
  const activate = () => { orb.active = true; schedule(); };
  const deactivate = () => {
    orb.active = card.matches(':hover, :focus-within');
    if (!orb.active) draw(orb, 1.25);
  };
  card.addEventListener('pointerenter', activate);
  card.addEventListener('pointerleave', deactivate);
  card.addEventListener('focusin', activate);
  card.addEventListener('focusout', () => queueMicrotask(deactivate));
});

const pointer = document.createElement('div');
pointer.className = 'orb-pointer';
pointer.setAttribute('aria-hidden', 'true');
document.body.append(pointer);
const pointerOrb = createOrb(pointer, 'working', 24, { presetSize: 20, active: false });
let pointerTimeout;
function hidePointer() {
  pointer.classList.remove('is-visible');
  if (pointerOrb) pointerOrb.active = false;
  clearTimeout(pointerTimeout);
}
document.addEventListener('pointermove', event => {
  if (!pointerOrb || event.pointerType !== 'mouse' || !finePointer.matches || !moving()) return;
  // Keep the native cursor, selection caret and precise click target intact.
  if (event.target.closest('input, textarea, select, [contenteditable], dialog')) { hidePointer(); return; }
  pointer.style.transform = `translate3d(${Math.min(event.clientX + 16, innerWidth - 28)}px, ${Math.min(event.clientY + 16, innerHeight - 28)}px, 0)`;
  pointer.classList.add('is-visible');
  pointerOrb.active = true;
  clearTimeout(pointerTimeout);
  pointerTimeout = setTimeout(hidePointer, 900);
  schedule();
}, { passive: true });
document.documentElement.addEventListener('pointerleave', hidePointer);
window.addEventListener('blur', hidePointer);
document.addEventListener('keydown', hidePointer);

const turn = document.createElement('div');
turn.className = 'orb-turn';
turn.setAttribute('aria-hidden', 'true');
document.body.append(turn);
const turnOrb = createOrb(turn, 'shaping', 40, { active: false, speed: 1.2 });
let turnTimeout;
function hideTurn() {
  turn.classList.remove('is-visible');
  if (turnOrb) turnOrb.active = false;
  clearTimeout(turnTimeout);
}
function showTurn(duration) {
  if (!moving() || !turnOrb) return;
  turn.classList.add('is-visible');
  turnOrb.active = true;
  clearTimeout(turnTimeout);
  turnTimeout = setTimeout(hideTurn, duration);
  schedule();
}
// A nonblocking flourish: navigation is never intercepted or artificially delayed.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const url = new URL(link.href, location.href);
  if (url.origin === location.origin && url.pathname !== location.pathname && url.pathname.startsWith(import.meta.env.BASE_URL)) showTurn(1800);
});
window.addEventListener('pageshow', () => { hideTurn(); hidePointer(); schedule(); });
window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); raf = 0; hideTurn(); hidePointer(); });

const toggle = document.createElement('button');
toggle.type = 'button';
toggle.className = 'orb-motion-toggle';
toggle.setAttribute('aria-label', 'Pause decorative orb animations');
document.querySelector('.ua-page-meta')?.append(toggle);
function syncMotion() {
  cancelAnimationFrame(raf);
  raf = 0;
  document.body.classList.toggle('orb-motion-enabled', moving());
  toggle.textContent = moving() ? 'Motion on' : 'Motion off';
  toggle.setAttribute('aria-pressed', String(!moving()));
  toggle.disabled = reduceMotion.matches;
  toggle.title = reduceMotion.matches ? 'Your device prefers reduced motion' : 'Pause or resume decorative animations';
  if (background) background.active = desktop.matches;
  hidePointer();
  hideTurn();
  if (!moving()) for (const orb of instances) draw(orb, 1.25);
  schedule();
}
toggle.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem('atlas-orbs-paused', String(paused)); } catch { /* Keep session preference. */ }
  syncMotion();
});
reduceMotion.addEventListener('change', syncMotion);
finePointer.addEventListener('change', hidePointer);
desktop.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; hidePointer(); hideTurn(); }
  else schedule();
});
syncMotion();
showTurn(650);
