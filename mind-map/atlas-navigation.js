// Shared by Vite's HTML renderer and the small client-side controller.
export const groups = [
  {
    key: 'begin',
    label: 'Begin',
    items: [
      ['index.html', 'Overview'],
      ['visual-literacy.html', 'Visual Literacy'],
      ['start-here.html', 'Start Here'],
    ],
  },
  {
    key: 'craft',
    label: 'Core craft',
    items: [
      ['storytelling.html', 'Storytelling'],
      ['design.html', 'Design'],
      ['cinematography.html', 'Cinematography'],
      ['sound.html', 'Sound'],
      ['editing.html', 'Editing'],
      ['motion.html', 'Motion'],
    ],
  },
  {
    key: 'systems',
    label: 'Systems',
    items: [
      ['ai-visual.html', 'AI Visual'],
      ['ideation.html', 'Ideation Engine'],
      ['emotion-grammar.html', 'Emotion Grammar'],
      ['scene-grammar.html', 'Scene Grammar'],
      ['story-emotion.html', 'Story × Emotion'],
      ['human-layers.html', 'Human Layers'],
      ['human-layers-enhanced.html', 'Human Layers — Expanded'],
      ['audience-participation.html', 'Audience as Presence'],
    ],
  },
  {
    key: 'reference',
    label: 'Reference',
    items: [
      ['skill-tree.html', 'Skill Tree'],
      ['style-reference.html', 'Style Reference'],
      ['craft-notes.html', 'Craft Notes'],
      ['resources.html', 'Resources'],
      ['filmmaking-keywords.html', 'Filmmaking Terms'],
      ['editing-rhythm.html', 'Editing Rhythm'],
      ['mograph-keywords.html', 'Motion Graphics'],
      ['playgrounds.html', 'Visual Studies'],
      ['visual-story.html', 'Visual Story Reader'],
      ['book.html', 'Knowledge Book'],
    ],
  },
];


export const orderedItems = groups.flatMap((group) => group.items);

export function routeInfo(current) {
  const activeGroup = groups.find((group) => group.items.some(([href]) => href === current));
  const activeItem = activeGroup?.items.find(([href]) => href === current);
  return {
    activeGroup,
    categoryLabel: activeGroup?.label || 'Reference',
    pageLabel: activeItem?.[1] || 'Knowledge Book',
  };
}

export function renderAtlasShell(current, mainId) {
  const { activeGroup, categoryLabel, pageLabel } = routeInfo(current);
  const assets = {
    divider: 'assets/craft/manuscript-divider.webp',
    border: 'assets/decor/manuscript-border.webp',
  };
  const links = groups.map((group, groupIndex) => {
  const isActive = group.key === activeGroup?.key;
  return `
    <section class="ua-group"${isActive ? ' data-active-group' : ''} aria-labelledby="ua-group-${group.key}">
      <h2 id="ua-group-${group.key}"><span>0${groupIndex + 1}</span>${group.label}</h2>
      ${group.items.map(([href, text]) => `
        <a href="${href}"${href === current ? ' aria-current="page"' : ''}>
          <span>${text}</span><i aria-hidden="true">↗</i>
        </a>`).join('')}
    </section>`;
}).join('');


  return `
  <a class="ua-skip" href="#${mainId}">Skip to main content</a>
  <header class="ua-mobile-bar">
    <button class="ua-menu" type="button" aria-expanded="false" aria-controls="ua-rail" aria-label="Open atlas navigation">
      <span aria-hidden="true"><i></i><i></i><i></i></span>
      <b>${pageLabel}</b>
      <small>${categoryLabel}</small>
    </button>
    <a href="https://spacereact.github.io/atlas-of-looks/" aria-label="Open Atlas of Looks">Atlas ↗</a>
  </header>
  <div class="ua-scrim" aria-hidden="true"></div>
  <aside class="ua-rail" id="ua-rail" aria-label="Knowledge atlas navigation">
    <div class="ua-rail-head">
      <span class="ua-volume">Volume I · Knowledge</span>\n      <button class="ua-close" type="button" aria-label="Close atlas navigation">×</button>
      <a class="ua-brand" href="index.html" aria-label="Visual Storytelling home">
        <span class="ua-brand-mark" aria-hidden="true"><img src="${assets.divider}" alt="" width="1800" height="600"></span>
        <span><strong lang="hi">दृष्टि</strong><small>Visual Storytelling</small></span>
      </a>
      <img class="ua-brand-divider" src="${assets.divider}" alt="" width="1800" height="600" aria-hidden="true">
    </div>
    <nav class="ua-nav" aria-label="Atlas sections">${links}</nav>
    <div class="ua-rail-foot">
      <div class="ua-language-slot" aria-label="Language"></div>
      <a class="ua-sibling" href="https://spacereact.github.io/atlas-of-looks/">
        <span><small>Volume II · History</small>Atlas of Looks</span><b aria-hidden="true">↗</b>
      </a>
    </div>
  </aside>
  <div class="ua-atmosphere" aria-hidden="true">
    <img src="${assets.border}" alt="" width="1600" height="533" >
  </div>`;
}

