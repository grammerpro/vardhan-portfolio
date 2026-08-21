/**
 * Embeds the corpus once and writes the vectors to disk.
 *
 *   node scripts/build-corpus.mjs
 *
 * Run this after editing anything in content/corpus. The output is committed
 * so that a deploy never needs to call the embedding API, and so the retrieval
 * side has no network dependency at request time.
 *
 * There is no vector database here on purpose. Twenty-two entries is an array
 * and a dot product.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const CORPUS_DIR = resolve(here, '../content/corpus');
const OUT = resolve(here, '../src/lib/corpus.generated.json');
const MODEL = 'gemini-embedding-001';

// Read the key the same way Next does, without pulling in a dependency.
function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const env = readFileSync(resolve(here, '../.env.local'), 'utf8');
    const line = env.split('\n').find((l) => l.startsWith('GEMINI_API_KEY='));
    return line ? line.slice('GEMINI_API_KEY='.length).trim() : null;
  } catch {
    return null;
  }
}

/** Minimal front matter parser. The format is ours and deliberately simple. */
function parseEntry(raw, filename) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing front matter`);

  const [, head, body] = match;
  const meta = {};

  for (const line of head.split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    if (value.startsWith('[')) {
      meta[key] = value.slice(1, -1).split(',').map((v) => v.trim()).filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      meta[key] = value === 'true';
    } else if (/^\d+$/.test(value)) {
      meta[key] = Number(value);
    } else {
      meta[key] = value;
    }
  }

  return { ...meta, body: body.trim() };
}

async function embed(key, text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${MODEL}`,
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`embed failed ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const json = await response.json();
  return json.embedding.values;
}

const key = loadKey();
if (!key) {
  console.error('GEMINI_API_KEY not found. Set it in .env.local.');
  process.exit(1);
}

const files = readdirSync(CORPUS_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md');
const entries = [];
let skipped = 0;

for (const file of files) {
  const entry = parseEntry(readFileSync(join(CORPUS_DIR, file), 'utf8'), file);

  // Unverified entries are excluded from retrieval entirely, not caveated in
  // the output. A draft simply does not exist as far as the feature knows.
  if (entry.verified !== true) {
    skipped += 1;
    continue;
  }

  // Title and tags are embedded alongside the body: a job description says
  // "AEM" far more often than it describes what AEM work involves.
  const text = `${entry.title}. ${(entry.tags || []).join(' ')}. ${entry.body}`;
  const vector = await embed(key, text);

  entries.push({
    id: entry.id,
    type: entry.type,
    title: entry.title,
    tags: entry.tags || [],
    years: entry.years ?? null,
    body: entry.body,
    vector,
  });

  console.log(`  embedded ${entry.id} (${vector.length}d)`);
}

writeFileSync(OUT, JSON.stringify({ model: MODEL, entries }, null, 0));
console.log(`\ncorpus: ${entries.length} entries embedded, ${skipped} unverified and excluded`);
console.log(`written to ${OUT}`);
