import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../unified-shell.css', import.meta.url), 'utf8');
const palette = {
  canvas: '#171114',
  raised: '#21171c',
  reading: '#291d22',
  text: '#f2e6cf',
  secondary: '#d5c3ab',
  quiet: '#b8a58f',
  borderStrong: '#a07560',
  terracotta: '#d17a5b',
  copper: '#c48a5a',
  saffron: '#dda34c',
  peacock: '#6ba998',
  mineralBlue: '#7f9fc9',
  madder: '#cf707a',
  focus: '#efb55c',
};

// Read the real design tokens, rather than trusting a second copied palette.
const tokenNames = {
  canvas: 'canvas', raised: 'raised', reading: 'reading', soft: 'reading-soft',
  companion: 'companion', text: 'text', secondary: 'text-secondary', quiet: 'text-quiet',
  borderStrong: 'border-strong', terracotta: 'terracotta', copper: 'copper',
  saffron: 'saffron', peacock: 'peacock', mineralBlue: 'mineral-blue', madder: 'madder', focus: 'focus',
};
for (const [name, token] of Object.entries(tokenNames)) {
  const match = css.match(new RegExp(`--ua-${token}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Missing semantic colour token: --ua-${token}`);
  palette[name] = match[1];
}

const checks = [
  ['primary text / canvas', 'text', 'canvas', 4.5],
  ['secondary text / canvas', 'secondary', 'canvas', 4.5],
  ['quiet text / canvas', 'quiet', 'canvas', 4.5],
  ['primary text / reading', 'text', 'reading', 4.5],
  ['secondary text / reading', 'secondary', 'reading', 4.5],
  ['quiet text / reading', 'quiet', 'reading', 4.5],
  ['terracotta / reading', 'terracotta', 'reading', 4.5],
  ['copper / reading', 'copper', 'reading', 4.5],
  ['saffron / reading', 'saffron', 'reading', 4.5],
  ['peacock / reading', 'peacock', 'reading', 4.5],
  ['mineral blue / reading', 'mineralBlue', 'reading', 4.5],
  ['madder / reading', 'madder', 'reading', 4.5],
  ['focus / canvas', 'focus', 'canvas', 3],
  ['strong boundary / canvas', 'borderStrong', 'canvas', 3],
  ['strong boundary / reading', 'borderStrong', 'reading', 3],
];

for (const surface of ['raised', 'soft', 'companion']) {
  for (const text of ['text', 'secondary', 'quiet', 'terracotta', 'copper', 'saffron', 'peacock', 'mineralBlue', 'madder']) {
    checks.push([`${text} / ${surface}`, text, surface, 4.5]);
  }
  checks.push([`strong boundary / ${surface}`, 'borderStrong', surface, 3]);
}
checks.push(['inverse label / saffron', 'canvas', 'saffron', 4.5]);

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.03928
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

let failed = false;
for (const [label, foreground, background, minimum] of checks) {
  const result = contrast(palette[foreground], palette[background]);
  const passes = result >= minimum;
  failed ||= !passes;
  console.log(`${passes ? 'PASS' : 'FAIL'}  ${result.toFixed(2)}:1  ${label} (minimum ${minimum}:1)`);
}

if (failed) process.exitCode = 1;
