# Assistant Widget

A production-ready, Bitmoji-style chat assistant widget that can be easily integrated into any website or React/Next.js application.

## Features

- 🎯 **Floating Action Button** - Clean, accessible button with avatar
- 💬 **Smart Q&A** - Answers questions from a local knowledge base
- 🔍 **Fuzzy Matching** - Intelligent question matching and suggestions
- 🎤 **Voice Support** - Optional speech synthesis and recognition
- 📱 **Mobile Friendly** - Responsive design with keyboard avoidance
- ♿ **Accessible** - Full keyboard navigation and screen reader support
- 🎨 **Theming** - Light/dark mode with system preference detection
- 💾 **Persistent State** - Remembers conversation state in localStorage
- ⚡ **Performance Optimized** - Lazy loading and minimal bundle size

## Quick Start

### Plain HTML/JavaScript

1. **Include the files:**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/assistant.css">
</head>
<body>
  <!-- Your content -->

  <script src="path/to/assistant-widget/index.js"></script>
  <script>
    // Initialize the widget
    window.AssistantWidget.init({
      kbUrl: 'path/to/kb-user.json',
      avatarUrl: 'path/to/avatar.png',
      agentName: 'Your Name'
    });
  </script>
</body>
</html>
```

2. **Ask questions programmatically:**
```javascript
// Ask a question
window.AssistantWidget.ask("What are your skills?");

// Open the widget
window.AssistantWidget.init().then(widget => widget.open());
```

### React/Next.js

1. **Import and use the component:**
```tsx
import AssistantWidget from './src/react/AssistantWidget';

export default function App() {
  return (
    <div>
      {/* Your app content */}
      <AssistantWidget
        theme="auto"
        kbUrl="/src/assistant-widget/kb-user.json"
        avatarUrl="/assets/avatar.png"
        agentName="Your Name"
        enableVoice={false}
      />
    </div>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | string | `'body'` | CSS selector for container element |
| `position` | object | `{bottom: 20, right: 20}` | Position offset from container edges |
| `avatarUrl` | string | `'/assets/avatar.png'` | Path to avatar image |
| `agentName` | string | `'Vardhan'` | Display name for the assistant |
| `theme` | string | `'auto'` | Theme: 'light', 'dark', or 'auto' |
| `kbUrl` | string | `'/src/assistant-widget/kb-user.json'` | Path to knowledge base JSON |
| `enableVoice` | boolean | `false` | Enable voice features |

## Knowledge Base Format

Edit `src/assistant-widget/kb-user.json` to customize the assistant's knowledge:

```json
{
  "profile": {
    "fullName": "Your Name",
    "age": "Your Age",
    "location": "Your Location",
    "roles": ["Your Role", "Another Role"]
  },
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Area to improve 1", "Area to improve 2"],
  "faqs": [
    {
      "q": "Question text",
      "a": "Answer text"
    }
  ]
}
```

## File Structure

```
src/
├── assistant-widget/
│   ├── index.js                 # Main widget logic
│   ├── assistant.css            # Styles
│   ├── assistant-html-template.js # HTML templates
│   └── kb-user.json            # Knowledge base
├── react/
│   └── AssistantWidget.tsx     # React wrapper
└── assets/
    ├── avatar.png              # Avatar image
    └── avatar.svg              # SVG fallback
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Voice Features

When `enableVoice` is true and supported:

- **Speech Synthesis**: Click the speaker icon to hear responses
- **Speech Recognition**: Click the microphone to speak questions
- **Auto-play**: Responses are spoken automatically (respects `prefers-reduced-motion`)

## Accessibility

- Full keyboard navigation (Tab, Enter, Space, Escape)
- Screen reader announcements
- Focus management and trapping
- High contrast support
- Reduced motion support

## Performance

- Lazy initialization
- Minimal DOM manipulation
- CSS transforms for animations
- No external dependencies
- Small bundle size (~15KB gzipped)

## Development

1. **Clone and customize:**
   - Edit `kb-user.json` with your information
   - Replace avatar images in `/public/assets/`
   - Modify styles in `assistant.css`

2. **Integration:**
   - Copy the `src/assistant-widget/` folder to your project
   - Include the CSS and JS files
   - Initialize with your configuration

3. **React Integration:**
   - Copy `src/react/AssistantWidget.tsx`
   - Import and use as a component

## License

MIT License - feel free to use in personal and commercial projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Need help?** The widget includes comprehensive error handling and console logging for debugging.
