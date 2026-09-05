import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');

const pages = [
  'index.html',
  'visual-literacy.html',
  'start-here.html',
  'storytelling.html',
  'design.html',
  'cinematography.html',
  'sound.html',
  'editing.html',
  'motion.html',
  'ai-visual.html',
  'ideation.html',
  'emotion-grammar.html',
  'scene-grammar.html',
  'story-emotion.html',
  'human-layers.html',
  'human-layers-enhanced.html',
  'audience-participation.html',
  'skill-tree.html',
  'style-reference.html',
  'craft-notes.html',
  'resources.html',
  'filmmaking-keywords.html',
  'editing-rhythm.html',
  'mograph-keywords.html',
  'playgrounds.html',
  'visual-story.html',
  'book.html',
];

const failures = [];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function localTarget(page, raw) {
  if (!raw || /^(?:#|[a-z]+:|\/\/)/i.test(raw)) return null;
  const clean = raw.split('#')[0].split('?')[0];
  if (!clean) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    decoded = clean;
  }

  const siteRelative = decoded.replace(/^\/knowledge\//, '');
  if (siteRelative.startsWith('/')) return null;
  const target = normalize(join(dirname(page), siteRelative));
  return target.endsWith('/') ? join(target, 'index.html') : target;
}

for (const page of pages) {
  const outputPath = join(dist, page);
  if (!(await exists(outputPath))) {
    failures.push(`${page}: missing from production build`);
    continue;
  }

  const html = await readFile(outputPath, 'utf8');
  if (!/unified-shell-[^"']+\.js/.test(html)) {
    failures.push(`${page}: shared atlas shell was not injected`);
  }
  if (!html.includes('id="ua-rail"') || !html.includes('class="ua-page-meta"')) {
    failures.push(`${page}: navigation and folio line must be present before JavaScript runs`);
  }
  if ((html.match(/aria-current="page"/g) || []).length !== 1) {
    failures.push(`${page}: expected exactly one current-page marker`);
  }
  if (!/class="[^"]*unified-atlas/.test(html) || !/data-theme="dark"/.test(html)) {
    failures.push(`${page}: the initial document must render in the dark theme`);
  }

  const references = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const reference of references) {
    const target = localTarget(page, reference);
    if (!target || (!extname(target) && !target.endsWith('index.html'))) continue;
    if (!(await exists(join(dist, target)))) failures.push(`${page}: broken local reference → ${reference}`);
  }
}

const studies = await readFile(join(dist, 'playgrounds.html'), 'utf8');
const studySections = (studies.match(/class="study-plate"/g) || []).length;
const studyFigures = (studies.match(/<figure\b/g) || []).length;
if (studySections !== 8 || studyFigures !== 8) {
  failures.push(`playgrounds.html: expected 8 static studies, found ${studySections} sections and ${studyFigures} figures`);
}
if (/WebGPU|AI Tutor|lightingPlayground|<canvas\b/i.test(studies)) {
  failures.push('playgrounds.html: interactive educational runtime leaked into the static studies page');
}

const aiVisual = await readFile(join(dist, 'ai-visual.html'), 'utf8');
const filmmaking = await readFile(join(dist, 'filmmaking-keywords.html'), 'utf8');
if (/class=["']reveal-btn\b|onclick=["'][^"']*classList\.toggle\(['"]open/i.test(aiVisual)) {
  failures.push('ai-visual.html: a reveal-based educational exercise remains interactive');
}
if (/<button\b[^>]*class=["'][^"']*\brb\b/i.test(filmmaking)) {
  failures.push('filmmaking-keywords.html: a reveal-based educational exercise remains interactive');
}

const reader = await readFile(join(root, 'visual-story.html'), 'utf8');
const readerImages = [...reader.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
const deferredImages = readerImages.filter((tag) => /loading="lazy"/.test(tag)).length;
const priorityImages = readerImages.filter((tag) => /loading="eager"/.test(tag)).length;
const sizedImages = readerImages.filter((tag) => /width="\d+"/.test(tag) && /height="\d+"/.test(tag)).length;
if (readerImages.length !== 769 || deferredImages !== 768 || priorityImages !== 1) {
  failures.push(`visual-story.html: image loading policy mismatch (${readerImages.length} total, ${deferredImages} lazy, ${priorityImages} priority)`);
}
if (sizedImages !== readerImages.length) {
  failures.push(`visual-story.html: ${readerImages.length - sizedImages} images lack intrinsic dimensions`);
}

if (failures.length) {
  console.error(`Site audit failed with ${failures.length} issue${failures.length === 1 ? '' : 's'}:`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`PASS  ${pages.length} production routes use the shared atlas shell`);
console.log('PASS  navigation, current page and dark theme are in the initial HTML');
console.log('PASS  all built local links and assets resolve');
console.log('PASS  8 educational concepts render as static visual studies');
console.log('PASS  worked studies remain fully visible without interactive reveals');
console.log('PASS  768 non-critical reader images are deferred with stable aspect ratios');
