// Offline route tests: TypeScript is compiled in memory with isolated provider
// stubs. Real environment variables are never loaded and no email/API is sent.
// Optional URL adds browser tests whose API routes are all intercepted.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
let checks = 0;
function loadSource(file, imports, context = {}) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, module: { exports }, require: name => imports[name] ?? require(name), Error, Request, Response, ReadableStream, TextEncoder, TextDecoder, AbortController, setTimeout, clearTimeout, console: { error() {} }, process: { env: {} }, ...context }, { filename: file });
  return exports;
}
const requestJson = loadSource('src/lib/request-json.ts', {});
function request(payload, ip = 'test-ip') {
  return new Request('http://localhost/api/test', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip }, body: typeof payload === 'string' ? payload : JSON.stringify(payload) });
}
const validMessage = { name: 'Test Person', email: 'person@example.test', message: 'A mock message only.' };
function contact(send = async () => ({ error: null }), configured = true, logs = []) {
  let calls = 0;
  const handler = loadSource('src/app/api/contact/route.ts', {
    '@/lib/request-json': requestJson,
    resend: { Resend: class { emails = { send: async value => { calls++; return send(value); } }; } },
  }, { process: { env: configured ? { RESEND_API_KEY: 'fake-test-key', CONTACT_TO_EMAIL: 'owner@example.test' } : {} }, console: { error: (...values) => logs.push(values.join(' ')) } });
  return { post: handler.POST, calls: () => calls };
}
async function status(handler, payload, expected) {
  assert.equal((await handler.post(request(payload))).status, expected);
  checks++;
}
await status(contact(undefined, false), validMessage, 503);
for (const payload of ['null', '[]', 'true', '{', {}, { ...validMessage, email: 'broken' }, { ...validMessage, name: 'One\nTwo' }, { ...validMessage, message: 'a'.repeat(5001) }]) {
  const handler = contact();
  await status(handler, payload, 400);
  assert.equal(handler.calls(), 0);
}
await status(contact(), { ...validMessage, message: 'a'.repeat(40000) }, 413);
{
  const handler = contact();
  await status(handler, { ...validMessage, company: 'bot' }, 200);
  assert.equal(handler.calls(), 0);
}
{
  let passed;
  const handler = contact(async input => { passed = input; return { error: null }; });
  await status(handler, validMessage, 200);
  assert.equal(passed.replyTo, validMessage.email);
  assert.equal(passed.to[0], 'owner@example.test');
  await status(handler, validMessage, 429);
  assert.equal(handler.calls(), 1);
}
{
  const logs = [];
  const handler = contact(async () => ({ error: { message: 'PRIVATE_PROVIDER_PAYLOAD' } }), true, logs);
  await status(handler, validMessage, 502);
  await status(handler, validMessage, 502); // A failure remains retryable.
  assert.ok(!logs.join().includes('PRIVATE_PROVIDER_PAYLOAD'));
}
await status(contact(async () => { throw new Error('PRIVATE'); }), validMessage, 500);
{
  let release;
  let arrived;
  const started = new Promise(resolve => { arrived = resolve; });
  const handler = contact(() => { arrived(); return new Promise(resolve => { release = resolve; }); });
  const first = handler.post(request(validMessage));
  await started;
  await status(handler, validMessage, 429);
  release({ error: null });
  assert.equal((await first).status, 200);
  assert.equal(handler.calls(), 1);
}

