import fs from 'node:fs/promises';
import path from 'node:path';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function scoreFromHeuristics(fact, rand) {
  const title = String(fact.title ?? '');
  const content = String(fact.content ?? '');
  const tags = Array.isArray(fact.tags) ? fact.tags.map(String) : [];
  const importance = fact?.metadata?.importance;

  const hay = `${title}\n${content}`.toLowerCase();

  // Hard rules
  if (hay.includes('epstein') && (hay.includes('suicide') || hay.includes('mort') || hay.includes('décès') || hay.includes('death'))) {
    return 100;
  }

  const distancingRe = /(se\s+distanc|distance\s+itself|distanc(e|ing)|den(y|ies)|déclare|communiqué|statement)/i;
  const publicFigureRe = /(trump|clinton|président|president|maison blanche|white house)/i;
  if (distancingRe.test(hay) && publicFigureRe.test(hay)) {
    // Target ~20
    return clamp(18 + Math.round(rand() * 6), 0, 100);
  }

  // Base from importance
  let base;
  if (importance === 'high') base = 70;
  else if (importance === 'medium') base = 45;
  else base = 25;

  // Tag nudges
  if (tags.some(t => t.includes('category:justice'))) base += 8;
  if (tags.some(t => t.includes('category:politics'))) base += 6;
  if (tags.some(t => t.includes('category:crime'))) base += 10;
  if (tags.some(t => t.includes('coverage:delayed'))) base += 4;
  if (tags.some(t => t.includes('coverage:major'))) base += 8;
  if (tags.some(t => t.includes('source:leak'))) base += 5;

  // Keyword nudges
  if (/(arrest|inculp|indict|trial|procès|condamn|sentenc)/i.test(hay)) base += 12;
  if (/(fbi|justice department|doj|cour suprême|supreme court)/i.test(hay)) base += 8;
  if (/(victim|mineur|minor|traffick|traite|sexuel|sexual)/i.test(hay)) base += 10;
  if (/(investigation|enquête|reveal|révèl|expos)/i.test(hay)) base += 6;
  if (/(résignation|resign|scandal|scandale)/i.test(hay)) base += 6;

  // Keep PR/statement-type events low (unless they are the hard rule above)
  if (/(statement|communiqué|déclaration|annonce)/i.test(hay)) base -= 10;

  // Randomize a bit
  const jitter = Math.round((rand() - 0.5) * 12); // [-6, +6]
  const score = clamp(base + jitter, 0, 100);

  // Prevent everything being too high
  return clamp(Math.round(score * 0.88), 0, 100);
}

async function listJsonFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      out.push(...(await listJsonFiles(p)));
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.json')) {
      out.push(p);
    }
  }
  return out;
}

function parseArgs(argv) {
  const args = new Set(argv);
  const getValue = (name) => {
    const idx = argv.indexOf(name);
    if (idx === -1) return undefined;
    const v = argv[idx + 1];
    if (!v || v.startsWith('--')) return undefined;
    return v;
  };

  return {
    force: args.has('--force'),
    dryRun: args.has('--dry-run'),
    seed: getValue('--seed'),
    factsDir: getValue('--facts-dir') ?? path.join(process.cwd(), 'facts'),
  };
}

async function main() {
  const { force, dryRun, seed, factsDir } = parseArgs(process.argv.slice(2));
  const seedNum = seed ? Number(seed) : undefined;
  const globalRand = mulberry32(Number.isFinite(seedNum) ? seedNum : hashStringToSeed('immersive-knowledge'));

  const files = await listJsonFiles(factsDir);
  let changed = 0;

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }

    if (!json || typeof json !== 'object') continue;
    if (!force && typeof json.relevanceScore === 'number') continue;

    const perFileRand = mulberry32(hashStringToSeed(file) ^ Math.floor(globalRand() * 0xffffffff));
    const nextScore = scoreFromHeuristics(json, perFileRand);

    if (json.relevanceScore !== nextScore) {
      json.relevanceScore = nextScore;
      changed++;

      if (!dryRun) {
        await fs.writeFile(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
      }
    }
  }

  const suffix = dryRun ? ' (dry-run)' : '';
  console.log(`Updated relevanceScore in ${changed} file(s)${suffix}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
