// Builds dist/: a publishable copy of the game for hosts that wrap the page
// in their own document skeleton and may not honour import maps.
//   node tools/build-artifact.mjs
// - index.html: the page content without doctype/html/head/body wrappers and
//   without the import map
// - src/**: modules with `from 'three'` rewritten to the pinned CDN build,
//   byte-identical to vendor/ (hosts that allow only CDN libraries)

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js';
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });

const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.js')) files.push(p);
  }
}
walk(join(root, 'src'));

let rewritten = 0;
for (const f of files) {
  const rel = relative(root, f);
  const out = join(dist, rel);
  mkdirSync(dirname(out), { recursive: true });
  let src = readFileSync(f, 'utf8');
  src = src.replace(/from\s+'three'/g, () => { rewritten++; return `from '${THREE_URL}'`; });
  if (/from\s+["']three["']/.test(src)) throw new Error(`unrewritten three import in ${rel}`);
  writeFileSync(out, src);
}

let page = readFileSync(join(root, 'index.html'), 'utf8');
page = page
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<html[^>]*>\s*/i, '')
  .replace(/<\/html>\s*/i, '')
  .replace(/<head>\s*/i, '')
  .replace(/<\/head>\s*/i, '')
  .replace(/<body>\s*/i, '')
  .replace(/<\/body>\s*/i, '')
  .replace(/<meta charset="utf-8">\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/i, '');
for (const tag of ['<html', '<head', '<body', 'importmap']) if (page.includes(tag)) throw new Error(`page still contains ${tag}`);
if (!page.trimStart().startsWith('<title>')) throw new Error('page must open with its <title>');
writeFileSync(join(dist, 'index.html'), page);

const published = files.map((f) => relative(root, f).split(sep).join('/'));
writeFileSync(join(dist, 'files.json'), JSON.stringify(published, null, 1));
console.log(`dist: ${files.length} modules (${rewritten} three imports rewritten), ${published.length} files + index.html`);