const entry = { id: 'evidence-test', title: 'Documented evidence', type: 'experience', body: 'Verified test evidence', score: .8 };
function fit({ configured = true, evidence = [entry], upstream, logs = [] } = {}) {
  let calls = 0;
  const handler = loadSource('src/app/api/fit/route.ts', {
    '@/lib/request-json': requestJson,
    '@/lib/fit': { retrieve: () => evidence, corpusSize: 10, EMBEDDING_MODEL: 'test-embedding', RELEVANCE_FLOOR: .6 },
  }, {
    process: { env: configured ? { GEMINI_API_KEY: 'fake-test-key' } : {} },
    console: { error: (...values) => logs.push(values.join(' ')) },
    fetch: async (url, options) => {
      calls++;
      if (upstream) return upstream(url, options, calls);
      if (url.includes(':embedContent')) return Response.json({ embedding: { values: [1, 0] } });
      return new Response('data: {"candidates":[{"content":{"parts":[{"text":"VERDICT: Partial fit"},{"text":"\\nGAPS: More evidence needed."}]}}]}');
    },
  });
  return { post: handler.POST, calls: () => calls };
}
await status(fit({ configured: false }), { description: 'React role' }, 503);
for (const payload of ['null', '[]', '{', {}, { description: { role: 'React' } }, { description: 'x'.repeat(6001) }]) {
  const handler = fit();
  await status(handler, payload, 400);
  assert.equal(handler.calls(), 0);
}
await status(fit(), { description: 'x'.repeat(40000) }, 413);
{
  const handler = fit({ evidence: [] });
  const response = await handler.post(request({ description: 'Unrelated' }));
  assert.equal((await response.json()).outOfScope, true);
  assert.equal(handler.calls(), 1);
  checks++;
}
{
  const handler = fit();
  const response = await handler.post(request({ description: 'React role' }));
  const text = await response.text();
  const [header, ...answer] = text.split('\n');
  assert.equal(JSON.parse(header).evidence[0].id, 'evidence-test');
  assert.ok(answer.join('\n').includes('GAPS: More evidence needed.')); // Last SSE line and all content parts are preserved.
  assert.equal(response.headers.get('cache-control'), 'no-store');
  await status(handler, { description: 'React role' }, 429);
  checks++;
}
{
  const logs = [];
  const handler = fit({ logs, upstream: async () => { throw new Error('PRIVATE_DESCRIPTION_AND_KEY'); } });
  await status(handler, { description: 'PRIVATE_DESCRIPTION_AND_KEY' }, 500);
  assert.ok(!logs.join().includes('PRIVATE_DESCRIPTION_AND_KEY'));
}
await status(fit({ upstream: async () => { const error = new Error('aborted'); error.name = 'AbortError'; throw error; } }), { description: 'React role' }, 504);
await status(fit({ upstream: async () => Response.json({ embedding: { values: [] } }) }), { description: 'React role' }, 500);
await status(fit({ upstream: async (_url, _options, call) => call === 1 ? Response.json({ embedding: { values: [1] } }) : new Response('down', { status: 502 }) }), { description: 'React role' }, 502);
for (const data of ['data: {"error":{"message":"provider failure"}}\n', 'data: {}\n', 'data: malformed\n']) {
  const handler = fit({ upstream: async (_url, _options, call) => call === 1 ? Response.json({ embedding: { values: [1] } }) : new Response(data) });
  const response = await handler.post(request({ description: 'React role' }));
  await assert.rejects(response.text(), /interrupted/);
  checks++;
}
{
  let release;
  let arrived;
  const started = new Promise(resolve => { arrived = resolve; });
  const handler = fit({ evidence: [], upstream: async () => { arrived(); return new Promise(resolve => { release = resolve; }); } });
  const first = handler.post(request({ description: 'React role' }));
  await started;
  await status(handler, { description: 'React role' }, 429);
  release(Response.json({ embedding: { values: [1] } }));
  assert.equal((await first).status, 200);
}
console.log(`PASS ${checks} offline integration checks; no providers contacted.`);

