import { readdir, readFile, writeFile } from 'node:fs/promises';
for (const file of await readdir('dist/assets')) {
  if (file.endsWith('.css')) {
    const path = `dist/assets/${file}`;
    await writeFile(path, (await readFile(path, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, ''));
  }
}
