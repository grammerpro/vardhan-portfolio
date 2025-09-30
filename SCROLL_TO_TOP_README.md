# Scroll to Top Rocket Component

A floating rocket scroll-to-top button for the portfolio website.

## Features

- Appears after scrolling down 200px
- Smooth scroll to top with rocket launch animation
- Theme-aware glow (sky blue in light mode, fuchsia in dark mode)
- Respects `prefers-reduced-motion`
- Fully accessible with keyboard support
- Mobile friendly

## Usage

The component is automatically mounted in `layout.tsx` and appears on all pages.

## Customization

Edit `src/config/scrollToTop.ts` to customize:

```typescript
export const scrollToTopConfig = {
  size: 48, // Size in pixels
  offset: { bottom: 24, left: 24 }, // Offset from edges in pixels
};
```

## Props

- `size`: Button size in pixels (default: 48)
- `offset`: Object with `bottom` and `left` offsets in pixels

## Accessibility

- `aria-label="Scroll to top"`
- Keyboard operable (Enter/Space)
- Respects `prefers-reduced-motion`
