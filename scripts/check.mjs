import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) out.push(...await walk(path));
    else out.push(path);
  }
  return out;
}

const files = await walk(new URL('../functions', import.meta.url).pathname);
for (const file of files.filter(name => name.endsWith('.js'))) {
  await import(`file://${file}`);
}
const index = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const admin = await readFile(new URL('../public/admin/index.html', import.meta.url), 'utf8');
if (!index.includes('/api/content') || !admin.includes('/api/admin/content')) throw new Error('Rotas do CMS não encontradas.');
console.log(`Verificação concluída: ${files.length} arquivos de função e 2 páginas.`);
