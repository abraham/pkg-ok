import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkFields } from './fields.js';
import { isObject, type Pkg } from './pkg.js';
import { normalizeScripts } from './scripts.js';

export interface Options {
  bin?: string[];
  fields?: string[];
}

// Main function
export function pkgOk(dir: string, { fields = [], bin = [] }: Options = {}) {
  const pkgPath = join(dir, 'package.json');
  const json: unknown = JSON.parse(readFileSync(pkgPath, 'utf8'));
  if (!isObject(json) || Array.isArray(json)) {
    throw new Error(`${pkgPath} must contain a JSON object`);
  }
  const pkg = json as Pkg;

  // Check files exist in package.json fields and additional fields
  const errors = checkFields(pkg, dir, fields);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  // Normalize line endings for bin scripts and additional scripts
  normalizeScripts(pkg, dir, bin);
}
