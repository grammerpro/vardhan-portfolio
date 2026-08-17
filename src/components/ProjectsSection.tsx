'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap, useGSAP } from '@/lib/gsap';
import useReducedMotion, { prefersReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Section 5.3. Horizontal pinned gallery.
 *
 * The section pins and a horizontal track translates on X, scrubbed against
 * vertical scroll. Track distance is total card width minus one viewport.
 *
 * The category filter chips are gone. A six-item list does not need filtering
 * and filter UI in a portfolio is a tell.
 *
 * Below 768px this falls back to a plain vertical stack. Section 7 requires
 * that, because a pinned horizontal scroll cannot be made properly reachable
 * on a small touch screen.
 *
 * Project content is Vardhan's and is not written or edited here.
 */

type Project = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  url: string;
};

const projects: Project[] = [
  {
    id: 1,
    title: 'Aura Landing',
    description:
      'A futuristic landing page for Aura - AI frameworks & smart eyewear, built with modern web aesthetics.',
    tags: ['Next.js', 'AI', 'Smart Eyewear', 'Tailwind'],
    image: '/images/aura-landing.png',
    url: 'https://github.com/grammerpro/aura-landing',
  },
  {
    id: 2,
    title: 'Java Native RAG',
    description:
      'A native Java Retrieval-Augmented Generation system for fast local LLM document intelligence.',
    tags: ['Java', 'RAG', 'VectorDB', 'LLM'],
    image: '/images/java-rag.png',
    url: 'https://github.com/grammerpro/Java-Native-RAG-System',
  },
  {
    id: 3,
    title: 'Chroma Loop',
    description: 'An interactive WebGL experience using Three.js and custom shader ribbons.',
    tags: ['Three.js', 'WebGL', 'GSAP', 'Shaders'],
    image: '/images/chroma-loop.png',
    url: 'https://github.com/grammerpro/Chroma-Loop',
  },
  {
    id: 4,
    title: 'ANON Dapp',
    description: 'A decentralized anonymous application using zero-knowledge proof frameworks.',
    tags: ['Solidity', 'Ethereum', 'React', 'Cryptography'],
    image: '/images/anon-dapp.png',
    url: 'https://github.com/grammerpro/ANON-Dapp',
  },
  {
    id: 5,
    title: 'PDF Editor Tool',
    description: 'A client-side PDF document editor featuring secure digital signature integrations.',
    tags: ['React', 'PDF.js', 'WebCrypto', 'Tailwind'],
    image: '/images/pdf-editor.png',
    url: 'https://github.com/grammerpro/pdf-editor-tool',
  },
  {
    id: 6,
    title: 'Blockchain Storage',
    description:
      'Decentralized cloud file storage utilizing Ethereum smart contracts and IPFS storage nodes.',
    tags: ['IPFS', 'Solidity', 'Ethereum', 'React'],
    image: '/images/blockchain-storage.png',
    url: 'https://github.com/grammerpro/BlockchainFileStorage',
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article data-card className="flex w-full shrink-0 flex-col md:w-[46vw] lg:w-[38vw]">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-s3"
      >
        {/* Media, roughly 4:3. The frame stays put and the image shifts inside
            it, scaled up so the parallax never exposes an edge. Translating
            the frame itself left gaps between the media and its own caption. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-void">
          <div data-card-media className="absolute inset-0 scale-[1.18]">
            <Image
              src={project.image}
              alt={`${project.title} project screenshot`}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 46vw, 38vw"
              className="object-cover object-center transition-transform duration-[var(--dur-base)] ease-out-expo group-hover:scale-[1.04]"
            />
          </div>
        </div>

        <div data-card-text className="flex flex-col gap-s1">
          <span className="u-mono text-graphite-void">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="font-display text-h2 font-extrabold leading-[0.95] tracking-[-0.03em] text-bone">
            {project.title}
          </h3>
          <p className="max-w-[46ch] text-body leading-[var(--leading-body)] text-graphite-void">
            {project.description}
          </p>
          <ul className="u-mono mt-s1 flex flex-wrap gap-s2 text-graphite-void">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </a>
    </article>
  );
}

export default function ProjectsSection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      // Vertical stack below 768px, and whenever motion is reduced. Neither
      // path creates a ScrollTrigger at all.
      if (prefersReducedMotion() || window.matchMedia('(max-width: 767px)').matches) {
        return;
      }

      const trackEl = track.current;
      const rootEl = root.current;
      if (!trackEl || !rootEl) return;

      const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);

      const tween = gsap.to(trackEl, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: rootEl,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          // Scrub 1.0 with smoothing, not instant, per the brief.
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Depth inside the horizontal move: media runs slightly faster than the
      // track, text slightly slower.
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', trackEl);
      const parallax = cards.map((card) => {
        const media = card.querySelector('[data-card-media]');
        const text = card.querySelector('[data-card-text]');
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootEl,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        if (media) tl.fromTo(media, { xPercent: 0 }, { xPercent: -12, ease: 'none' }, 0);
        if (text) tl.fromTo(text, { xPercent: 0 }, { xPercent: 4, ease: 'none' }, 0);
        return tl;
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        parallax.forEach((tl) => {
          tl.scrollTrigger?.kill();
          tl.kill();
        });
      };
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} className="relative w-full overflow-hidden bg-void">
      <div className="flex min-h-svh flex-col justify-center py-s6">
        <h2 className="u-mono mb-s5 px-[var(--page-margin)] text-graphite-void">Selected work</h2>

        <div
          ref={track}
          className={
            reduced
              ? 'flex flex-col gap-s6 px-[var(--page-margin)]'
              : 'flex flex-col gap-s6 px-[var(--page-margin)] md:w-max md:flex-row md:items-start md:gap-s5'
          }
        >
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
