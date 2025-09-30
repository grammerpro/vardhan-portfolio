/**
 * Resume Assistant Bundle Builder
 * Combines all assistant files into a single deployable bundle
 */

const fs = require('fs');
const path = require('path');

function buildBundle() {
  const baseDir = path.join(__dirname, 'src', 'assistant');
  const outputDir = path.join(__dirname, 'public', 'assets');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Files to include in bundle
  const files = [
    'rag.ts',
    'template.ts',
    'index.ts'
  ];

  let bundle = `/**
 * Resume Assistant Widget Bundle
 * Generated: ${new Date().toISOString()}
 * A browser-based AI assistant for resume Q&A
 */

// TypeScript declarations for browser compatibility
declare const self: any;

// Polyfills for older browsers
if (typeof globalThis === 'undefined') {
  (self as any).globalThis = self;
}

// Transformers.js CDN (will be loaded dynamically)
const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// Load dependencies
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(\`Failed to load \${src}\`));
    document.head.appendChild(script);
  });
}

async function loadDependencies(): Promise<void> {
  try {
    await loadScript(TRANSFORMERS_CDN);
    console.log('Transformers.js loaded successfully');
  } catch (error) {
    console.error('Failed to load dependencies:', error);
    throw error;
  }
}

// Bundle content will be inserted here
`;

  // Read and concatenate all TypeScript files
  for (const file of files) {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Remove import/export statements and add to bundle
      const processedContent = content
        .replace(/import\s+.*from\s+['"].*['"];?\s*/g, '')
        .replace(/export\s+(default\s+)?/g, '')
        .replace(/export\s+type\s+.*;\s*/g, '')
        .replace(/export\s+interface\s+.*\{[\s\S]*?\};?\s*/g, '')
        .replace(/export\s+const\s+.*=.*;\s*/g, '');

      bundle += `\n// ===== ${file} =====\n${processedContent}\n`;
    }
  }

  // Add initialization code
  bundle += `

// ===== Initialization =====
let dependenciesLoaded = false;

async function initializeBundle(): Promise<void> {
  if (!dependenciesLoaded) {
    await loadDependencies();
    dependenciesLoaded = true;
  }
}

// Auto-initialize if script is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeBundle().catch(console.error);
  });
} else {
  initializeBundle().catch(console.error);
}

// Export to global scope
(self as any).ResumeAssistant = {
  init: async (config?: any) => {
    await initializeBundle();
    const assistant = new ResumeAssistant(config);
    await assistant.initialize();
    return assistant;
  },
  ask: (question: string) => {
    console.warn('Assistant not initialized. Use ResumeAssistant.init() first.');
  }
};

console.log('Resume Assistant Widget loaded successfully');
`;

  // Write bundle file
  const bundlePath = path.join(outputDir, 'resume-assistant-bundle.js');
  fs.writeFileSync(bundlePath, bundle);

  console.log(`Bundle created: ${bundlePath}`);
  console.log(`Bundle size: ${(bundle.length / 1024).toFixed(2)} KB`);
}

// Run if called directly
if (require.main === module) {
  buildBundle();
}

module.exports = { buildBundle };
