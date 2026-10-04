import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import ResumeActions from './ResumeActions';
import styles from './resume.module.css';

export const metadata: Metadata = {
  title: 'Résumé',
  description: 'Vardhan’s experience in enterprise content platforms, React, TypeScript, Java and Node services. Read an accessible overview or download the original résumé.',
  alternates: { canonical: '/resume' },
  openGraph: { title: 'Résumé — Vardhan', description: 'Full stack engineering, enterprise content platforms, and delivery.', url: '/resume', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};

// Selected owner-maintained facts from public/data/resume.json.
// Employers remain anonymized as required by src/config/site.ts. The original
// PDF remains the full owner-provided document; no employment claim is inferred.
const experience = [
  { role: 'AEM Full Stack Developer and Dev Lead', organization: 'A national telecom carrier', period: 'Jan 2025 to Present', points: ['AEM pages, reusable content fragments, and TypeScript controllers for dynamic interfaces.', 'Node.js REST services, dispatcher configuration, deployments, and authoring guides.'] },
  { role: 'Software Engineer', organization: 'A mortgage finance agency', period: 'Jan 2024 to Dec 2024', points: ['React interfaces within AEM templates, custom components, and Spring Boot services.', 'Docker deployments on AWS EC2 and Lambda, with Jenkins and GitLab delivery workflows.'] },
  { role: 'Full Stack Developer', organization: 'A university', period: 'Oct 2022 to Dec 2023', points: ['React applications consuming AEM Content Fragments and Spring Boot APIs.', 'REST and GraphQL integration, with Jest, Mocha, and JUnit testing.'] },
  { role: 'Software Engineer', organization: 'A global insurer', period: 'Mar 2021 to Jul 2022', points: ['AEM components and templates connected to Spring Boot through Sling Models.', 'Reusable services for content workflows and IBM ODM decision logic tested with JUnit.'] },
  { role: 'Software Developer', organization: 'Healthcare software', period: 'Sep 2019 to Feb 2021', points: ['Java modules for pharmacovigilance platforms and PostgreSQL schemas.', 'D3.js data visualizations and deployment testing through GitLab CI/CD.'] },
];
const skills = [
  { label: 'Interfaces', body: 'React · TypeScript · JavaScript · HTML · CSS' },
  { label: 'Content platforms', body: 'Adobe Experience Manager · Sling Models · Content Fragments · Dispatcher' },
  { label: 'Services & data', body: 'Java · Spring Boot · Node.js · REST · GraphQL · PostgreSQL' },
  { label: 'Delivery & testing', body: 'AWS · Docker · Jenkins · GitLab CI/CD · Jest · JUnit' },
];

export default function ResumePage() {
  return <article className={styles.page} aria-labelledby="resume-title"><div className={styles.sheet}>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>The experience / Résumé</p>
      <h1 id="resume-title">Vardhan.</h1>
      <p className={styles.role}>Full stack engineer.</p>
      <p className={styles.summary}>Enterprise content platforms, interfaces, and the services behind them. My work connects Adobe Experience Manager, React and TypeScript with Java, Node.js, and delivery infrastructure.</p>
      <div className={styles.contact}><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><span>{siteConfig.location}</span><a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer">GitHub</a></div>
    </header>
    <ResumeActions />
    <section className={styles.section} aria-labelledby="experience-heading"><h2 id="experience-heading">Selected experience</h2><div className={styles.roles}>{experience.map(position => <section className={styles.position} key={position.organization}><h3>{position.role}</h3><p className={styles.positionMeta}><span>{position.organization}</span><span>{position.period}</span></p><ul>{position.points.map(point => <li key={point}>{point}</li>)}</ul></section>)}</div></section>
    <section className={styles.section} aria-labelledby="skills-heading"><h2 id="skills-heading">Areas of practice</h2><div className={styles.skills}>{skills.map(group => <div key={group.label}><h3>{group.label}</h3><p>{group.body}</p></div>)}</div></section>
    <section className={styles.section} aria-labelledby="education-heading"><h2 id="education-heading">Education</h2><div className={styles.education}><div><h3>Master of Science in Information Technology</h3><p>University of Cincinnati · December 2023</p></div><div><h3>Bachelor of Technology in Information Technology</h3><p>Jawaharlal Nehru Technological University Hyderabad</p></div></div></section>
    <p className={styles.footnote}>This is a selected overview. The original PDF includes the detailed résumé, named employers, and full career history.</p>
    <Link className={styles.backLink} href="/#work">← Back to the work</Link>
  </div></article>;
}

