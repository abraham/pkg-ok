import fs from 'fs';
import path from 'path';
import { checkFields } from './fields.js';
import { normalizeScripts } from './scripts.js';

export interface Options {
  bin?: string[];
  fields?: string[];
}

// Main function
export function pkgOk(dir: string, { fields = [], bin = [] }: Options = {}) {
  const pkgPath = path.join(dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath).toString());

  // Check files exist in package.json fields and additional fields
  const errors = checkFields(pkg, dir, fields);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  // Normalize line endings for bin scripts and additional scripts
  normalizeScripts(pkg, dir, bin);
}
