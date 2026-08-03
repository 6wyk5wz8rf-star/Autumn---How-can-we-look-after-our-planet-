import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

const distDirectory = new URL('../dist/', import.meta.url);
const workerPath = new URL('../dist/service-worker.js', import.meta.url);
const marker = '[/* INJECT_BUILD_ASSETS */]';
const cacheMarker = '/* INJECT_CACHE_VERSION */';

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}

const root = distDirectory.pathname;
const assets = (await listFiles(root))
  .filter((path) => !path.endsWith('service-worker.js') && !path.endsWith('.map'))
  .map((path) => `./${relative(root, path).split(sep).join('/')}`)
  .sort();

const source = await readFile(workerPath, 'utf8');
if (!source.includes(marker)) throw new Error('Service-worker precache marker was not found.');
if (!source.includes(cacheMarker)) throw new Error('Service-worker cache-version marker was not found.');
const buildVersion = createHash('sha256')
  .update(source.replace(cacheMarker, ''))
  .update(assets.join('\n'))
  .digest('hex')
  .slice(0, 12);
const injected = source
  .replace(marker, JSON.stringify(assets))
  .replace(cacheMarker, `build-${buildVersion}`);
await writeFile(workerPath, injected, 'utf8');

console.log(`Injected ${assets.length} offline assets into service-worker cache ${buildVersion}.`);
