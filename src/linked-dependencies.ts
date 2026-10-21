import { lstatSync, realpathSync } from 'fs';
import { join } from 'path';

type Package = {
  dependencies?: unknown;
  optionalDependencies?: unknown;
  peerDependencies?: unknown;
};

const dependencyFields: readonly (keyof Package)[] = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMissingPath(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}

function isNodeModulesPath(path: string): boolean {
  return path.split(/[\\/]+/).some((part) => part.toLowerCase() === 'node_modules');
}

function isLocalSymlink(path: string): boolean {
  let isSymlink: boolean;
  try {
    isSymlink = lstatSync(path).isSymbolicLink();
  } catch (error) {
    if (isMissingPath(error)) {
      return false;
    }
    throw error;
  }

  if (!isSymlink) {
    return false;
  }

  try {
    // Package managers such as pnpm place installed packages in node_modules
    // stores and expose them through symlinks. A local project link resolves
    // outside those stores.
    return !isNodeModulesPath(realpathSync(path));
  } catch (error) {
    // A broken dependency symlink is still a local link and should block publish.
    if (isMissingPath(error)) {
      return true;
    }
    throw error;
  }
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
    return [join(nodeModules, parts[0]), join(nodeModules, name)];
  }
  return [join(nodeModules, name)];
}

export function checkLinkedDependencies(pkg: Package, dir: string): string[] {
  const names = new Set<string>();
  for (const field of dependencyFields) {
    const dependencies = pkg[field];
    if (isRecord(dependencies)) {
      Object.keys(dependencies).forEach((name) => names.add(name));
    }
  }

  const errors: string[] = [];
  for (const name of names) {
    const paths = dependencyEntryPaths(dir, name);
    if (paths.some(isLocalSymlink)) {
      errors.push(`Dependency "${name}" is linked to a local package`);
    }
  }
  return errors;
}
