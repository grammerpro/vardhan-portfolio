import type { Metadata } from 'next';
import Link from 'next/link';
import { projects } from '@/content/portfolio';
import { getProjects } from '@/lib/queries';
import { additionalCatalogWork, auditedWork } from '@/lib/project-catalog';
import ProjectsList from './ProjectsList';
import styles from './projects.module.css';

export const metadata: Metadata = {
  title: 'Work archive',
  description: 'Explore Vardhan’s independent projects: retrieval, browser games, interfaces, and engineering experiments, with source evidence and clear scope.',
  alternates: { canonical: 'https://vardhansudo.me/projects' },
  openGraph: { title: 'The workbench / Vardhan', description: 'Independent projects, inspected at the source.', url: 'https://vardhansudo.me/projects', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};

async function optionalCatalog() {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getProjects({ signal: controller.signal }),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => { controller.abort(); resolve(null); }, 2000);
      }),
    ]);
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default async function Projects({ searchParams }: { searchParams: Promise<{ q?: string; technology?: string }> }) {
  const [catalog, query] = await Promise.all([optionalCatalog(), searchParams]);
  const additional = additionalCatalogWork(catalog, projects);
  const initialSearch = typeof query.q === 'string' ? query.q.slice(0, 160) : '';
  const initialTechnology = typeof query.technology === 'string' ? query.technology : 'All';
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Link href="/#work" className={styles.back}>← Back to selected work</Link>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>Vardhan / Independent work</p><h1>The workbench.</h1></div>
          <p>Ideas turned into code.<br />Some complete, some exploratory.<br />Every one with a clear scope.</p>
        </header>
        <p className={styles.intro}>The collection brings together retrieval systems, browser interactions, and smaller engineering experiments. Open a case study to see the implementation, decisions, and current limits.</p>
        <ProjectsList projects={[...auditedWork(projects), ...additional]} initialSearch={initialSearch} initialTechnology={initialTechnology} />
        {additional.length > 0 && <p className={styles.catalogNote}>Additional catalog links come from the existing owner-maintained collection. They have not received the source review applied to the six case studies; older descriptions and unverified screenshots are not republished here.</p>}
        <footer className={styles.footer}><p>Interested in how I approach a problem?</p><Link href="/#contact">Let’s talk <span aria-hidden="true">↗</span></Link></footer>
      </div>
    </div>
  );
}
