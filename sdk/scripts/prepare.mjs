import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const generated = new URL('src/generated/', root);
await rm(new URL('dist/', root), { recursive: true, force: true });
await rm(generated, { recursive: true, force: true });
await mkdir(generated, { recursive: true });
const wrappers = new URL('../wrappers-ts/', root);
for (const file of await readdir(wrappers)) {
  if (file.endsWith('V2.gen.ts')) await copyFile(new URL(file, wrappers), new URL(file, generated));
}
await copyFile(new URL('../LICENSE', root), new URL('LICENSE', root));
