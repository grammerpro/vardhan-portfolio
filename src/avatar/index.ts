// Avatar Assistant - Phase 1: Dock + Static Avatar
// Minimal, production-friendly initializer with glass dock and static avatar image.

type Position = { right?: number; bottom?: number };
type Theme = 'light' | 'dark' | 'auto';

export type AvatarAssistantOptions = {
  container?: string; // CSS selector
  position?: Position; // px offsets
  theme?: Theme;
  avatarUrl?: string; // static standing pose
  spriteUrl?: string; // reserved for later phases
  lottieUrl?: string; // reserved for later phases
  patrol?: boolean; // reserved for later phases
  bubbleHints?: boolean; // reserved for later phases
  voice?: boolean; // reserved for later phases
  openChat?: () => void; // wired in phase 2
  hotkey?: string; // Phase 10: keyboard shortcut (e.g., "Alt+A")
  draggable?: boolean; // Phase 7: allow disabling drag
};

const DEFAULTS: Required<Pick<AvatarAssistantOptions,
  'container' | 'position' | 'theme' | 'avatarUrl' | 'patrol' | 'bubbleHints' | 'voice' | 'draggable'
>> = {
  container: 'body',
  position: { right: 20, bottom: 20 },
  theme: 'auto',
  avatarUrl: '/assets/avatar-standing.svg',
  patrol: true,
  bubbleHints: true,
  voice: false,
  draggable: true,
};

class AvatarAssistantCore {
  private opts: AvatarAssistantOptions;
  private containerEl: HTMLElement | null = null;
  private dockEl: HTMLDivElement | null = null;
  private avatarButtonEl: HTMLButtonElement | null = null;
  private dotEl: HTMLDivElement | null = null; // Phase 6 notification dot
  private observer: IntersectionObserver | null = null;
  private viewObserver: IntersectionObserver | null = null; // Phase 9 visibility monitor
  private liveEl: HTMLDivElement | null = null; // Phase 10 live region
  // Phase 7 drag & position state
  private dragging = false;
  private dragStarted = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private startRight = 0;
  private startBottom = 0;
  private lastDragAt = 0;
  private readonly posStorageKey = 'aa:dock-pos:v1';
  // Phase 8 overlap avoidance
  private preChatPos: { right: number; bottom: number } | null = null;
  private movedSinceOpen = false;
  // Phase 11 quick actions menu
  private menuEl: HTMLDivElement | null = null;
  private menuOpen = false;
  private longPressTimer: number | null = null;
  private suppressClickUntil = 0;
  // Phase 3 state
  private reducedMotion = false;
  private rafId: number | null = null;
  private startTime = 0;
  private lastTime = 0;
  private idleBreathSpeed = 0.8; // Hz
  private hoverActive = false;
  private pointerX = 0; // normalized -1..1
  private lean = 0; // current smoothed lean rotation (deg)
  private scale = 1; // current smoothed scale
  private tiltTime = 0; // ms remaining for head tilt gesture
  private tiltDir = 1; // direction of tilt
  private nextGestureAt = 0; // ms timestamp
  // Phase 4 patrol
  private userLastActive = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  private inactivityThreshold = 8000; // ms
  private patrolling = false;
  private patrolElapsed = 0; // ms
  private patrolDuration = 4200; // ms for a short loop
  private patrolAmplitude = 12; // px horizontal range inside dock
  private stepAmplitude = 2; // px vertical bob
  private stepHz = 2.8; // steps per second impression
  private patrolOffsetX = 0;
  private patrolOffsetY = 0;
  // Phase 5 speech bubble tips
  private bubbleEl: HTMLDivElement | null = null;
  private nextBubbleAt = 0; // ms timestamp
  private bubbleDuration = 4000; // ms visible
  private bubbleVisible = false;
  private hints: string[] = [
    'Ask me about projects',
    'Try: resume',
    'Ask about my top skills',
    'Curious about experience?',
    'Say: contact info'
  ];
  private lastHintIdx = -1;
  // Phase 12: global unsubs for cleanup
  private unsubs: Array<() => void> = [];

  constructor(options: AvatarAssistantOptions = {}) {
    this.opts = { ...DEFAULTS, ...options };
    this.init();
  }

