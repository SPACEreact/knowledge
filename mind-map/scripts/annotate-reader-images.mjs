import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const root = process.cwd();
const readerPath = join(root, 'visual-story.html');
const reader = await readFile(readerPath, 'utf8');
const dimensions = new Map();

function pngSize(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

function jpegSize(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (sofMarkers.has(marker)) return [buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5)];
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) return null;
    offset += length + 2;
  }
  return null;
}

const imageTags = [...reader.matchAll(/<img\b[^>]*\bsrc=["']book-images\/([^"']+)["'][^>]*>/gi)];
for (const match of imageTags) {
  const file = basename(match[1]);
  if (dimensions.has(file)) continue;
  const buffer = await readFile(join(root, 'book-images', file));
  const size = file.toLowerCase().endsWith('.png') ? pngSize(buffer) : jpegSize(buffer);
  if (!size) throw new Error(`Could not read image dimensions for ${file}`);
  dimensions.set(file, size);
}

let annotated = 0;
const output = reader.replace(/<img\b([^>]*\bsrc=["']book-images\/([^"']+)["'][^>]*)>/gi, (tag, attributes, file) => {
  if (/\bwidth=["']|\bheight=["']/.test(attributes)) return tag;
  const [width, height] = dimensions.get(basename(file));
  annotated += 1;
  const closing = /\/$/.test(attributes.trim()) ? '/>' : '>';
  const cleanAttributes = closing === '/>' ? attributes.replace(/\s*\/$/, '') : attributes;
  return `<img${cleanAttributes} width="${width}" height="${height}"${closing}`;
});

await writeFile(readerPath, output);
console.log(`Annotated ${annotated} reader images with intrinsic dimensions.`);
