import corpus from './corpus.generated.json';

/**
 * Retrieval for Fit Check.
 *
 * No vector database. Twenty-two entries is an array and a dot product, and
 * the vectors are committed so a request never waits on an embedding build.
 */

export type CorpusEntry = {
  id: string;
  type: string;
  title: string;
  tags: string[];
  years: number | null;
  body: string;
  vector: number[];
};

export type Retrieved = {
  id: string;
  title: string;
  type: string;
  body: string;
  score: number;
};

// Public-source review contradicted these legacy body/vector pairs. Exclude
// them until owner review and an intentional embedding rebuild; see the audit.
export const withheldCorpusIds = [
  'project-java-rag', 'project-chroma-loop', 'project-anon-dapp',
  'project-aura-landing', 'project-pdf-editor', 'project-blockchain-storage',
  'retrieval-rag', 'webgl-graphics', 'gaps-known', 'education',
] as const;
const withheld = new Set<string>(withheldCorpusIds);
const entries = (corpus.entries as CorpusEntry[]).filter((entry) => !withheld.has(entry.id));

export const EMBEDDING_MODEL = corpus.model;
export const TOP_K = 6;

/**
 * Calibrated against this embedding model rather than taken from the brief.
 *
 * PHASE_2_BRIEF suggests a floor of roughly 0.25. Gemini embeddings sit on a
 * high similarity baseline, so measured against this corpus every query scores
 * above 0.49 and a 0.25 floor rejects nothing at all. Measured tops were:
 * genuine role queries 0.67 to 0.78, unrelated queries ("equine veterinary
 * surgeon", "sourdough starter") 0.53. 0.60 separates them cleanly.
 *
 * Note this deliberately still admits poor-fit roles: a Kubernetes platform
 * role scores 0.672 and must be answered with an honest "no", not refused.
 */
export const RELEVANCE_FLOOR = 0.6;

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function retrieve(queryVector: number[]): Retrieved[] {
  return entries
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      type: entry.type,
      body: entry.body,
      score: cosine(queryVector, entry.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .filter((entry) => entry.score >= RELEVANCE_FLOOR)
    .slice(0, TOP_K);
}

export const corpusSize = entries.length;
