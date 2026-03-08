'use client';

import { useState, useCallback } from 'react';

export default function Resume() {
  const [showPdf, setShowPdf] = useState(false);

  const launchPaperAirplane = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    // Start position: center of the button
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // End position: top-right corner (where browser downloads appear)
    const endX = window.innerWidth - 20;
    const endY = 10;

    // Create a larger, more visible paper airplane SVG
    const airplane = document.createElement('div');
    airplane.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="none">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#0ea5e9" stroke="#0284c7" stroke-width="1" stroke-linejoin="round"/>
      </svg>
    `;
    airplane.style.cssText = `
      position: fixed;
      left: ${startX - 20}px;
      top: ${startY - 20}px;
      z-index: 99999;
      pointer-events: none;
      filter: drop-shadow(0 4px 12px rgba(14, 165, 233, 0.6));
    `;
    document.body.appendChild(airplane);

    // Deltas to final destination
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Circular looping flight path:
    // 1. Swing left and slightly up
    // 2. Loop down-right
    // 3. Come back up in a wide arc
    // 4. Sweep right and land at top-right corner
    const animation = airplane.animate(
      [
        // Start: at button center
        {
          transform: 'translate(0, 0) rotate(0deg) scale(1)',
          opacity: 1,
          offset: 0,
        },
        // Phase 1: Swing up and to the left
        {
          transform: `translate(${-150}px, ${-120}px) rotate(-60deg) scale(1.1)`,
          opacity: 1,
          offset: 0.12,
        },
        // Phase 2: Arc down-left (top of the loop)
        {
          transform: `translate(${-220}px, ${40}px) rotate(-150deg) scale(1.05)`,
          opacity: 1,
          offset: 0.25,
        },
        // Phase 3: Bottom of the loop — swinging right
        {
          transform: `translate(${-80}px, ${140}px) rotate(-240deg) scale(1)`,
          opacity: 1,
          offset: 0.38,
        },
        // Phase 4: Coming back up through the right side of the loop
        {
          transform: `translate(${60}px, ${-20}px) rotate(-330deg) scale(0.95)`,
          opacity: 1,
          offset: 0.5,
        },
        // Phase 5: Full loop completed, now heading toward top-right
        {
          transform: `translate(${deltaX * 0.35}px, ${deltaY * 0.3 - 80}px) rotate(-380deg) scale(0.85)`,
          opacity: 1,
          offset: 0.62,
        },
        // Phase 6: Sweeping up and right
        {
          transform: `translate(${deltaX * 0.6}px, ${deltaY * 0.5 - 50}px) rotate(-400deg) scale(0.7)`,
          opacity: 0.9,
          offset: 0.75,
        },
        // Phase 7: Approaching the corner
        {
          transform: `translate(${deltaX * 0.85}px, ${deltaY * 0.8}px) rotate(-420deg) scale(0.5)`,
          opacity: 0.7,
          offset: 0.88,
        },
        // Final: arrive at top-right corner, shrink and fade
        {
          transform: `translate(${deltaX}px, ${deltaY}px) rotate(-440deg) scale(0.25)`,
          opacity: 0,
          offset: 1,
        },
      ],
      {
        duration: 3500,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        fill: 'forwards',
      }
    );

    // Trail effect — spawns glowing particles along the flight path
    let trailCount = 0;
    const trailInterval = setInterval(() => {
      trailCount++;
      if (trailCount > 28) {
        clearInterval(trailInterval);
        return;
      }
      const trail = document.createElement('div');
      const computedStyle = getComputedStyle(airplane);
      const matrix = new DOMMatrix(computedStyle.transform);
      trail.style.cssText = `
        position: fixed;
        left: ${startX - 4 + matrix.m41}px;
        top: ${startY - 4 + matrix.m42}px;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, rgba(14, 165, 233, 0.7), transparent);
        border-radius: 50%;
        z-index: 99998;
        pointer-events: none;
      `;
      document.body.appendChild(trail);

      trail.animate(
        [
          { opacity: 0.7, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(3)' },
        ],
        { duration: 800, easing: 'ease-out', fill: 'forwards' }
      );

      setTimeout(() => trail.remove(), 800);
    }, 110);

    // Cleanup when animation finishes
    animation.onfinish = () => {
      airplane.remove();
      clearInterval(trailInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            My Resume
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Download or view my resume to learn more about my experience and qualifications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              id="download-resume-btn"
              href="/resume.pdf"
              download="Vardhan_Resume.pdf"
              onClick={launchPaperAirplane}
              className="inline-flex items-center px-8 py-4 bg-sky-500 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-sky-600 hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>

            <button
              onClick={() => setShowPdf(!showPdf)}
              className={`inline-flex items-center px-8 py-4 border-2 rounded-full font-medium text-lg transition-all duration-300 hover:scale-105 ${showPdf
                ? 'bg-sky-500 border-sky-500 text-white'
                : 'border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white'
                }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPdf ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                )}
              </svg>
              {showPdf ? 'Hide Resume' : 'View Online'}
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        {showPdf ? (
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-neutral-800">
            <div className="bg-gray-200 dark:bg-neutral-700 px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">resume.pdf</span>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"
              >
                Open in new tab
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <iframe
              src="/resume.pdf"
              className="w-full h-[800px] md:h-[1000px]"
              title="Resume PDF"
            />
          </div>
        ) : (
          /* Resume Preview Placeholder - shown when PDF is hidden */
          <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-8 text-center border border-gray-200 dark:border-neutral-700">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Resume Preview</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click &quot;View Online&quot; to see the resume directly here, or download the PDF.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Make sure <code className="bg-gray-200 dark:bg-neutral-700 px-2 py-1 rounded text-sm">public/resume.pdf</code> exists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

