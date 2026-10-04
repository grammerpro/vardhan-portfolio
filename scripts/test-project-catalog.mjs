import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { chromium } from 'playwright';

function loadModule(path) {
  const source = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, URL, Set });
  return exports;
}

const { projects } = loadModule('src/content/portfolio.ts');
const { auditedWork, additionalCatalogWork, publicLink } = loadModule('src/lib/project-catalog.ts');
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }

check('all six source destinations survive the local mapping', () => {
  const mapped = auditedWork(projects);
  assert.equal(mapped.length, 6);
  assert.equal(mapped.map((item) => item.sourceUrl).join('|'), projects.map((item) => item.sourceUrl).join('|'));
  assert.ok(mapped.every((item) => item.caseStudyUrl && item.audited));
});
check('missing or malformed catalogs leave the audited collection usable', () => {
  for (const value of [null, undefined, {}, '', [null, 1, [], { title: '' }]]) assert.equal(additionalCatalogWork(value, projects).length, 0);
});
check('unsafe protocols and credentials never become public links', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'ftp://example.com', 'https://user:password@example.com', '//example.com', '']) assert.equal(publicLink(value), undefined);
});
check('valid owner-listed web destinations are retained', () => {
  assert.equal(publicLink('https://example.com/work'), 'https://example.com/work');
  assert.equal(publicLink('http://example.com/work'), 'http://example.com/work');
});
check('CMS entries cannot replace audited source claims', () => {
  assert.equal(additionalCatalogWork([{ title: 'Some changed title', github: `${projects[0].sourceUrl}.git`, description: 'Invented speed improvement' }], projects).length, 0);
  assert.equal(additionalCatalogWork([{ title: 'Java Native RAG System', github: 'https://example.com/stale' }, { title: 'BlockchainFileStorage', liveDemo: 'https://example.com/stale' }], projects).length, 0);
});
check('additional entries expose neutral scope, not unchecked descriptions', () => {
  const result = additionalCatalogWork([{ title: 'Another project', github: 'https://github.com/example/another', description: 'A made-up 99% improvement', technologies: ['React', 'React', 2, '  ', ' TypeScript '] }], projects);
  assert.equal(result.length, 1);
  assert.equal(result[0].audited, false);
  assert.equal(result[0].tags.join('|'), 'React|TypeScript');
  assert.ok(!result[0].summary.includes('99%'));
});
check('duplicate source and title records appear once', () => {
  const result = additionalCatalogWork([{ title: 'Another', github: 'https://github.com/example/another' }, { title: 'ANOTHER', github: 'https://github.com/example/else' }, { title: 'Different title', github: 'https://github.com/example/another/' }], projects);
  assert.equal(result.length, 1);
});
check('entries without usable destinations are omitted', () => {
  assert.equal(additionalCatalogWork([{ title: 'Broken project', github: 'javascript:alert(1)' }], projects).length, 0);
});

const base = process.argv[2];
if (base) {
  mkdirSync('docs/screenshots/archive', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const evidence = [];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 360, height: 800 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`${base}/projects`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    for (const project of projects) await page.getByRole('heading', { name: project.title, exact: true }).waitFor();
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://vardhansudo.me/projects');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.screenshot({ path: `docs/screenshots/archive/${viewport.width}-archive.png`, fullPage: true });
    await page.getByLabel('Search the work').fill('PDF Editor');
    await page.getByRole('heading', { name: 'PDF Editor Tool', exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Java Native RAG', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.getByLabel('Technology', { exact: true }).selectOption('Canvas 2D');
    await page.getByRole('heading', { name: 'Chroma Loop', exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'PDF Editor Tool', exact: true }).count(), 0);
    await page.getByLabel('Search the work').fill('unmatched-search-portfolio-check');
    await page.getByRole('heading', { name: 'No matching projects.' }).waitFor();
    await page.getByRole('button', { name: 'Show all work' }).click();
    await page.getByRole('link', { name: 'Case study', exact: true }).first().click();
    await page.waitForURL('**/work/java-native-rag');
    await page.goBack({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'The workbench.' }).waitFor();
    assert.equal(errors.length, 0, errors.join('\n'));
    evidence.push({ viewport, status: response.status(), search: 'passed', technology: 'passed', reset: 'passed', caseNavigation: 'passed', browserBack: 'passed', horizontalOverflow: false, errors });
    await context.close();
  }
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(`${base}/projects`);
  for (const project of projects) await staticPage.getByRole('heading', { name: project.title, exact: true }).waitFor();
  await staticPage.getByLabel('Search the work').fill('PDF Editor');
  await Promise.all([staticPage.waitForURL('**/projects?q=PDF+Editor&technology=All'), staticPage.getByRole('button', { name: 'Apply filters' }).click()]);
  await staticPage.getByRole('heading', { name: 'PDF Editor Tool', exact: true }).waitFor();
  assert.equal(await staticPage.getByRole('heading', { name: 'Java Native RAG', exact: true }).count(), 0);
  evidence.push({ javaScript: false, serverRenderedWork: 'passed', nativeSearchSubmit: 'passed' });
  writeFileSync('docs/screenshots/archive/results.json', JSON.stringify({ browser: browser.version(), date: new Date().toISOString(), evidence }, null, 2));
  await staticContext.close();
  await browser.close();
  console.log('PASS Chromium archive search, filters, reset, routes, back, reflow, and no-JavaScript form submission.');
}
console.log(`${checks} offline catalog checks passed.`);
