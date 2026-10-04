import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), 'bonding-sdk-'));
try {
  for (const file of await readdir(join(repo, 'wrappers-ts'))) {
    if (!file.endsWith('V2.gen.ts')) continue;
    const contract = file.replace('.gen.ts', '');
    const output = join(temporary, file);
    execFileSync('acton', ['wrapper', contract, '--ts', '--output', output], {
      cwd: repo,
      stdio: 'pipe',
    });
    if (!(await readFile(output)).equals(await readFile(join(repo, 'wrappers-ts', file)))) {
      throw new Error(`Stale wrapper: run acton wrapper ${contract} --ts`);
    }
  }
  console.log('All V2 TypeScript wrappers match Acton output.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
