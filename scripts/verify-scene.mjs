/* Standalone graphics checks. Does not start Next or submit external requests. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import sharp from 'sharp';
import { chromium } from 'playwright';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const capture = process.argv.includes('--capture');
const writePosters = process.argv.includes('--write-posters');
const captureDir = path.join(repo, 'docs', 'screenshots', 'scene-harness');
const html = `<!DOCTYPE html><html><head><style>html{background:#e9e6df}body{margin:0}canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}section{height:900px}#unfold{height:810px}#work{height:2800px}</style><script type="importmap">{"imports":{"three":"/three.module.js"}}</script></head><body><canvas></canvas><section id="hero"></section><section id="unfold"></section><section id="work"></section><section id="capability"></section><section id="about"></section><section id="contact"></section><script type="module">import {createExperienceRenderer} from '/ExperienceRenderer.js'; window.dispose=createExperienceRenderer({canvas:document.querySelector('canvas'),mode:new URLSearchParams(location.search).get('mode')||'full',onReady:()=>document.body.dataset.ready='yes',onFailure:()=>document.body.dataset.fail='yes'})</script></body></html>`;
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/?mode=')) { res.setHeader('Content-Type', 'text/html'); res.end(html); return; }
  if (['/three.module.js', '/three.core.js'].includes(req.url)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(fs.readFileSync(path.join(repo, 'node_modules', 'three', 'build', path.basename(req.url))));
    return;
  }
  const basename = path.basename(req.url, '.js');
  const sourcePath = basename === 'scene-path'
    ? path.join(repo, 'src/lib/scene-path.ts')
    : path.join(repo, 'src/components/experience', basename + '.ts');
  if (!fs.existsSync(sourcePath)) { res.statusCode = 404; res.end('Not found'); return; }
  const source = fs.readFileSync(sourcePath, 'utf8').replace("'@/lib/scene-path'", "'/scene-path.js'").replace("'./SignatureAssembly'", "'/SignatureAssembly.js'");
  res.setHeader('Content-Type', 'application/javascript');
  res.end(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } }).outputText);
});

server.listen(0, '127.0.0.1', async () => {
  let browser;
  const errors = [];
  const results = { mode: 'standalone scene; full quality; DPR 1; no throttling; fresh context; no Next bundle', samples: {} };
  try {
    if (capture) fs.mkdirSync(captureDir, { recursive: true });
    browser = await chromium.launch({ headless: true });
    results.browser = browser.version();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.waitForFunction(() => document.body.dataset.ready === 'yes');
    results.renderer = await page.locator('canvas').evaluate(canvas => {
      const gl = canvas.getContext('webgl2');
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    });
    const sample = async name => {
      await page.waitForTimeout(350);
      results.samples[name] = await page.locator('canvas').evaluate(canvas => ({ ...canvas.dataset }));
      if (capture) await page.screenshot({ path: path.join(captureDir, name + '.png') });
    };
    const poster = async name => {
      if (!writePosters) return;
      await page.evaluate(() => document.documentElement.style.background = 'transparent');
      const screenshot = await page.screenshot({ omitBackground: true });
      const destination = path.join(repo, 'public/signature');
      fs.mkdirSync(destination, { recursive: true });
      await sharp(screenshot).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(destination, name + '.webp'));
    };
    await sample('hero-desktop');
    await poster('hero-desktop');
    await page.evaluate(() => { window.scrollTo(0, 1150); document.documentElement.style.background = '#111315'; });
    await sample('aperture-approach');
    await page.evaluate(() => window.scrollTo(0, 1750));
    await sample('gallery');
    await page.evaluate(() => window.scrollTo(0, 0));
    await sample('reverse-to-hero');
    assert.equal(results.samples['reverse-to-hero'].chapterProgress, '0.000');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.documentElement.style.background = '#e9e6df');
    await sample('hero-mobile');
    await poster('hero-mobile');
    const restingFrame = await page.locator('canvas').getAttribute('data-render-frames');
    await page.waitForTimeout(600);
    assert.equal(await page.locator('canvas').getAttribute('data-render-frames'), restingFrame);
    results.idleFramesStopped = true;
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      window.scrollTo(0, 900);
    });
    await page.waitForTimeout(250);
    assert.equal(await page.locator('canvas').getAttribute('data-render-frames'), restingFrame);
    results.simulatedHiddenFramesStopped = true;
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(250);
    assert.equal(await page.locator('canvas').getAttribute('data-chapter-progress'), '1.000');
    results.resumeReconcilesScroll = true;
    results.pathGeometry = await page.evaluate(async () => {
      const THREE = await import('three');
      const { sampleCamera, smoothstep } = await import('/scene-path.js');
      const { createSignatureAssembly } = await import('/SignatureAssembly.js');
      const result = { samplesPerComposition: 401, desktopIntersections: [], mobileIntersections: [] };
      for (const mobile of [false, true]) {
        const model = createSignatureAssembly();
        const out = { position: [0, 0, 0], target: [0, 0, 0], fov: 38, explosion: 0, assemblyScale: 1 };
        const previous = new THREE.Vector3();
        const current = new THREE.Vector3();
        const direction = new THREE.Vector3();
        const ray = new THREE.Raycaster();
        for (let i = 0; i <= 400; i++) {
          const progress = i / 200;
          sampleCamera(progress, mobile, out);
          current.set(...out.position);
          if (i > 0) {
            model.update(out.explosion, out.assemblyScale, smoothstep(progress) * .26);
            model.group.updateMatrixWorld(true);
            direction.copy(current).sub(previous);
            ray.far = direction.length();
            direction.normalize();
            ray.set(previous, direction);
            if (ray.intersectObject(model.group, true).length) result[mobile ? 'mobileIntersections' : 'desktopIntersections'].push(progress);
          }
          previous.copy(current);
        }
      }
      return result;
    });
    assert.deepEqual(results.pathGeometry.desktopIntersections, []);
    assert.deepEqual(results.pathGeometry.mobileIntersections, []);
    await page.evaluate(() => document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(() => document.body.dataset.fail === 'yes');
    results.realContextLossReported = true;
    await page.evaluate(() => { window.dispose(); window.dispose(); });
    results.repeatedDisposalSafe = true;
    const balancedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    balancedPage.on('pageerror', error => errors.push(error.message));
    await balancedPage.goto(`http://127.0.0.1:${server.address().port}/?mode=balanced`);
    await balancedPage.waitForFunction(() => document.body.dataset.ready === 'yes');
    results.balancedDprCap = await balancedPage.locator('canvas').evaluate(canvas => ({
      quality: canvas.dataset.quality, cssWidth: canvas.clientWidth, cssHeight: canvas.clientHeight,
      bufferWidth: canvas.width, bufferHeight: canvas.height, deviceDpr: devicePixelRatio,
    }));
    assert.equal(results.balancedDprCap.quality, 'balanced');
    assert.equal(results.balancedDprCap.bufferWidth, Math.floor(390 * 1.25));
    assert.equal(results.balancedDprCap.bufferHeight, Math.floor(844 * 1.25));
    assert.deepEqual(errors, []);
    results.uncaughtErrors = errors;
    console.log(JSON.stringify(results, null, 2));
    if (capture) fs.writeFileSync(path.join(captureDir, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser?.close();
    server.close();
  }
});
