import { lstatSync, readlinkSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { linkedDependencyError } from './errors.ts';
import { isObject, type Pkg } from './pkg.ts';

const dependencyFields: readonly (keyof Pkg)[] = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
];

function isMissingPath(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function isNodeModulesPath(path: string): boolean {
  return path.split(/[\\/]+/).some((part) => part.toLowerCase() === 'node_modules');
}

// Returns where a local link points, or undefined for anything else
function localLinkTarget(dir: string, path: string): string | undefined {
  let isSymlink: boolean;
  try {
    isSymlink = lstatSync(path).isSymbolicLink();
  } catch (error) {
    if (isMissingPath(error)) {
      return undefined;
    }
    throw error;
  }

  if (!isSymlink) {
    return undefined;
  }

  let target: string;
  try {
    target = realpathSync(path);
  } catch (error) {
    if (isMissingPath(error)) {
      return `${readlinkSync(path)} (missing)`;
    }
    throw error;
  }
  // Package-manager stores (like pnpm's) live inside node_modules
  return isNodeModulesPath(target) ? undefined : relative(realpathSync(dir), target);
}

function dependencyEntryPaths(dir: string, name: string): string[] {
  if (name.includes('\\')) {
    return [];
  }

  const parts = name.split('/');
  if (parts.some((part) => part === '' || part === '.' || part === '..')) {
    return [];
  }

  if (name.startsWith('@') ? parts.length !== 2 : parts.length !== 1) {
    return [];
  }

  const nodeModules = join(dir, 'node_modules');
  if (name.startsWith('@')) {
    return [join(nodeModules, name.slice(0, name.indexOf('/'))), join(nodeModules, name)];
  }
  return [join(nodeModules, name)];
}

export function checkDependencies(pkg: Pkg, dir: string): string[] {
  const names = new Set<string>();
  for (const field of dependencyFields) {
    const dependencies = pkg[field];
    if (isObject(dependencies) && !Array.isArray(dependencies)) {
      Object.keys(dependencies).forEach((name) => names.add(name));
    }
  }

  const errors: string[] = [];
  for (const name of names) {
    for (const path of dependencyEntryPaths(dir, name)) {
      const target = localLinkTarget(dir, path);
      if (target !== undefined) {
        errors.push(linkedDependencyError(name, target));
        break;
      }
    }
  }
  return errors;
}
