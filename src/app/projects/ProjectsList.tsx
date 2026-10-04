'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { WorkListItem } from '@/lib/project-catalog';
import styles from './projects.module.css';

type Props = { projects: WorkListItem[]; initialSearch: string; initialTechnology: string };

export default function ProjectsList({ projects, initialSearch, initialTechnology }: Props) {
  const technologies = [...new Set(projects.flatMap((project) => project.tags))].sort((a, b) => a.localeCompare(b));
  const [search, setSearch] = useState(initialSearch);
  const [technology, setTechnology] = useState(technologies.includes(initialTechnology) ? initialTechnology : 'All');
  const query = search.trim().toLocaleLowerCase();
  const visible = projects.filter((project) =>
    (technology === 'All' || project.tags.includes(technology)) &&
    (!query || [project.title, project.summary, project.status, ...project.tags].join(' ').toLocaleLowerCase().includes(query)),
  );
  const reset = () => { setSearch(''); setTechnology('All'); };

  return (
    <section aria-label="Project archive">
      <form className={styles.filters} action="/projects" method="get" onSubmit={(event) => event.preventDefault()}>
        <div className={styles.search}><label htmlFor="project-search">Search the work</label><input id="project-search" name="q" type="search" value={search} maxLength={160} onChange={(event) => setSearch(event.target.value)} placeholder="Project, tool, or idea…" /></div>
        <div className={styles.technology}><label htmlFor="project-technology">Technology</label><select id="project-technology" name="technology" value={technology} onChange={(event) => setTechnology(event.target.value)}><option value="All">All technologies</option>{technologies.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></div>
        <button type="submit" className={styles.apply}>Apply filters <span aria-hidden="true">↗</span></button>
      </form>
      <div className={styles.results}><p role="status" aria-live="polite">{visible.length} {visible.length === 1 ? 'project' : 'projects'}{query || technology !== 'All' ? ' found' : ' in the collection'}</p>{(search || technology !== 'All') && <button type="button" onClick={reset}>Clear filters</button>}</div>
      {visible.length > 0 ? <ol className={styles.list}>{visible.map((project) => (
        <li key={project.id}>
          <article className={styles.project}>
            <span className={styles.number} aria-hidden="true">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
            <div className={styles.image}>{project.image ? <Image src={project.image} alt={project.imageAlt || ''} width={600} height={360} sizes="(max-width: 680px) calc(100vw - 44px), 280px" /> : <div className={styles.catalogImage} aria-hidden="true"><span>From the catalog</span><span>↗</span></div>}</div>
            <div className={styles.copy}><p className={styles.status}>{project.status}</p><h2>{project.caseStudyUrl ? <Link href={project.caseStudyUrl}>{project.title}</Link> : project.title}</h2><p>{project.summary}</p><ul className={styles.tags} aria-label={project.audited ? 'Technologies' : 'Owner-listed technologies'}>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></div>
            <div className={styles.actions}>{project.caseStudyUrl && <Link href={project.caseStudyUrl}>Case study <span aria-hidden="true">↗</span></Link>}{project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">Source <span aria-hidden="true">↗</span></a>}{project.websiteUrl && <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">Website <span aria-hidden="true">↗</span></a>}</div>
          </article>
        </li>
      ))}</ol> : <div className={styles.empty}><h2>No matching projects.</h2><p>Try another tool or a shorter search.</p><button type="button" onClick={reset}>Show all work <span aria-hidden="true">↗</span></button><noscript><p><Link href="/projects">Clear the search and view all work</Link></p></noscript></div>}
    </section>
  );
}
