// Sanity checks: the bundle parses, and the tea data is internally consistent.
// Run after a build: `npm run check`.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

// 1. The bundled script parses.
const page = await readFile(join(root, 'dist/index.html'), 'utf8');
const script = page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));
try { new vm.Script(script); } catch (e) { problems.push(`Bundle does not parse: ${e.message}`); }

// 2. Tea data.
const data = await readFile(join(root, 'src/js/data/tea-data.js'), 'utf8');
const { FAMS, FAM, LIB, LOCS, BRANDS, STY, VT, LIQM } = vm.runInNewContext(`${data}\n;({FAMS,FAM,LIB,LOCS,BRANDS,STY,VT,LIQM})`);
const styles = new Set(STY.map((s) => s[0]));
const checkMethod = (where, style, m) => {
  if (!styles.has(style)) problems.push(`${where}: unknown method "${style}"`);
  for (const k of ['t', 'g', 'ml', 'sched']) if (m[k] == null) problems.push(`${where} ${style}: missing ${k}`);
  if (m.t && m.t[0] > m.t[1]) problems.push(`${where} ${style}: temperature range is reversed`);
  if (m.g && m.g[0] > m.g[1]) problems.push(`${where} ${style}: leaf range is reversed`);
  for (const v of m.vessels || []) if (!VT[v]) problems.push(`${where} ${style}: unknown vessel "${v}"`);
};
for (const f of FAMS) {
  for (const [k, m] of Object.entries(f.methods)) checkMethod(f.name, k, m);
  for (const l of f.liqs) if (!LIQM[l]) problems.push(`${f.name}: unknown liquor colour "${l}"`);
}
const names = new Set();
for (const t of LIB) {
  if (names.has(t.name)) problems.push(`Duplicate tea type "${t.name}"`);
  names.add(t.name);
  if (!FAM[t.fam]) problems.push(`${t.name}: unknown family "${t.fam}"`);
  if (t.origin && !LOCS.includes(t.origin)) problems.push(`${t.name}: origin not in the place directory`);
  for (const [k, m] of Object.entries(t.x.add || {})) checkMethod(t.name, k, m);
  for (const l of t.x.liqs || []) if (!LIQM[l]) problems.push(`${t.name}: unknown liquor colour "${l}"`);
  const fam = FAM[t.fam];
  if (fam) {
    let ms = Object.keys(fam.methods);
    if (t.x.only) ms = ms.filter((k) => t.x.only.includes(k));
    ms = ms.concat(Object.keys(t.x.add || {}));
    if (!ms.length) problems.push(`${t.name}: no brewing methods left`);
  }
}
const lower = BRANDS.map((b) => b.toLowerCase());
lower.forEach((b, i) => { if (lower.indexOf(b) !== i) problems.push(`Duplicate brand "${BRANDS[i]}"`); });

if (problems.length) {
  console.error(`${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK: bundle parses; ${FAMS.length} families, ${LIB.length} tea types, ${LOCS.length} places, ${BRANDS.length} brands.`);
