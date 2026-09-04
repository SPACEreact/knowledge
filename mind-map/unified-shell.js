import './unified-shell.css';
import './handcrafted-pages.css';
import './global-lang.js';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const dividerAsset = new URL('./assets/craft/manuscript-divider.webp', import.meta.url).href;

const groups = [
  ['Begin', [
    ['index.html', 'Overview'],
    ['visual-literacy.html', 'Visual Literacy'],
    ['start-here.html', 'Start Here'],
  ]],
  ['Core', [
    ['storytelling.html', 'Storytelling'],
    ['design.html', 'Design'],
    ['cinematography.html', 'Cinematography'],
    ['sound.html', 'Sound'],
    ['editing.html', 'Editing'],
    ['motion.html', 'Motion'],
  ]],
  ['Systems', [
    ['ai-visual.html', 'AI Visual'],
    ['emotion-grammar.html', 'Emotion Grammar'],
    ['scene-grammar.html', 'Scene Grammar'],
    ['story-emotion.html', 'Story × Emotion'],
    ['human-layers.html', 'Human Layers'],
  ]],
  ['Reference', [
    ['skill-tree.html', 'Skill Tree'],
    ['style-reference.html', 'Style Reference'],
    ['craft-notes.html', 'Craft Notes'],
    ['resources.html', 'Resources'],
    ['book.html', 'Knowledge Book'],
  ]],
];

const current = location.pathname.split('/').pop() || 'index.html';
const links = groups.map(([label, items]) => `
  <div class="ua-group">
    <p>${label}</p>
    ${items.map(([href, text]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${text}</a>`).join('')}
  </div>`).join('');

document.documentElement.classList.remove('dark');
document.documentElement.classList.add('ua-light');
document.body.classList.add('unified-atlas');
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f3e6cc');

document.querySelectorAll('body > .sidebar, body > .site-rail, body > .menu-btn, body > .sidebar-overlay, body > .atlas-topbar, body > .app-shell > .site-rail').forEach((node) => {
  node.setAttribute('data-legacy-shell', '');
});

const main = document.querySelector('main') || document.querySelector('.main-content') || document.body.firstElementChild;
if (main) main.classList.add('ua-main');

const shell = document.createElement('div');
shell.innerHTML = `
  <button class="ua-menu" type="button" aria-expanded="false" aria-controls="ua-rail">
    <span></span><span></span><span></span><b>Menu</b>
  </button>
  <div class="ua-scrim" aria-hidden="true"></div>
  <aside class="ua-rail" id="ua-rail" aria-label="Knowledge atlas navigation">
    <a class="ua-brand" href="index.html" aria-label="Visual Storytelling home">
      <span class="ua-brand-mark" aria-hidden="true"><img src="${dividerAsset}" alt="" width="1800" height="600"></span>
      <span><strong>दृष्टि</strong><small>Visual Storytelling</small></span>
    </a>
    <img class="ua-brand-divider" src="${dividerAsset}" alt="" width="1800" height="600" aria-hidden="true">
    <nav class="ua-nav">${links}</nav>
    <a class="ua-sibling" href="https://spacereact.github.io/atlas-of-looks/">
      <span><small>Companion collection</small>Atlas of Looks</span><b>↗</b>
    </a>
  </aside>`;

document.body.prepend(...shell.children);

const button = document.querySelector('.ua-menu');
const scrim = document.querySelector('.ua-scrim');
const setOpen = (open) => {
  document.body.classList.toggle('ua-open', open);
  button?.setAttribute('aria-expanded', String(open));
};
button?.addEventListener('click', () => setOpen(!document.body.classList.contains('ua-open')));
scrim?.addEventListener('click', () => setOpen(false));
document.querySelectorAll('.ua-rail a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setOpen(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) setOpen(false);
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const precisePointer = window.matchMedia('(pointer: fine)');
const revealTargets = main
  ? Array.from(main.children).filter((node) => node.matches('header, section, nav'))
  : [];

if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  revealTargets.forEach((node) => node.classList.add('ua-reveal'));
  document.body.classList.add('ua-motion-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('ua-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });
  revealTargets.forEach((node, index) => {
    if (index === 0) node.classList.add('ua-visible');
    observer.observe(node);
  });
}

if (!reduceMotion.matches && precisePointer.matches && window.innerWidth > 760) {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: .86,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('[data-ua-parallax]').forEach((layer) => {
    const travel = Math.min(46, Math.max(10, Number.parseFloat(layer.dataset.uaParallax || '.03') * 1000));
    gsap.fromTo(layer,
      { y: -travel },
      {
        y: travel,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.parentElement || layer,
          start: 'top bottom',
          end: 'bottom top',
          scrub: .7,
          invalidateOnRefresh: true,
        },
      });
  });
}
