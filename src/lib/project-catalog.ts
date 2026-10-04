import type { PortfolioProject } from '@/content/portfolio';

export type WorkListItem = {
  id: string;
  title: string;
  summary: string;
  status: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  caseStudyUrl?: string;
  sourceUrl?: string;
  websiteUrl?: string;
  audited: boolean;
};

const normalizedTitle = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export function publicLink(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 2048) return undefined;
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

const normalizedRepository = (url: string) => url.replace(/\/$/, '').replace(/\.git$/, '').toLowerCase();

export function auditedWork(projects: PortfolioProject[]): WorkListItem[] {
  return projects.map((project) => ({
    id: project.slug,
    title: project.title,
    summary: project.summary,
    status: project.status,
    tags: project.tags,
    image: project.image,
    imageAlt: project.imageAlt,
    caseStudyUrl: `/work/${project.slug}`,
    sourceUrl: project.sourceUrl,
    audited: true,
  }));
}

/** CMS text is owner-maintained, not source-verified. Never override the audit. */
export function additionalCatalogWork(value: unknown, projects: PortfolioProject[]): WorkListItem[] {
  if (!Array.isArray(value)) return [];
  const knownTitles = new Set([
    ...projects.map((project) => normalizedTitle(project.title)),
    'javanativeragsystem', 'javarag', 'javaragsystem', 'blockchainfilestorage',
    'pdfeditor', 'anon',
  ]);
  const knownSources = new Set(projects.map((project) => normalizedRepository(project.sourceUrl)));
  const additional: WorkListItem[] = [];

  for (const candidate of value.slice(0, 50)) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;
    const record = candidate as Record<string, unknown>;
    if (typeof record.title !== 'string' || !record.title.trim()) continue;
    const title = record.title.trim().slice(0, 120);
    const titleKey = normalizedTitle(title);
    const sourceUrl = publicLink(record.github);
    const websiteUrl = publicLink(record.liveDemo);
    if (!sourceUrl && !websiteUrl) continue;
    const sourceKey = sourceUrl ? normalizedRepository(sourceUrl) : undefined;
    if (knownTitles.has(titleKey) || (sourceKey && knownSources.has(sourceKey))) continue;
    const tags = Array.isArray(record.technologies)
      ? [...new Set(record.technologies.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean))].slice(0, 8).map((tag) => tag.slice(0, 35))
      : [];
    additional.push({
      id: `catalog-${additional.length}-${titleKey}`,
      title,
      summary: 'An additional link from the owner-maintained project catalog. Its implementation has not been reviewed for this collection.',
      status: 'Catalog entry · not audited',
      tags,
      sourceUrl,
      websiteUrl,
      audited: false,
    });
    knownTitles.add(titleKey);
    if (sourceKey) knownSources.add(sourceKey);
  }
  return additional;
}
