'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Section 5.5.
 *
 * Background returns to --paper via a second scrubbed interpolation, mirroring
 * PositioningSection but faster: 60% of the scroll distance, and no pin, so
 * the page does not stall a second time on the way out of the dark.
 *
 * The skill bars, the year-by-year timeline, the emoji tool tiles, and the
 * 5+/50+/15+ counters were deleted in the Phase 2 content pass.
 *
 * Section 5.5 also asks for one photograph beside this prose. Vardhan has
 * chosen to leave it out for now, so the column is prose only and the layout
 * is built for that rather than holding an empty slot open.
 */
export default function AboutSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;

      // Reduced motion: commit straight to the light palette. Without this the
      // section would keep whatever colour the arc last wrote.
      if (prefersReducedMotion()) {
        html.style.setProperty('--arc-bg', '#E8E6E1');
        html.style.setProperty('--arc-fg', '#121417');
        html.style.setProperty('--nav-fg', '#121417');
        return;
      }

      const mixBg = gsap.utils.interpolate('#0D0F12', '#E8E6E1');
      const mixFg = gsap.utils.interpolate('#E8E6E1', '#121417');
      const arc = { progress: 0 };

      const tween = gsap.to(arc, {
        progress: 1,
        ease: 'none',
        onUpdate: () => {
          // Both arc segments write the same global custom properties, so
          // whichever updates last wins. At scroll 0 this trigger sits before
          // its start and fires once at progress 0, which would stamp --void
          // over the hero and make the navbar invisible. Staying silent at 0
          // leaves PositioningSection's value alone until this segment is
          // genuinely in play.
          if (arc.progress === 0) return;
          html.style.setProperty('--arc-bg', mixBg(arc.progress));
          html.style.setProperty('--arc-fg', mixFg(arc.progress));
          html.style.setProperty('--nav-fg', mixFg(arc.progress));
        },
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'top 40%',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: root },
  );

  return (
    <section
      id="about"
      ref={root}
      className="relative w-full bg-[color:var(--arc-bg)] py-s7 text-[color:var(--arc-fg)]"
    >
      <div className="mx-auto grid w-full max-w-[var(--grid-max)] grid-cols-4 gap-s3 px-[var(--page-margin)] md:grid-cols-12">
        <h2 className="u-mono col-span-4 mb-s5 text-graphite md:col-span-12">About</h2>

        <div className="col-span-4 flex flex-col gap-s3 md:col-span-6 md:col-start-2">
          <p className="text-body leading-[var(--leading-body)]">
            I am a full stack engineer in Cincinnati. Five years in, most of it on
            enterprise content platforms: Adobe Experience Manager, React and
            TypeScript at the front, Java Spring Boot and Node services behind it. I
            have shipped for a national telecom carrier, a mortgage finance agency, a
            global insurer, and a university.
          </p>

          <p className="text-body leading-[var(--leading-body)]">
            What I build on my own time looks different. A Java-native RAG system that
            runs local models against local documents. A WebGL ribbon experiment. A
            client-side PDF editor that signs files without uploading them anywhere.
            Decentralized storage on IPFS.
          </p>

          <p className="text-body leading-[var(--leading-body)]">
            I have a master&apos;s in information technology from the University of
            Cincinnati. I am open to full-time work.
          </p>
        </div>
      </div>
    </section>
  );
}
