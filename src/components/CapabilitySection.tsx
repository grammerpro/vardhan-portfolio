'use client';

import { useRef } from 'react';
import SplitType from 'split-type';
import { gsap, useGSAP, EASE, DUR, STAGGER } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Section 5.4. Replaces the deleted skill percentage bars and the "Tools of
 * the Trade" tiles. No percentages, no proficiency ratings, no logo grids.
 *
 * Nothing pins here. After the horizontal section the page needs to breathe,
 * so this is line-masked reveals on the headings and a small staggered rise
 * on the body, and nothing else.
 *
 * Every statement is drawn from the skills and experience entries in
 * public/data/resume.json.
 */

const capabilities = [
  {
    heading: 'Content platforms at scale',
    body: 'I work in Adobe Experience Manager most days: components, content and experience fragments, MSM, dispatcher configuration, and Sling models. Most of the job is making a system that non-engineers can author in without breaking it, which is why I end up writing the authoring guides too.',
  },
  {
    heading: 'Front end that holds up',
    body: 'React and TypeScript, built from Figma files and held to the design. I write Jest tests against the parts that break quietly rather than the parts that are easy to test.',
  },
  {
    heading: 'Services and delivery',
    body: 'Node and Express REST services, Java Spring Boot, and the GraphQL and Pub/Sub layers between them. Deployment through GitLab CI, Docker, and AWS, with secret scanning in the pipeline rather than bolted on afterwards.',
  },
  {
    heading: 'Graphics and retrieval',
    body: 'The side of the work that does not show up on a corporate roadmap: Three.js and WebGL, and retrieval systems that run local models against local documents. The repos above are where this lives.',
  },
];

export default function CapabilitySection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const headings = gsap.utils.toArray<HTMLElement>('[data-cap-heading]', root.current);
      const bodies = gsap.utils.toArray<HTMLElement>('[data-cap-body]', root.current);

      if (prefersReducedMotion()) {
        gsap.set([...headings, ...bodies], { opacity: 1, y: 0 });
        return;
      }

      const triggers: ReturnType<typeof gsap.timeline>[] = [];

      headings.forEach((heading, index) => {
        const split = new SplitType(heading, { types: 'lines' });
        const lines = split.lines ?? [];

        lines.forEach((line) => {
          const mask = document.createElement('span');
          mask.style.display = 'block';
          mask.style.overflow = 'hidden';
          line.parentNode?.insertBefore(mask, line);
          mask.appendChild(line);
        });

        gsap.set(heading, { opacity: 1 });
        gsap.set(lines, { yPercent: 110 });

        const body = bodies[index];
        if (body) gsap.set(body, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heading,
            start: 'top 82%',
            // Reveals trigger once. No replay on scroll back up.
            once: true,
          },
        });

        tl.to(lines, {
          yPercent: 0,
          duration: DUR.reveal,
          ease: EASE.outExpo,
          stagger: STAGGER.line,
        });

        if (body) {
          tl.to(body, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.outExpo }, 0.2);
        }

        triggers.push(tl);
      });

      return () => {
        triggers.forEach((tl) => {
          tl.scrollTrigger?.kill();
          tl.kill();
        });
      };
    },
    { scope: root },
  );

  return (
    <section id="capability" className="relative w-full bg-void py-s7" ref={root}>
      <div className="mx-auto grid w-full max-w-[var(--grid-max)] grid-cols-4 gap-s3 px-[var(--page-margin)] md:grid-cols-12">
        <h2 className="u-mono col-span-4 mb-s5 text-graphite-void md:col-span-12">Capability</h2>

        <div className="col-span-4 flex flex-col gap-s6 md:col-span-10 md:col-start-2">
          {capabilities.map((item) => (
            <div key={item.heading}>
              <h3
                data-cap-heading
                className="mb-s2 max-w-[20ch] font-display text-h3 font-bold tracking-[-0.03em] text-bone opacity-0"
              >
                {item.heading}
              </h3>
              <p
                data-cap-body
                className="max-w-[62ch] text-body leading-[var(--leading-body)] text-graphite-void"
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
