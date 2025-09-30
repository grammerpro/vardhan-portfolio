# Vardhan's Portfolio

A modern, light-themed portfolio website built with Next.js, featuring Three.js animations, smooth parallax effects, and optimized performance.

## Features

- **Light Theme**: Clean design with soft gradients and pastel colors
- **Three.js Hero**: Interactive 3D keyboard model with smooth animations
- **Parallax Effects**: Subtle background movements for depth
- **Scroll Snap**: Magnetic section transitions
- **Responsive Design**: Optimized for all devices
- **Performance Optimized**: Fast loading with Core Web Vitals in mind
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **SEO Ready**: Meta tags and structured data included

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion
- **Fonts**: Inter (Google Fonts)
- **Deployment**: Vercel/Netlify ready

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Project Structure

```
my-portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   └── lib/
│       └── queries.ts
├── public/
│   ├── models/
│   │   └── keyboard.glb
│   └── images/
└── package.json
```

## Customization

### Theme Configuration

Edit the color scheme in `src/app/globals.css` or create a config file:

```javascript
// config/theme.js
export const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#1f2937'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  }
}
```

### Adding Projects

Update the projects array in `src/components/ProjectsSection.tsx`:

```javascript
const projects = [
  {
    id: 1,
    title: 'Your Project',
    category: 'Web',
    description: 'Project description',
    image: '/path/to/image.jpg',
    tags: ['React', 'Next.js']
  }
  // Add more projects...
]
```

### 3D Model Replacement

Replace the keyboard model in `public/models/keyboard.glb` with your own glTF model. Update the import in `src/components/KeyboardModel.tsx` if needed.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Upload the `.next` folder to Netlify
3. Configure build settings if needed

## Performance

- Images are optimized with WebP/AVIF formats
- Lazy loading implemented for images
- Core Web Vitals optimized
- Bundle size minimized

## SEO

- Meta tags configured in `layout.tsx`
- Open Graph tags for social sharing
- Structured data included
- Sitemap generation ready

## Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast meets WCAG AA standards

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

Vardhan - [your.email@example.com](mailto:your.email@example.com)

Project Link: [https://github.com/yourusername/portfolio](https://github.com/yourusername/portfolio)

## Avatar Assistant – Phase 1

- Glassmorphism dock in bottom-right
- Static avatar image (lazy-loaded)
- Global init: `window.AvatarAssistant.init(options)`

Files:
- `src/avatar/index.ts` – core initializer
- `src/config/avatar.config.ts` – defaults
- `src/assistant/integration.ts` – chat bridge (Phase 2)
- `public/assets/avatar-standing.svg` – avatar art

Demo snippet (paste near end of body):
```html
<script>
  window.AvatarAssistant && window.AvatarAssistant.init({
    container: 'body',
    theme: 'auto',
    avatarUrl: '/assets/avatar-standing.svg',
    position: { right: 24, bottom: 24 }
  });
</script>
```