  private init() {
    // Resolve container
    this.containerEl = document.querySelector(this.opts.container!);
    if (!this.containerEl) {
      console.warn('[AvatarAssistant] container not found, falling back to <body>');
      this.containerEl = document.body;
    }

    // Inject styles once
    this.injectStyles();

    // Create dock
    this.dockEl = document.createElement('div');
    this.dockEl.className = 'aa-dock';
    this.dockEl.setAttribute('role', 'region');
    this.dockEl.setAttribute('aria-label', 'Avatar assistant dock');

    // Position via CSS variables
  // Load persisted position if available
  const saved = this.loadSavedPosition();
  const right = saved?.right ?? (this.opts.position!.right ?? 20);
  const bottom = saved?.bottom ?? (this.opts.position!.bottom ?? 20);
  this.dockEl.style.setProperty('--aa-dock-right', `${right}px`);
  this.dockEl.style.setProperty('--aa-dock-bottom', `${bottom}px`);

    // Theme data attr for future phases
    this.dockEl.dataset.theme = this.opts.theme!;

  // Avatar button (click wired in Phase 2)
    this.avatarButtonEl = document.createElement('button');
    this.avatarButtonEl.className = 'aa-avatar-btn';
    this.avatarButtonEl.type = 'button';
    this.avatarButtonEl.setAttribute('aria-label', 'Open chat assistant');
    this.avatarButtonEl.setAttribute('title', 'Open assistant');
    this.avatarButtonEl.setAttribute('role', 'button');

  // Inner markup: figure for avatar + subtle ground glow
    this.avatarButtonEl.innerHTML = `
      <figure class="aa-avatar-figure">
        <img class="aa-avatar-img" alt="Friendly developer avatar" loading="lazy" decoding="async" />
        <div class="aa-glow" aria-hidden="true"></div>
      </figure>
    `;

  this.dockEl.appendChild(this.avatarButtonEl);
  // Phase 6: notification dot element
  this.dotEl = document.createElement('div');
  this.dotEl.className = 'aa-dot';
  this.dotEl.setAttribute('aria-hidden', 'true');
  this.dotEl.style.opacity = '0';
  this.dotEl.style.transform = 'scale(0.9)';
  this.avatarButtonEl.appendChild(this.dotEl);

  // Phase 5: bubble element
    this.bubbleEl = document.createElement('div');
    this.bubbleEl.className = 'aa-bubble';
    this.bubbleEl.setAttribute('role', 'status');
    this.bubbleEl.setAttribute('aria-live', 'polite');
    this.bubbleEl.style.opacity = '0';
    this.bubbleEl.style.pointerEvents = 'none';
    this.dockEl.appendChild(this.bubbleEl);
    // Phase 10: hidden live region for announcements
    this.liveEl = document.createElement('div');
    this.liveEl.className = 'aa-visually-hidden';
    this.liveEl.setAttribute('aria-live', 'polite');
    this.liveEl.setAttribute('role', 'status');
    this.dockEl.appendChild(this.liveEl);
    this.containerEl!.appendChild(this.dockEl);
  // Phase 11: Quick actions menu DOM
  this.initMenu();

  // Phase 7: Drag to reposition (mouse/touch via Pointer Events)
  if (this.opts.draggable) {
    this.setupDragging();
  } else {
    this.dockEl.classList.add('aa-static');
  }

    // Lazy set src only when visible
  const img = this.dockEl.querySelector('.aa-avatar-img') as HTMLImageElement;
    const setSrc = () => {
      if (img && !img.src) {
        img.src = this.opts.avatarUrl!;
      }
    };
    if ('IntersectionObserver' in window) {
      // Lazy-load image
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSrc();
            this.observer?.disconnect();
          }
        });
      });
      this.observer.observe(this.dockEl);

      // Phase 9: monitor viewport visibility to pause/resume loop
      this.viewObserver = new IntersectionObserver((entries) => {
        const anyVisible = entries.some((e) => e.isIntersecting);
        this.visibleInViewport = anyVisible;
        this.refreshLoopRunning();
      }, { threshold: 0.01 });
      this.viewObserver.observe(this.dockEl);
    } else {
      // Fallback
      setSrc();
    }

    // Phase 2: Click opens chat via callback or default integration
    this.avatarButtonEl.addEventListener('click', () => {
      this.markActive();
      // Guard: ignore click right after a drag or long-press
      const now = Date.now();
      if (now - this.lastDragAt < 250) return;
      if (now < this.suppressClickUntil) return;
      const opened = this.opts.openChat ? this.opts.openChat() : this.defaultOpenChat();
      if (opened) {
        // Avoid overlap with chat panel
        setTimeout(() => this.avoidOverlapWithChat(), 150);
        // Try to focus chat input shortly after open
        setTimeout(() => {
          const input = document.querySelector('.assistant-widget__input') as HTMLInputElement | null;
          input?.focus?.();
        }, 100);
        // Hide notification if visible
        this.hideDot();
      }
    });

    // Phase 11: open menu on right-click (contextmenu)
    this.avatarButtonEl?.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.toggleMenu(true);
    });

    // Phase 11: long-press to open menu
    this.avatarButtonEl?.addEventListener('pointerdown', () => {
      if (this.longPressTimer) window.clearTimeout(this.longPressTimer);
      this.longPressTimer = window.setTimeout(() => {
        this.toggleMenu(true);
        this.suppressClickUntil = Date.now() + 300; // avoid triggering open chat after long-press
      }, 550);
    });
    const clearLP = () => { if (this.longPressTimer) { window.clearTimeout(this.longPressTimer); this.longPressTimer = null; } };
    this.avatarButtonEl?.addEventListener('pointerup', clearLP);
    this.avatarButtonEl?.addEventListener('pointercancel', clearLP);

    // Phase 3: Idle + Hover animations
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.reducedMotion) {
      // Pointer listeners (throttled via rAF by storing state)
      this.dockEl.addEventListener('pointerenter', (e) => {
        this.markActive();
        this.hoverActive = true;
        this.updatePointer(e);
      });
      this.dockEl.addEventListener('pointermove', (e) => { this.markActive(); this.updatePointer(e); });
      this.dockEl.addEventListener('pointerleave', () => {
        this.hoverActive = false;
      });

  // Initialize schedules
  this.scheduleNextGesture();
  this.scheduleNextBubble();

      // Global activity listeners to cancel patrol
  const passiveOpts: AddEventListenerOptions = { passive: true };
  const onMM = () => this.markActive();
  const onScroll = () => this.markActive();
  const onTouch = () => this.markActive();
  window.addEventListener('mousemove', onMM, passiveOpts);
  window.addEventListener('scroll', onScroll, passiveOpts);
  window.addEventListener('touchstart', onTouch, passiveOpts);
  this.unsubs.push(() => window.removeEventListener('mousemove', onMM));
  this.unsubs.push(() => window.removeEventListener('scroll', onScroll));
  this.unsubs.push(() => window.removeEventListener('touchstart', onTouch));

  // Start animation loop (Phase 9: managed by visibility)
  this.startLoop();
    }

    // Phase 6: Listen to assistant events for notifications
  const onNewAnswer = () => {
      // Only show when chat is not open: we cannot know directly, but if input is visible, assume open
      const panelOpen = document.querySelector('.assistant-widget__panel--open');
      if (!panelOpen) this.showDot();
    };
    window.addEventListener('assistant:new-answer', onNewAnswer);
    this.unsubs.push(() => window.removeEventListener('assistant:new-answer', onNewAnswer));
    const onAssistantOpen = () => {
      this.hideDot();
      // Keep avatar fixed; no auto-move on chat open
      this.toggleMenu(false);
    };
    window.addEventListener('assistant:open', onAssistantOpen);
    this.unsubs.push(() => window.removeEventListener('assistant:open', onAssistantOpen));
    const onAssistantClose = () => {
      // Restore to pre-chat position if user didn't move it while chat was open
      if (this.preChatPos && !this.movedSinceOpen) {
        this.setDockPos(this.preChatPos.right, this.preChatPos.bottom);
      }
      this.preChatPos = null;
      this.movedSinceOpen = false;
    };
    window.addEventListener('assistant:close', onAssistantClose);
    this.unsubs.push(() => window.removeEventListener('assistant:close', onAssistantClose));

    // Reset position on double-click of dock background
    this.dockEl.addEventListener('dblclick', (e) => {
      // Avoid when double-clicking inner controls
      if (e.target !== this.dockEl) return;
      this.resetPosition();
    });

    // Phase 9: Pause/resume loop on tab visibility change
  const onVis = () => { this.refreshLoopRunning(); };
  document.addEventListener('visibilitychange', onVis);
  this.unsubs.push(() => document.removeEventListener('visibilitychange', onVis));

    // Phase 10: keyboard shortcut to open/toggle chat (default Alt+A)
    const hotkey = (this.opts.hotkey || 'Alt+A').toLowerCase();
    const hot = this.parseHotkey(hotkey);
  const onHotkey = (ev: KeyboardEvent) => {
      // Ignore if user is typing without modifiers
      const target = ev.target as HTMLElement | null;
      const tag = (target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || (target?.isContentEditable ?? false);
      if (typing && !(ev.altKey || ev.ctrlKey || ev.metaKey)) return;
      if (this.matchHotkey(ev, hot)) {
        ev.preventDefault();
        const anyWin = window as unknown as { assistantWidgetInstance?: { open?: () => void; close?: () => void; isOpen?: boolean } };
        const isOpen = !!anyWin.assistantWidgetInstance?.isOpen;
        if (isOpen && anyWin.assistantWidgetInstance?.close) {
          anyWin.assistantWidgetInstance.close();
        } else if (anyWin.assistantWidgetInstance?.open) {
          anyWin.assistantWidgetInstance.open();
          setTimeout(() => {
            const input = document.querySelector('.assistant-widget__input') as HTMLInputElement | null;
            input?.focus?.();
          }, 50);
        }
      }
  };
  window.addEventListener('keydown', onHotkey);
  this.unsubs.push(() => window.removeEventListener('keydown', onHotkey));
  }

  private injectStyles() {
    if (document.getElementById('aa-styles')) return;
    const style = document.createElement('style');
    style.id = 'aa-styles';
    style.textContent = `
      :root {
        --aa-accent: #0ea5e9;
        --aa-glow: rgba(14,165,233,0.35);
        --aa-card-radius: 16px;
        --aa-shadow: 0 8px 30px rgba(0,0,0,0.12);
        --aa-z: 9998;
        --aa-size: 88px;
      }

      @media (prefers-color-scheme: dark) {
        :root { --aa-glow: rgba(56,189,248,0.35); }
      }

      .aa-dock {
        position: fixed;
        right: calc(var(--aa-dock-right, 20px));
        bottom: calc(var(--aa-dock-bottom, 20px) + env(safe-area-inset-bottom, 0px));
        z-index: var(--aa-z);
        width: calc(var(--aa-size) + 24px);
        height: calc(var(--aa-size) + 24px);
        display: grid;
        place-items: center;
        padding: 12px;
        border-radius: var(--aa-card-radius);
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: var(--aa-shadow);
        cursor: grab;
        user-select: none;
  transition: right 180ms ease, bottom 180ms ease;
      }
      .aa-dock.aa-grabbing { cursor: grabbing; }
  .aa-dock.aa-static { cursor: default; }

      @media (prefers-color-scheme: dark) {
        .aa-dock { background: rgba(17, 24, 39, 0.1); border-color: rgba(255,255,255,0.1); }
      }

      @media (max-width: 480px) {
        .aa-dock { bottom: calc(56px + env(safe-area-inset-bottom, 0px)); }
      }

      .aa-avatar-btn {
        all: unset;
        display: inline-grid;
        place-items: end center;
        width: var(--aa-size);
        height: var(--aa-size);
        cursor: pointer;
        user-select: none;
        outline: none;
      }

      .aa-avatar-btn:focus-visible { box-shadow: 0 0 0 3px rgba(14,165,233,0.45); border-radius: 12px; }

      .aa-avatar-figure { position: relative; width: 100%; height: 100%; display: grid; place-items: end center; }
      .aa-avatar-img { width: 76px; height: auto; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25)); transform-origin: 50% 85%; will-change: transform, opacity; }
      .aa-glow { position: absolute; bottom: 6px; width: 56%; height: 10px; border-radius: 999px; background: radial-gradient(ellipse at center, var(--aa-glow), transparent 70%); opacity: 0.9; }

      /* Phase 6: tiny notification dot */
      .aa-dot {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #ef4444; /* red-500 */
        box-shadow: 0 0 0 0 rgba(239,68,68,0.6);
        transition: opacity 200ms ease, transform 200ms ease;
      }
      @keyframes aa-dot-pulse {
        0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
        70% { box-shadow: 0 0 0 8px rgba(239,68,68,0.0); }
        100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.0); }
      }
      .aa-dot--active { opacity: 1 !important; transform: scale(1); }
      .aa-dot--blink { animation: aa-dot-pulse 1.6s ease-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .aa-glow { display: none; }
      }

      /* Phase 10: a11y visual hide */
      .aa-visually-hidden {
        position: absolute !important;
        width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
      }

      /* Phase 5: bubble */
      .aa-bubble {
        position: absolute;
        bottom: calc(100% - 4px);
        left: 50%;
        transform: translate(-50%, 6px);
        background: rgba(255,255,255,0.95);
        color: #0f172a;
        padding: 8px 10px;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        font-size: 12px;
        line-height: 1.2;
        max-width: 200px;
        text-align: center;
        transition: opacity 240ms ease, transform 240ms ease;
        will-change: opacity, transform;
      }
      .aa-bubble::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: rgba(255,255,255,0.95);
      }
      @media (prefers-color-scheme: dark) {
        .aa-bubble { background: rgba(17,24,39,0.92); color: #e5e7eb; }
        .aa-bubble::after { border-top-color: rgba(17,24,39,0.92); }
      }

      /* Phase 11: quick actions menu */
      .aa-menu {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%) translateY(6px);
        background: rgba(255,255,255,0.98);
        color: #0f172a;
        border-radius: 12px;
        box-shadow: 0 12px 28px rgba(0,0,0,0.14);
        min-width: 180px;
        padding: 6px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 200ms ease, transform 200ms ease;
        z-index: 2;
      }
      .aa-menu--open { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }
      .aa-menu__item {
        display: flex; align-items: center; gap: 8px;
        width: 100%;
        padding: 8px 10px;
        border: 0; background: transparent; color: inherit; text-align: left; border-radius: 8px;
        cursor: pointer; font-size: 13px;
      }
      .aa-menu__item:hover, .aa-menu__item:focus { background: rgba(14,165,233,0.12); outline: none; }
      @media (prefers-color-scheme: dark) {
        .aa-menu { background: rgba(17,24,39,0.96); color: #e5e7eb; }
        .aa-menu__item:hover, .aa-menu__item:focus { background: rgba(56,189,248,0.12); }
      }
    `;
    document.head.appendChild(style);
  }

  private updatePointer(e: PointerEvent) {
    const rect = this.dockEl!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const nx = Math.min(1, Math.max(0, x));
    this.pointerX = nx * 2 - 1; // -1..1
  }

  private scheduleNextGesture() {
    const now = performance.now();
    const waitMs = 10000 + Math.random() * 5000; // 10-15s
    this.nextGestureAt = now + waitMs;
  }

  private loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min(48, now - this.lastTime); // clamp delta
    this.lastTime = now;

    const img = this.dockEl?.querySelector('.aa-avatar-img') as HTMLImageElement | null;
    if (!img) return;

    // Idle breathing scale (gentle)
    const t = (now - this.startTime) / 1000; // seconds
    const breath = Math.sin(t * Math.PI * 2 * this.idleBreathSpeed) * 0.015; // +/- 0.015
    const targetScale = 1 + breath;

    // Hover lean toward pointer
    const maxLean = 6; // deg
    const targetLean = this.hoverActive ? this.pointerX * maxLean : 0;

    // Random head tilt gesture when idle (no hover)
    if (!this.hoverActive && this.tiltTime <= 0 && now >= this.nextGestureAt) {
      this.tiltTime = 700; // ms total
      this.tiltDir = Math.random() > 0.5 ? 1 : -1;
      this.scheduleNextGesture();
    }
    if (this.tiltTime > 0) {
      this.tiltTime -= dt;
    }
    const tiltPhase = this.tiltTime > 0 ? 1 - Math.abs((this.tiltTime - 350) / 350) : 0; // ease in-out shape 0..1
    const tiltDeg = tiltPhase * 4 * this.tiltDir; // up to 4deg

    // Smoothly approach targets (lerp)
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    this.scale = lerp(this.scale || 1, targetScale, 0.12);
    this.lean = lerp(this.lean || 0, targetLean, 0.15);

    // Phase 4: Patrol trigger after inactivity
    if (this.opts.patrol && !this.patrolling && !this.hoverActive) {
      if (now - this.userLastActive >= this.inactivityThreshold) {
        this.patrolling = true;
        this.patrolElapsed = 0;
      }
    }

    // Compute patrol offsets
    let targetOffsetX = 0;
    let targetOffsetY = 0;
    if (this.patrolling) {
      this.patrolElapsed += dt;
      const p = Math.min(1, this.patrolElapsed / this.patrolDuration);
      const theta = p * Math.PI * 2; // one full cycle left->right->left
      targetOffsetX = Math.sin(theta) * this.patrolAmplitude;
      const stepTheta = (now - this.startTime) / 1000 * this.stepHz * Math.PI * 2;
      targetOffsetY = Math.abs(Math.sin(stepTheta)) * this.stepAmplitude;
      if (p >= 1) {
        this.patrolling = false; // finish loop and return
      }
    }

    // Ease offsets back to rest when not patrolling
    this.patrolOffsetX = lerp(this.patrolOffsetX, targetOffsetX, 0.18);
    this.patrolOffsetY = lerp(this.patrolOffsetY, targetOffsetY, 0.2);

    const rot = this.lean + tiltDeg;
    img.style.transform = `translateZ(0) translate(${this.patrolOffsetX.toFixed(1)}px, ${(-this.patrolOffsetY).toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${this.scale.toFixed(3)})`;

    // Phase 5: bubble hints
    if (this.opts.bubbleHints) {
      this.updateBubble(now);
    }
    // schedule next frame
    this.rafId = requestAnimationFrame(this.loop);
  };

  // Phase 9: loop control and visibility-aware scheduling
  private running = false;
  private visibleInViewport = true;

  private startLoop() {
    if (this.reducedMotion || this.running) return;
    this.running = true;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.rafId = requestAnimationFrame(this.loop);
  }

  private stopLoop() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  private refreshLoopRunning() {
    if (this.reducedMotion) return;
    const docVisible = !document.hidden;
    if (docVisible && this.visibleInViewport) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  private defaultOpenChat(): boolean {
    try {
      const anyWin = window as unknown as { assistantWidgetInstance?: { open?: () => void } };
      if (anyWin.assistantWidgetInstance?.open) {
        anyWin.assistantWidgetInstance.open();
        return true;
      }
    } catch {}
    return false;
  }

  private markActive() {
    this.userLastActive = performance.now();
    if (this.patrolling) this.patrolling = false;
    if (this.bubbleVisible) this.hideBubble();
  }

  // Phase 6: notification dot helpers
  private showDot() {
    if (!this.dotEl) return;
    this.dotEl.classList.add('aa-dot--active');
    if (!this.reducedMotion) this.dotEl.classList.add('aa-dot--blink');
  this.avatarButtonEl?.setAttribute('title', 'Assistant has a new message');
  if (this.liveEl) this.liveEl.textContent = 'New assistant reply available';
  }

  private hideDot() {
    if (!this.dotEl) return;
    this.dotEl.classList.remove('aa-dot--active');
    this.dotEl.classList.remove('aa-dot--blink');
  this.avatarButtonEl?.setAttribute('title', 'Open assistant');
  }

  // Phase 7: Dragging logic
  private setupDragging() {
    if (!this.dockEl) return;
    const onPointerDown = (e: PointerEvent) => {
      // Left button or touch only
      if (e.button !== 0 && e.pointerType !== 'touch') return;
      // Allow drag even when starting on avatar, but we’ll suppress click later
      this.dragging = true;
      this.dragStarted = false;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      const style = getComputedStyle(this.dockEl!);
      this.startRight = parseFloat(style.getPropertyValue('--aa-dock-right')) || 20;
      this.startBottom = parseFloat(style.getPropertyValue('--aa-dock-bottom')) || 20;
      this.dockEl!.classList.add('aa-grabbing');
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp, { passive: true, once: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true, once: true });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.dragging || !this.dockEl) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      if (!this.dragStarted && Math.hypot(dx, dy) > 6) {
        this.dragStarted = true;
      }
      if (!this.dragStarted) return;

      const rect = this.dockEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Update right/bottom: moving right decreases right gap
      let newRight = this.startRight - dx;
      let newBottom = this.startBottom - dy;
      // Clamp so the dock stays on-screen with margin 8px
      const margin = 8;
      const maxRight = Math.max(margin, vw - rect.width - margin);
      const maxBottom = Math.max(margin, vh - rect.height - margin);
      newRight = Math.min(Math.max(newRight, margin), maxRight);
      newBottom = Math.min(Math.max(newBottom, margin), maxBottom);
      this.dockEl.style.setProperty('--aa-dock-right', `${newRight.toFixed(0)}px`);
      this.dockEl.style.setProperty('--aa-dock-bottom', `${newBottom.toFixed(0)}px`);
    };

  const onPointerUp = () => {
      if (!this.dragging) return;
      const wasDragging = this.dragStarted;
      this.dragging = false;
      this.dockEl!.classList.remove('aa-grabbing');
      window.removeEventListener('pointermove', onPointerMove);
      if (wasDragging) {
        // Persist position
        const style = getComputedStyle(this.dockEl!);
        const right = parseFloat(style.getPropertyValue('--aa-dock-right')) || this.startRight;
        const bottom = parseFloat(style.getPropertyValue('--aa-dock-bottom')) || this.startBottom;
        this.savePosition(right, bottom);
        this.lastDragAt = Date.now();
        // If chat is open, mark moved to avoid auto-restore
        const panelOpen = document.querySelector('.assistant-widget__panel--open');
        if (panelOpen) this.movedSinceOpen = true;
      } else {
        // Do not suppress click when it was just a tap/click without drag
        this.lastDragAt = 0;
      }
      this.dragStarted = false;
    };

    // Attach to dock (start area). We keep it on dock to allow easy grab.
    this.dockEl.addEventListener('pointerdown', onPointerDown);
  }

  private savePosition(right: number, bottom: number) {
    try { localStorage.setItem(this.posStorageKey, JSON.stringify({ right, bottom })); } catch {}
  }

  private loadSavedPosition(): { right: number; bottom: number } | null {
    try {
      const raw = localStorage.getItem(this.posStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.right === 'number' && typeof parsed?.bottom === 'number') return parsed;
    } catch {}
    return null;
  }

  private resetPosition() {
    if (!this.dockEl) return;
    const right = this.opts.position!.right ?? 20;
    const bottom = this.opts.position!.bottom ?? 20;
    this.setDockPos(right, bottom);
    try { localStorage.removeItem(this.posStorageKey); } catch {}
  }

  private setDockPos(right: number, bottom: number) {
    if (!this.dockEl) return;
    this.dockEl.style.setProperty('--aa-dock-right', `${right}px`);
    this.dockEl.style.setProperty('--aa-dock-bottom', `${bottom}px`);
  }

  // Phase 8: Avoid overlap with chat panel on open
  private avoidOverlapWithChat() {
    if (!this.dockEl) return;
    const panel = document.querySelector('.assistant-widget__panel');
    if (!panel) return;
    const panelOpen = document.querySelector('.assistant-widget__panel--open');
    if (!panelOpen) return;

    // Save current position if not saved yet
    if (!this.preChatPos) {
      const style = getComputedStyle(this.dockEl);
      const right = parseFloat(style.getPropertyValue('--aa-dock-right')) || 20;
      const bottom = parseFloat(style.getPropertyValue('--aa-dock-bottom')) || 20;
      this.preChatPos = { right, bottom };
    }

    const dockRect = this.dockEl.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    if (!this.rectsOverlap(dockRect, panelRect)) return; // no need to move
  // UX: slide horizontally to the left edge, keep current bottom if possible
  const margin = 12;
  const vw = window.innerWidth;
  const dw = dockRect.width;
  const style = getComputedStyle(this.dockEl);
  const currentBottom = parseFloat(style.getPropertyValue('--aa-dock-bottom')) || 20;
  // right distance to place dock near left edge
  const leftRight = Math.max(margin, vw - dw - margin);
  this.setDockPos(leftRight, Math.max(margin, currentBottom));
  }

  private rectsOverlap(a: DOMRect, b: DOMRect) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  private overlapArea(a: DOMRect, b: DOMRect) {
    const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return x * y;
  }

  private distanceBetweenRects(a: DOMRect, b: DOMRect) {
    // Distance between centers
    const acx = (a.left + a.right) / 2;
    const acy = (a.top + a.bottom) / 2;
    const bcx = (b.left + b.right) / 2;
    const bcy = (b.top + b.bottom) / 2;
    const dx = acx - bcx;
    const dy = acy - bcy;
    return Math.hypot(dx, dy);
  }

  private rectAtPosition(dw: number, dh: number, right: number, bottom: number, vw: number, vh: number): DOMRect {
    // Translate right/bottom into viewport x/y
    const x = vw - right - dw;
    const y = vh - bottom - dh;
    return {
      x,
      y,
      left: x,
      top: y,
      right: x + dw,
      bottom: y + dh,
      width: dw,
      height: dh,
      toJSON: () => ({})
    } as DOMRect;
  }

  // Phase 10: hotkey parsing/matching
  private parseHotkey(h: string) {
    const parts = h.split('+').map((p) => p.trim());
    const mods = { alt: false, ctrl: false, shift: false, meta: false };
    let key = '';
    for (const p of parts) {
      const pl = p.toLowerCase();
      if (pl === 'alt') mods.alt = true;
      else if (pl === 'ctrl' || pl === 'control') mods.ctrl = true;
      else if (pl === 'shift') mods.shift = true;
      else if (pl === 'meta' || pl === 'cmd' || pl === 'command' || pl === 'win') mods.meta = true;
      else key = pl;
    }
    return { ...mods, key };
  }

  private matchHotkey(e: KeyboardEvent, hot: { alt: boolean; ctrl: boolean; shift: boolean; meta: boolean; key: string }) {
    if (hot.alt !== e.altKey) return false;
    if (hot.ctrl !== e.ctrlKey) return false;
    if (hot.shift !== e.shiftKey) return false;
    if (hot.meta !== e.metaKey) return false;
    const ek = e.key.toLowerCase();
    return hot.key === ek;
  }

  // Phase 5: bubble helpers
  private scheduleNextBubble() {
    const now = performance.now();
    const wait = 20000 + Math.random() * 10000; // 20–30s
    this.nextBubbleAt = now + wait;
  }

  private pickHint(): string {
    let idx = Math.floor(Math.random() * this.hints.length);
    if (idx === this.lastHintIdx) idx = (idx + 1) % this.hints.length;
    this.lastHintIdx = idx;
    return this.hints[idx];
  }

  private isChatOpen(): boolean {
    try {
      const w = window as unknown as { assistantWidgetInstance?: { isOpen?: boolean } };
      return !!w.assistantWidgetInstance?.isOpen;
    } catch { return false; }
  }

  private showBubble(text: string) {
    if (!this.bubbleEl) return;
    this.bubbleEl.textContent = text;
    this.bubbleEl.style.opacity = '1';
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.bubbleEl.style.transform = 'translate(-50%, 0)';
    }
    this.bubbleVisible = true;
  }

  private hideBubble() {
    if (!this.bubbleEl) return;
    this.bubbleEl.style.opacity = '0';
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.bubbleEl.style.transform = 'translate(-50%, 6px)';
    }
    this.bubbleVisible = false;
  }

  private updateBubble(now: number) {
    const quiet = now - this.userLastActive > 3000;
    if (!this.bubbleVisible) {
      if (!this.isChatOpen() && !this.hoverActive && !this.patrolling && quiet && now >= this.nextBubbleAt) {
        this.showBubble(this.pickHint());
        setTimeout(() => this.hideBubble(), this.bubbleDuration);
        this.scheduleNextBubble();
      }
    }
  }

  // Phase 11: quick menu
  private initMenu() {
    if (!this.dockEl) return;
    this.menuEl = document.createElement('div');
    this.menuEl.className = 'aa-menu';
    this.menuEl.setAttribute('role', 'menu');
    this.menuEl.setAttribute('aria-label', 'Assistant quick actions');
    const items = [
      { label: 'Show resume', q: 'resume' },
      { label: 'Top skills', q: 'skills' },
      { label: 'Recent projects', q: 'projects' },
      { label: 'Contact info', q: 'contact' },
    ];
    for (const it of items) {
      const btn = document.createElement('button');
      btn.className = 'aa-menu__item';
      btn.type = 'button';
      btn.setAttribute('role', 'menuitem');
      btn.textContent = it.label;
      btn.addEventListener('click', () => {
        this.toggleMenu(false);
        // Ask the assistant directly; open chat if closed for visibility
        try {
          const anyWin = window as unknown as {
            AssistantWidget?: { ask?: (q: string) => void },
            assistantWidgetInstance?: { open?: () => void }
          };
          anyWin.AssistantWidget?.ask?.(it.q);
          anyWin.assistantWidgetInstance?.open?.();
          setTimeout(() => {
            const input = document.querySelector('.assistant-widget__input') as HTMLInputElement | null;
            input?.focus?.();
          }, 80);
        } catch {}
      });
      this.menuEl.appendChild(btn);
    }
    this.dockEl.appendChild(this.menuEl);

    // Close on outside click or Escape
  const onDocClick = (e: MouseEvent) => {
      if (!this.menuOpen) return;
      const t = e.target as Node;
      if (this.menuEl && !this.menuEl.contains(t) && !this.avatarButtonEl?.contains(t)) {
        this.toggleMenu(false);
      }
  };
  document.addEventListener('click', onDocClick);
  this.unsubs.push(() => document.removeEventListener('click', onDocClick));
  const onDocKey = (e: KeyboardEvent) => {
      if (!this.menuOpen) return;
      if (e.key === 'Escape') { this.toggleMenu(false); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const focusables = Array.from(this.menuEl!.querySelectorAll<HTMLButtonElement>('.aa-menu__item'));
        const idx = focusables.findIndex((el) => el === document.activeElement);
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        const next = (idx + dir + focusables.length) % focusables.length;
        focusables[next]?.focus();
      }
  };
  document.addEventListener('keydown', onDocKey);
  this.unsubs.push(() => document.removeEventListener('keydown', onDocKey));
  }

  private toggleMenu(open: boolean) {
    if (!this.menuEl) return;
    this.menuOpen = open;
    if (open) {
      this.menuEl.classList.add('aa-menu--open');
      const first = this.menuEl.querySelector<HTMLButtonElement>('.aa-menu__item');
      first?.focus();
    } else {
      this.menuEl.classList.remove('aa-menu--open');
      this.avatarButtonEl?.focus?.();
    }
  }

  // Phase 12: destroy and cleanup
  public destroy() {
    try { this.stopLoop(); } catch {}
    try { this.observer?.disconnect(); } catch {}
    try { this.viewObserver?.disconnect(); } catch {}
    if (this.longPressTimer) { try { window.clearTimeout(this.longPressTimer); } catch {}; this.longPressTimer = null; }
    // Remove global listeners
    for (const u of this.unsubs.splice(0)) {
      try { u(); } catch {}
    }
    // Remove DOM
    if (this.dockEl && this.dockEl.parentNode) {
      try { this.dockEl.parentNode.removeChild(this.dockEl); } catch {}
    }
    // Null refs
    this.containerEl = null;
    this.dockEl = null;
    this.avatarButtonEl = null;
    this.dotEl = null;
    this.bubbleEl = null;
    this.liveEl = null;
  }
}

// Global initializer for non-React usage
declare global {
  interface Window { AvatarAssistant?: { init: (options?: AvatarAssistantOptions) => AvatarAssistantCore } }
}

if (typeof window !== 'undefined') {
  window.AvatarAssistant = {
    init: (options: AvatarAssistantOptions = {}) => new AvatarAssistantCore(options),
  };
}

export default AvatarAssistantCore;
