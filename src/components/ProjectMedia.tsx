'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * Project card media.
 *
 * A still screenshot is fine. A short silent loop of the thing actually
 * running is a different site, which is why the brief calls this the single
 * biggest visual gap. Projects opt in by supplying a `video`; everything else
 * keeps the still.
 *
 * Playback only happens while the card is on screen, so six loops are never
 * decoding at once. Under reduced motion the video never loads at all and the
 * poster stands in, which is why the poster is a real still rather than a
 * first-frame grab.
 */

export type ProjectVideo = {
  webm: string;
  mp4: string;
  poster: string;
};

export default function ProjectMedia({
  image,
  video,
  alt,
  sizes,
}: {
  image: string;
  video?: ProjectVideo;
  alt: string;
  sizes: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() rejects if the browser blocks autoplay. Muted inline video
          // is normally allowed, but the poster is a fine fallback either way.
          void el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { rootMargin: '10% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!video) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover object-center transition-transform duration-[var(--dur-base)] ease-out-expo group-hover:scale-[1.04]"
      />
    );
  }

  return (
    <video
      ref={ref}
      poster={video.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={alt}
      className="h-full w-full object-cover object-center transition-transform duration-[var(--dur-base)] ease-out-expo group-hover:scale-[1.04] motion-reduce:hidden"
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}
