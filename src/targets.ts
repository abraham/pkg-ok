import { existsSync, globSync, realpathSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';

const GLOB = /[*?[\]{}]/;

function inNodeModules(cwd: string, path: string): boolean {
  return relative(cwd, path).split(/[\\/]/).includes('node_modules');
}

function toPackageDir(path: string): string {
  return basename(path) === 'package.json' ? dirname(path) : path;
}

function isPackageDir(dir: string): boolean {
  return existsSync(resolve(dir, 'package.json'));
}

function expandGlob(pattern: string, cwd: string): string[] {
  const dirs = globSync(pattern, { cwd, exclude: ['**/node_modules'] })
    .map((path) => toPackageDir(resolve(cwd, path)))
    .filter((dir) => !inNodeModules(cwd, dir) && isPackageDir(dir))
    .sort();
  if (dirs.length === 0) {
    throw new Error(`${pattern} matched no packages`);
  }
  return dirs;
}

function resolvePath(input: string, cwd: string): string[] {
  const dir = toPackageDir(resolve(cwd, input));
  if (inNodeModules(cwd, dir)) {
    return [];
  }
  if (!isPackageDir(dir)) {
    throw new Error(`${input} is not a directory with a package.json`);
  }
  return [dir];
}

// Resolves CLI inputs (directories, package.json paths, or globs) to unique package directories.
export function resolveTargets(inputs: readonly string[], cwd: string): string[] {
  const dirs = new Set(
    (inputs.length ? inputs : ['.'])
      .flatMap((input) => (GLOB.test(input) ? expandGlob(input, cwd) : resolvePath(input, cwd)))
      .map((dir) => realpathSync(dir)),
  );

  if (dirs.size === 0) {
    throw new Error('No packages to check outside node_modules');
  }

  return [...dirs];
}
