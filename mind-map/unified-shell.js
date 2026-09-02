import './unified-shell.css';
import './global-lang.js';

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

document.body.classList.add('unified-atlas');

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
      <span class="ua-arch" aria-hidden="true"><i></i></span>
      <span><strong>दृष्टि</strong><small>Visual Storytelling</small></span>
    </a>
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
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setOpen(false);
});

