import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject, projects } from '@/content/portfolio';
import styles from './case-study.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: 'Project not found | Vardhan' };
  const url = `https://vardhansudo.me/work/${project.slug}`;
  return {
    title: { absolute: `${project.title} — Project study | Vardhan` },
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.title} / Vardhan`,
      description: project.summary,
      url,
      type: 'article',
      images: [{ url: `https://vardhansudo.me/images/evidence/${project.slug}-social.png`, width: 1200, height: 720, alt: project.imageAlt }],
    },
    twitter: { card: 'summary_large_image', title: `${project.title} / Vardhan`, description: project.summary, images: [`https://vardhansudo.me/images/evidence/${project.slug}-social.png`] },
  };
}

export default async function ProjectCaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const index = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className={styles.page} style={{ '--project-accent': project.accent } as CSSProperties}>
      <div className={styles.shell}>
        <nav className={styles.topline} aria-label="Project navigation">
          <Link href="/#work" className={styles.back}>← Back to work</Link>
          <span>Vardhan / Inside the System</span>
        </nav>

        <header className={styles.header}>
          <p className={styles.eyebrow}>{project.kicker}</p>
          <h1>{project.title}</h1>
          <p className={styles.summary}>{project.summary}</p>
          <div className={styles.actions}>
            <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">Explore source <span aria-hidden="true">↗</span></a>
            {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Open demo <span aria-hidden="true">↗</span></a>}
          </div>
          <dl className={styles.facts}>
            <div><dt>Status</dt><dd>{project.status}</dd></div>
            <div><dt>Scope</dt><dd>{project.role}</dd></div>
            <div><dt>Tools</dt><dd>{project.tags.join(' · ')}</dd></div>
          </dl>
        </header>

        <figure className={styles.visual}>
          <Image src={project.image} alt={project.imageAlt} width={1200} height={720} sizes="(max-width: 1280px) 100vw, 1200px" priority />
          <figcaption>{project.imageCaption}</figcaption>
        </figure>

        <section className={styles.readingSection} aria-labelledby="project-question">
          <div><p className={styles.eyebrow}>01 / Context</p><h2 id="project-question">The question behind the work.</h2></div>
          <div className={styles.prose}><p>{project.problem}</p><h3>Contribution and scope</h3><p>{project.contribution}</p></div>
        </section>

        <section className={styles.architecture} aria-labelledby="project-architecture">
          <p className={styles.eyebrow}>02 / Under the surface</p>
          <h2 id="project-architecture">Follow the implementation.</h2>
          <p className={styles.flowIntro}>A reading of the public code. Select any stage to see what happens there.</p>
          <ol className={styles.flow}>
            {project.architecture.map((step, stepIndex) => (
              <li key={step.title}>
                <details open={stepIndex === 0}>
                  <summary><span className={styles.stepNumber} aria-hidden="true">{String(stepIndex + 1).padStart(2, '0')}</span><span>{step.title}</span><span className={styles.plus} aria-hidden="true">+</span></summary>
                  <p>{step.body}</p>
                </details>
              </li>
            ))}
          </ol>
          <p className={styles.diagramCaption}>Source-based architecture explanation. The linked files below are the implementation evidence.</p>
        </section>

        <section className={styles.readingSection} aria-labelledby="project-decisions">
          <div><p className={styles.eyebrow}>03 / Decisions</p><h2 id="project-decisions">The choices and their tradeoffs.</h2></div>
          <div className={styles.decisions}>{project.decisions.map((decision) => <article key={decision.title}><h3>{decision.title}</h3><p>{decision.body}</p></article>)}</div>
        </section>

        <section className={styles.readingSection} aria-labelledby="project-validation">
          <div><p className={styles.eyebrow}>04 / Evidence</p><h2 id="project-validation">What the source establishes.</h2></div>
          <div className={styles.prose}>
            <p>{project.validation}</p>
            <h3>Current limits</h3>
            <ul className={styles.limitations}>{project.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul>
            <h3>Inspect the details</h3>
            <ul className={styles.evidence}>{project.evidence.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<span aria-hidden="true">↗</span></a></li>)}</ul>
          </div>
        </section>

        <nav className={styles.next} aria-label="Continue exploring">
          <Link href="/#work" className={styles.back}>← All work</Link>
          <Link href={`/work/${next.slug}`} className={styles.nextProject}><span className={styles.eyebrow}>Next project</span><span>{next.title} <span aria-hidden="true">↗</span></span></Link>
        </nav>
      </div>
    </article>
  );
}
