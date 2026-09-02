const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  root.style.setProperty('--read-progress', clamp(progress, 0, 1));
  root.style.setProperty('--scroll-y', window.scrollY);

  if (!reducedMotion) {
    document.querySelectorAll('[data-parallax]').forEach((element) => {
      const depth = Number(element.dataset.parallax || 0.04);
      const rect = element.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * depth;
      element.style.transform = 'translate3d(0,' + (-offset).toFixed(2) + 'px,0)';
    });
  }
}

let scrollFrame;
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    updateScrollState();
    scrollFrame = null;
  });
}, { passive: true });

window.addEventListener('pointermove', (event) => {
  const x = event.clientX / window.innerWidth - .5;
  const y = event.clientY / window.innerHeight - .5;
  root.style.setProperty('--pointer-x', x.toFixed(3));
  root.style.setProperty('--pointer-y', y.toFixed(3));

  const stage = event.target.closest('.perception-stage');
  if (stage) {
    const rect = stage.getBoundingClientRect();
    stage.style.setProperty('--stage-x', ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
    stage.style.setProperty('--stage-y', ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
  }
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('[data-reveal-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.revealTarget);
    if (!target) return;
    const revealed = target.classList.toggle('is-revealed');
    button.textContent = revealed ? 'Hide the answer' : 'Reveal the eye path';
    button.setAttribute('aria-pressed', String(revealed));
  });
});

document.querySelectorAll('[data-isolate-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.isolateTarget);
    if (!target) return;
    const isolated = target.classList.toggle('is-isolated');
    button.textContent = isolated ? 'Restore context' : 'Remove the context';
    button.setAttribute('aria-pressed', String(isolated));
  });
});

const negativeRange = document.querySelector('[data-negative-range]');
const negativeDemo = document.querySelector('[data-negative-demo]');
const negativeLabel = document.querySelector('[data-negative-label]');

if (negativeRange && negativeDemo) {
  const updateNegativeSpace = () => {
    const value = Number(negativeRange.value);
    negativeDemo.style.setProperty('--figure-x', value + '%');
    if (negativeLabel) {
      const distance = Math.abs(value - 50);
      negativeLabel.textContent = distance > 25 ? 'edge tension' : distance > 10 ? 'asymmetric' : 'balanced';
    }
  };
  negativeRange.addEventListener('input', updateNegativeSpace);
  updateNegativeSpace();
}

const navToggle = document.querySelector('[data-nav-toggle]');
const rail = document.querySelector('.site-rail');
if (navToggle && rail) {
  navToggle.addEventListener('click', () => {
    const open = rail.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      rail.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const dayExercises = [
  'Rank five frames by visual tension, fastest first.',
  'Guess the focal length used in a still.',
  'Reduce a frame to three dominant values.',
  'Re-block a two-person scene to reverse who holds power.',
  'Build three compositions from the same objects.',
  'Match a painting’s colour relationships in a new image.',
  'Predict where the eye will land, then check.',
  'Remove one element and predict how hierarchy shifts.',
  'Recreate a studied image from memory alone.',
  'Turn a romantic frame threatening without changing the actors.'
];

const dailyExercise = document.querySelector('[data-daily-exercise]');
if (dailyExercise) {
  const now = new Date();
  const day = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
  dailyExercise.textContent = dayExercises[day % dayExercises.length];
}

updateScrollState();
