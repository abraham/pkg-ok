import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkDependencies } from './dependencies.ts';
import { checkFields } from './fields.ts';
import { isPublishable, packedFiles } from './packed.ts';
import { isObject, type Pkg } from './pkg.ts';
import { normalizeScripts } from './scripts.ts';

export interface Options {
  bin?: string[] | undefined;
  fields?: string[] | undefined;
  // Also check that paths are in the files npm will publish; defaults to true
  published?: boolean | undefined;
  // Check that direct dependencies aren't linked to local folders; defaults to true
  linked?: boolean | undefined;
}

// Main function
export function pkgOk(
  dir: string,
  { fields = [], bin = [], published = true, linked = true }: Options = {},
): void {
  const pkgPath = join(dir, 'package.json');
  const json: unknown = JSON.parse(readFileSync(pkgPath, 'utf8'));
  if (!isObject(json) || Array.isArray(json)) {
    throw new Error(`${pkgPath} must contain a JSON object`);
  }
  const pkg = json as Pkg;

  // Check files exist in package.json fields and additional fields
  const packed = published && isPublishable(pkg) ? packedFiles(dir) : undefined;
  const errors = checkFields(pkg, dir, fields, packed);
  if (linked) {
    errors.push(...checkDependencies(pkg, dir));
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  // Normalize line endings for bin scripts and additional scripts
  normalizeScripts(pkg, dir, bin);
}
