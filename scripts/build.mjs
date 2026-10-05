// Bundles index.html and everything it links in src/ into single-file pages:
//   dist/index.html     a standalone page you can open or host anywhere
//   dist/artifact.html  the same page in Claude artifact format (no doctype/head; the viewer adds them)
// No dependencies: run with `node scripts/build.mjs`.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(root, p), 'utf8');

const index = await read('index.html');

const css = [];
for (const [, href] of index.matchAll(/<link rel="stylesheet" href="(src\/[^"]+)">/g)) css.push(await read(href));
const js = [];
for (const [, src] of index.matchAll(/<script src="(src\/[^"]+)"><\/script>/g)) js.push(`/* ${src} */\n` + (await read(src)));
if (!css.length || !js.length) throw new Error('No local stylesheet or scripts found in index.html');

const style = `<style>\n${css.join('\n')}</style>`;
const script = `<script>\n${js.join('\n')}</script>`;
const fonts = [...index.matchAll(/<link rel="(?:preconnect|stylesheet)" href="https:[^>]+>/g)].map((m) => m[0]).join('\n');
const title = index.match(/<title>.*?<\/title>/)[0];
const body = index.slice(index.indexOf('<body>') + 6, index.indexOf('<script src=')).trim();

const standalone = index
  .replace(/<link rel="stylesheet" href="src\/[^"]+">/g, '')
  .replace(/<script src="src\/[^"]+"><\/script>\n?/g, '')
  .replace('</head>', () => `${style}\n</head>`) // function replacers: the code contains "$" patterns
  .replace('</body>', () => `${script}\n</body>`);

const artifact = `${title}\n${fonts}\n${style}\n${body}\n${script}\n`;

await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/index.html'), standalone);
await writeFile(join(root, 'dist/artifact.html'), artifact);
console.log(`Built dist/index.html and dist/artifact.html from ${css.length} stylesheet and ${js.length} scripts.`);
