import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 720 }, reducedMotion: 'reduce' });
const output = 'public/images/evidence';
const slugs = ['java-native-rag', 'chroma-loop', 'anon-dapp', 'aura-landing', 'pdf-editor-tool', 'blockchain-storage'];
for (const slug of slugs) {
  const svg = readFileSync(`${output}/${slug}.svg`, 'utf8');
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: `${output}/${slug}-social.png` });
}

// These previews run from inspected public clones, never from a private project.
const captures = [];
for (const [slug, url] of [['chroma-loop', 'http://127.0.0.1:4178/'], ['anon-dapp', 'http://127.0.0.1:4177/']]) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 720 }, reducedMotion: 'reduce' });
  const preview = await context.newPage();
  const errors = [];
  preview.on('pageerror', (error) => errors.push(error.message));
  try {
    const response = await preview.goto(url, { waitUntil: 'networkidle' });
    if (slug === 'chroma-loop') {
      await preview.getByRole('button', { name: 'Daily Challenge', exact: true }).click();
      await preview.waitForTimeout(900);
    } else {
      await preview.getByRole('button', { name: 'Upload', exact: true }).click();
    }
    await preview.screenshot({ path: `${output}/${slug}-screenshot.png` });
    let localRoundTrip = null;
    if (slug === 'anon-dapp') {
      const sample = 'Disposable portfolio review sample. No personal data.';
      await preview.locator('input[type="file"]').setInputFiles({ name: 'portfolio-review.txt', mimeType: 'text/plain', buffer: Buffer.from(sample) });
      await preview.getByRole('button', { name: 'Start Encrypted Dispersal' }).click();
      await preview.getByText('Asset Successfully Dispersed', { exact: true }).waitFor({ timeout: 30000 });
      const localRecord = await preview.evaluate(async () => {
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open('AnonDappDB', 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const files = await new Promise((resolve, reject) => {
          const request = db.transaction('files').objectStore('files').getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const file = files.find((item) => item.name === 'portfolio-review.txt');
        const decode = (value) => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (char) => char.charCodeAt(0));
        const key = await crypto.subtle.importKey('raw', decode(file.key), 'AES-GCM', true, ['decrypt']);
        const result = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(file.iv) }, key, file.ciphertext);
        db.close();
        return { decrypted: new TextDecoder().decode(result), simulated: file.isSimulated, storedExportedKey: typeof file.key === 'string' };
      });
      if (localRecord.decrypted !== sample) throw new Error('Local encryption/decryption round trip did not match.');
      localRoundTrip = { matchedSample: true, simulatedStorage: localRecord.simulated, storedExportedKey: localRecord.storedExportedKey };
    }
    captures.push({ slug, url, status: response.status(), title: await preview.title(), errors, capture: `${slug}-screenshot.png`, localRoundTrip });
  } catch (error) {
    captures.push({ slug, error: error.message, errors });
  }
  await context.close();
}
writeFileSync('docs/project-evidence-captures.json', JSON.stringify({ date: '2026-09-27', browser: browser.version(), viewport: { width: 1200, height: 720 }, captures }, null, 2));
console.log(JSON.stringify(captures));
await browser.close();
