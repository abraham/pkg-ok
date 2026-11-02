import { execFileSync } from 'node:child_process';
import { basename, posix } from 'node:path';
import type { Pkg } from './pkg.ts';

type NpmPackOutput = [{ files: { path: string }[] }];

function npmCommand(): [command: string, args: string[], shell: boolean] {
  const npmCli = process.env.npm_execpath;
  // Under `npm run`, reuse that npm; pnpm and yarn also set npm_execpath
  if (npmCli && basename(npmCli) === 'npm-cli.js') {
    return [process.execPath, [npmCli], false];
  }
  // Node can't spawn .cmd files without a shell
  return process.platform === 'win32' ? ['npm.cmd', [], true] : ['npm', [], false];
}

function npmEnv(): NodeJS.ProcessEnv {
  // A parent `npm run --workspace` would otherwise make npm pack the workspace instead of dir
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('npm_config_workspace')),
  );
}

export function isPublishable(pkg: Pkg): boolean {
  return pkg.private !== true && typeof pkg.name === 'string' && typeof pkg.version === 'string';
}

export function packedFiles(dir: string): ReadonlySet<string> {
  const [command, args, shell] = npmCommand();
  let output: string;
  try {
    output = execFileSync(command, [...args, 'pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd: dir,
      encoding: 'utf8',
      env: npmEnv(),
      shell,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr?.trim();
    throw new Error(
      `npm pack failed, so published files couldn't be checked (use --no-published to skip)${stderr ? `\n${stderr}` : ''}`,
    );
  }
  const [result] = JSON.parse(output) as NpmPackOutput;
  return new Set(result.files.map((file) => file.path));
}

export function isPacked(packed: ReadonlySet<string>, file: string): boolean {
  const path = posix.normalize(file.replaceAll('\\', '/')).replace(/^\.\//, '').replace(/\/$/, '');
  if (packed.has(path)) {
    return true;
  }
  const prefix = `${path}/`;
  return [...packed].some((packedPath) => packedPath.startsWith(prefix));
}
