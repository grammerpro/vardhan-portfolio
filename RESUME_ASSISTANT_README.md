# Resume Assistant Widget

A browser-based AI assistant that answers questions about a resume using advanced natural language processing. Built entirely in the browser with no external API dependencies.

## Features

- 🤖 **AI-Powered Responses**: Uses Transformers.js for local ML inference
- 🔍 **Smart Search**: Combines BM25 algorithm with cosine similarity for accurate retrieval
- 🎤 **Voice Support**: Optional speech synthesis and recognition
- 📱 **Mobile Responsive**: Works seamlessly across all devices
- ♿ **Accessible**: WCAG compliant with keyboard navigation
- 🎨 **Modern UI**: Glassmorphism design with dark mode support
- 🔒 **Privacy First**: All processing happens locally in the browser
- ⚡ **Fast**: Cached embeddings for quick responses

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Portfolio</title>
  <!-- Include the assistant bundle -->
  <script src="/path/to/assistant-bundle.js"></script>
</head>
<body>
  <!-- Your content here -->

  <script>
    // Initialize the assistant
    window.ResumeAssistant.init({
      displayName: 'Your Name',
      avatarUrl: '/path/to/avatar.png',
      resumeUrl: '/data/resume.md'
    });
  </script>
</body>
</html>
```

### React Integration

```tsx
import ResumeAssistant from './components/ResumeAssistant';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ResumeAssistant
        config={{
          displayName: 'Your Name',
          avatarUrl: '/assets/avatar.png',
          position: { bottom: 24, right: 24 },
          theme: 'auto',
          enableVoice: true,
          resumeUrl: '/data/resume.md'
        }}
        onReady={(assistant) => {
          console.log('Assistant ready!');
        }}
      />
    </div>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `string` | `'body'` | CSS selector for the container element |
| `position` | `object` | `{ bottom: 24, right: 24 }` | Position of the floating button |
| `avatarUrl` | `string` | `'/assets/avatar.png'` | URL to the assistant's avatar image |
| `displayName` | `string` | `'Assistant'` | Name displayed in the chat header |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme preference |
| `resumeUrl` | `string` | `'/data/resume.md'` | URL to the resume markdown file |
| `enableVoice` | `boolean` | `false` | Enable voice synthesis and recognition |
| `useServer` | `boolean` | `false` | Use server-side generation (future feature) |
| `serverUrl` | `string` | `''` | Server URL for enhanced generation |

## Resume Format

The assistant expects a markdown file with the following structure:

```markdown
# Summary
Brief professional summary...

## Skills
- Skill 1
- Skill 2
- Skill 3

## Experience
### Company Name
**Position** (Start Date - End Date)
Description of role and achievements...

## Projects
### Project Name
Description of the project...

## Education
### University Name
**Degree** (Graduation Year)
Relevant coursework or achievements...

## Certifications
- Certification 1 (Issuing Organization, Date)
- Certification 2 (Issuing Organization, Date)
```

## API Reference

### Global Methods

#### `window.ResumeAssistant.init(config?)`
Initialize the assistant with optional configuration.

```javascript
const assistant = await window.ResumeAssistant.init({
  displayName: 'John Doe',
  enableVoice: true
});
```

#### `window.ResumeAssistant.ask(question)`
Ask a question programmatically (requires initialized instance).

```javascript
window.ResumeAssistant.ask('What are your skills?');
```

### Instance Methods

#### `assistant.askQuestion(question)`
Ask the assistant a question programmatically.

```javascript
assistant.askQuestion('Tell me about your experience');
```

#### `assistant.toggle()`
Toggle the chat panel visibility.

#### `assistant.open()`
Open the chat panel.

#### `assistant.close()`
Close the chat panel.

#### `assistant.destroy()`
Clean up the assistant and remove from DOM.

## React Hook

```tsx
import { useResumeAssistant } from './components/ResumeAssistant';

function MyComponent() {
  const { assistant, isReady, error, askQuestion, toggle } = useResumeAssistant({
    displayName: 'Your Name',
    enableVoice: true
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <button onClick={() => askQuestion('Hello!')} disabled={!isReady}>
        Ask Question
      </button>
      <button onClick={toggle}>Toggle Assistant</button>
    </div>
  );
}
```

## Technical Details

### Architecture

1. **Resume Processing**: Markdown parsing and chunking (700 chars with 150 overlap)
2. **Embeddings Generation**: Uses `all-MiniLM-L6-v2` model via Transformers.js
3. **Search Pipeline**:
   - BM25 scoring for keyword matching
   - Cosine similarity for semantic matching
   - Combined ranking for optimal results
4. **Answer Generation**: Template-based responses with citations
5. **Caching**: LocalStorage for embeddings and processed data

### Dependencies

- **Transformers.js**: Browser-based ML inference
- **Marked.js**: Markdown parsing (included in bundle)
- **Web Speech API**: Voice features (browser native)

### Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Performance

- Initial load: ~5-10 seconds (model download)
- Subsequent loads: ~1-2 seconds (cached)
- Memory usage: ~100-200MB (depending on resume size)
- Response time: ~500ms-2s (after initial load)

## Development

### Building the Bundle

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development server
npm run dev
```

### File Structure

```
src/
├── assistant/
│   ├── index.ts          # Main widget class
│   ├── rag.ts            # RAG pipeline implementation
│   ├── template.ts       # HTML templates
│   └── ui.css            # Styles
├── components/
│   └── ResumeAssistant.tsx # React wrapper
└── data/
    └── resume.md         # Resume data
```

## Customization

### Styling

The widget uses CSS custom properties for easy theming:

```css
.resume-assistant {
  --assistant-primary: #0ea5e9;
  --assistant-secondary: #6366f1;
  --assistant-accent: #f59e0b;
  --assistant-radius: 16px;
  --assistant-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

### Voice Configuration

```javascript
const assistant = await window.ResumeAssistant.init({
  enableVoice: true,
  // Voice settings are handled automatically
  // Uses system default voice or first available English voice
});
```

## Troubleshooting

### Common Issues

1. **Model loading fails**
   - Check network connection
   - Ensure sufficient memory (~200MB free)
   - Try refreshing the page

2. **Voice not working**
   - Check browser permissions for microphone
   - Ensure HTTPS (required for speech recognition)
   - Some browsers don't support Web Speech API

3. **Styling conflicts**
   - The widget is scoped to `.resume-assistant`
   - Check for CSS specificity issues
   - Use the provided CSS custom properties

### Debug Mode

Enable debug logging:

```javascript
localStorage.setItem('resume-assistant-debug', 'true');
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review the browser console for errors
- Ensure all dependencies are properly loaded

---

Built with ❤️ using TypeScript, Transformers.js, and modern web technologies.