if (process.argv[2]) {
  const engines = await import('playwright');
  const engine = process.argv[3] || 'chromium';
  assert.ok(['chromium', 'webkit', 'firefox'].includes(engine), 'Choose a supported Playwright browser engine.');
  const browser = await engines[engine].launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  let contactCalls = 0;
  let fitCalls = 0;
  await page.route('**/api/contact', route => {
    contactCalls++;
    return route.fulfill({ status: contactCalls === 1 ? 502 : 200, contentType: 'application/json', body: JSON.stringify(contactCalls === 1 ? { error: 'Mock provider temporarily unavailable.' } : { ok: true }) });
  });
  await page.route('**/api/fit', route => {
    fitCalls++;
    if (fitCalls === 1) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Mock fit unavailable.' }) });
    if (fitCalls === 2) return route.fulfill({ contentType: 'text/plain', body: `${JSON.stringify({ evidence: [entry], searched: 10 })}\nVERDICT: Partial fit\nMATCHES: Test evidence [evidence-test]\nGAPS: Test gap.` });
    return route.fulfill({ contentType: 'text/plain', body: `${JSON.stringify({ evidence: [], searched: 10 })}\n` });
  });
  await page.goto(process.argv[2], { waitUntil: 'networkidle' });
  await page.locator('#contact button[type="submit"]').click();
  assert.equal(contactCalls, 0);
  await page.locator('#name').fill('Test Person');
  await page.locator('#email').fill('person@example.test');
  await page.locator('#message').fill('Retain this mock message after failure.');
  await page.locator('#contact button[type="submit"]').click();
  await page.getByText('Mock provider temporarily unavailable.').waitFor();
  assert.equal(await page.locator('#message').inputValue(), 'Retain this mock message after failure.');
  await page.locator('#contact button[type="submit"]').click();
  await page.getByText('Message accepted. I will reply to the address you gave.').waitFor();
  assert.equal(await page.locator('#message').inputValue(), '');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) }, configurable: true }));
  await page.getByRole('button', { name: 'Copy email', exact: true }).click();
  await page.getByText('Clipboard unavailable.', { exact: false }).waitFor();
  assert.equal(await page.evaluate(() => window.getSelection().toString()), 'vardhana1209@gmail.com');
  await page.locator('#fit').evaluate(node => { const details = node.closest('details'); if (details) details.open = true; });
  await page.locator('#fit-input').fill('A React role with clearly documented requirements.');
  await page.getByRole('button', { name: 'Check fit', exact: false }).click();
  await page.getByText('Mock fit unavailable.').waitFor();
  assert.equal(await page.locator('#fit-input').inputValue(), 'A React role with clearly documented requirements.');
  await page.getByRole('button', { name: 'Check fit', exact: false }).click();
  await page.getByText('Assessment complete.', { exact: true }).waitFor();
  assert.ok((await page.locator('.fit-answer').textContent()).includes('GAPS: Test gap.'));
  await page.getByRole('button', { name: 'Check fit', exact: false }).click();
  await page.getByText('The assessment could not finish.', { exact: false }).waitFor();
  assert.equal(await page.locator('.fit-answer').count(), 0);
  assert.equal(await page.locator('#fit-input').getAttribute('maxlength'), '6000');
  const base = new URL(process.argv[2]);
  await page.goto(new URL('/#fit', base).href, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.getElementById('fit')?.closest('details')?.open && document.activeElement?.id === 'fit');
  await page.goto(new URL('/resume', base).href, { waitUntil: 'networkidle' });
  assert.equal(await page.title(), 'Résumé | Vardhan');
  assert.ok((await page.locator('article').innerText()).includes('Master of Science in Information Technology'));
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://vardhansudo.me/resume');
  const pdf = await page.request.get(new URL('/resume.pdf', base).href);
  assert.equal(pdf.status(), 200);
  assert.ok((await pdf.body()).subarray(0, 4).toString() === '%PDF');
  await page.getByRole('button', { name: 'Read here', exact: false }).click();
  assert.equal(await page.locator('#resume-viewer iframe').getAttribute('src'), '/resume.pdf');
  await page.getByRole('button', { name: 'Hide viewer', exact: false }).click();
  assert.equal(await page.locator('#resume-viewer').isVisible(), false);
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.site-header').isVisible(), false);
  assert.equal(await page.getByRole('button', { name: 'Print overview', exact: false }).isVisible(), false);
  assert.equal(await page.getByRole('heading', { name: 'Selected experience', exact: true }).isVisible(), true);
  const noScript = await browser.newContext({ javaScriptEnabled: false });
  const staticResume = await noScript.newPage();
  await staticResume.goto(new URL('/resume', base).href);
  assert.equal(await staticResume.getByRole('heading', { name: 'Selected experience', exact: true }).isVisible(), true);
  assert.equal(await staticResume.getByRole('link', { name: 'Download PDF', exact: false }).getAttribute('href'), '/resume.pdf');
  await noScript.close();
  await browser.close();
  console.log(`PASS ${engine} contact validation, failure/retry/acceptance, clipboard fallback, fit failure/retry/stream/empty-output handling, preserved fit deep link, résumé SSR/PDF/viewer/print/no-JS. All API calls intercepted.`);
}
