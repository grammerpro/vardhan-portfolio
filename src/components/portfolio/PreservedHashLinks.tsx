'use client';

import { useEffect } from 'react';

/** The preserved #fit URL points into an optional disclosure. */
export default function PreservedHashLinks() {
  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    const revealFit = () => {
      const target = document.getElementById('fit');
      const disclosure = target?.closest('details');
      if (!target || !disclosure) return;
      disclosure.open = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'instant', block: 'start' });
          target.focus({ preventScroll: true });
        });
      });
    };
    const followHash = () => { if (window.location.hash === '#fit') revealFit(); };
    const followClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.getAttribute('target') === '_blank') return;
      const url = new URL(link.getAttribute('href')!, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash === '#fit') revealFit();
    };
    followHash();
    window.addEventListener('hashchange', followHash);
    window.addEventListener('pageshow', followHash);
    document.addEventListener('click', followClick);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.removeEventListener('hashchange', followHash);
      window.removeEventListener('pageshow', followHash);
      document.removeEventListener('click', followClick);
    };
  }, []);
  return null;
}
