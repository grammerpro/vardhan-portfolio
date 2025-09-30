/**
 * Setup script for the Assistant Widget
 * Run this to copy necessary files to the public directory
 */

const fs = require('fs');
const path = require('path');

// Copy knowledge base to public directory
const sourcePath = path.join(__dirname, 'src/assistant-widget/kb-user.json');
const destPath = path.join(__dirname, 'public/src/assistant-widget/kb-user.json');

try {
  // Create directory if it doesn't exist
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  console.log('✅ Knowledge base copied to public directory');
  console.log('📍 Location:', destPath);
} catch (error) {
  console.error('❌ Failed to copy knowledge base:', error);
}
