import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const port = 4173;
const contentTypes = { '.css': 'text/css', '.js': 'text/javascript', '.html': 'text/html' };

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (request, response) => {
      const requestedPath = new URL(request.url, 'http://127.0.0.1').pathname === '/'
        ? '/paginaCristianoRonaldo/index.html'
        : new URL(request.url, 'http://127.0.0.1').pathname;
      const safePath = normalize(decodeURIComponent(requestedPath)).replace(/^[/\\]+/, '').replace(/^([.][.][\\/])+/, '');
      const filePath = join(root, safePath);
      try {
        const content = await readFile(filePath);
        response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' });
        response.end(content);
      } catch {
        response.writeHead(404);
        response.end('Not found');
      }
    });
    server.listen(port, () => resolve(server));
  });
}

const server = await startServer();
const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  const page = await browser.newPage();
  await page.route('https://images.unsplash.com/**', (route) => route.abort());
  await page.goto(`http://127.0.0.1:${port}/paginaCristianoRonaldo/index.html`, { waitUntil: 'networkidle' });

  const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
  await page.addScriptTag({ content: axeSource });
  const axeResults = await page.evaluate(async () => window.axe.run(document));
  for (const violation of axeResults.violations) {
    const targets = violation.nodes.map((node) => node.target.join(', ')).join(' | ');
    failures.push(`axe ${violation.id}: ${violation.help} [${targets}]`);
  }

  const documentChecks = await page.evaluate(() => {
    const externalUrls = [...document.querySelectorAll('[src], [href]')]
      .map((element) => element.src || element.href)
      .filter((url) => url.startsWith('http') && !url.startsWith(location.origin));
    const externalAnchors = [...document.querySelectorAll('a[href^="http"]')];
    const missingAlt = [...document.images].filter((image) => !image.hasAttribute('alt'));
    const headingCount = document.querySelectorAll('h1').length;
    const referencedIds = [...document.querySelectorAll('[aria-labelledby], [aria-describedby]')]
      .flatMap((element) => `${element.getAttribute('aria-labelledby') ?? ''} ${element.getAttribute('aria-describedby') ?? ''}`.trim().split(/\s+/))
      .filter(Boolean);
    const missingReferences = referencedIds.filter((id) => !document.getElementById(id));
    return {
      lang: document.documentElement.lang,
      headingCount,
      missingAlt: missingAlt.length,
      missingReferences,
      insecureExternalUrls: externalUrls.filter((url) => !url.startsWith('https://')),
      unsafeExternalAnchors: externalAnchors.filter((anchor) => anchor.target === '_blank' && !anchor.rel.split(/\s+/).includes('noopener')).length
    };
  });

  if (documentChecks.lang !== 'es') failures.push('HTML debe declarar lang="es".');
  if (documentChecks.headingCount !== 1) failures.push(`Se esperaba exactamente un h1; se encontraron ${documentChecks.headingCount}.`);
  if (documentChecks.missingAlt) failures.push(`${documentChecks.missingAlt} imagen(es) sin atributo alt.`);
  if (documentChecks.missingReferences.length) failures.push(`Referencias ARIA inexistentes: ${documentChecks.missingReferences.join(', ')}.`);
  if (documentChecks.insecureExternalUrls.length) failures.push(`Recursos externos no HTTPS: ${documentChecks.insecureExternalUrls.join(', ')}.`);
  if (documentChecks.unsafeExternalAnchors) failures.push('Hay enlaces externos con target="_blank" sin rel="noopener".');

  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload({ waitUntil: 'networkidle' });
    const responsiveChecks = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      smallTargets: [...document.querySelectorAll('a, button')]
        .filter((element) => getComputedStyle(element).display !== 'none')
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width < 24 || box.height < 24;
        }).length
    }));
    if (responsiveChecks.overflow) failures.push(`Overflow horizontal detectado a ${width}px.`);
    if (responsiveChecks.smallTargets) failures.push(`${responsiveChecks.smallTargets} controles menores de 24px a ${width}px.`);
  }

  await page.setViewportSize({ width: 768, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Real Madrid' }).click();
  const filterChecks = await page.evaluate(() => ({
    visibleItems: [...document.querySelectorAll('.timeline-item')].filter((item) => !item.classList.contains('is-hidden')).length,
    pressed: document.querySelector('[data-stage="madrid"]')?.getAttribute('aria-pressed'),
    status: document.querySelector('#timeline-status')?.textContent
  }));
  if (filterChecks.visibleItems !== 1 || filterChecks.pressed !== 'true' || !filterChecks.status?.includes('Real Madrid')) {
    failures.push('El filtro Real Madrid no actualiza contenido y estado accesible correctamente.');
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Pruebas de calidad, accesibilidad, seguridad y responsive: OK');
