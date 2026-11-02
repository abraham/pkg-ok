import { readFileSync, writeFileSync } from 'node:fs';
import normalizeNewline from 'normalize-newline';
import { join } from 'node:path';
import { isObject, type Pkg } from './pkg.ts';

function normalize(dir: string, file: string) {
  const filename = join(dir, file);
  const data = readFileSync(filename, 'utf-8');
  const normalizedData = normalizeNewline(data);
  writeFileSync(filename, normalizedData);
}

function normalizeField(pkg: Pkg, dir: string, field: string) {
  const value = pkg[field];
  if (value) {
    if (isObject(value)) {
      Object.values(value).forEach((file) => {
        if (typeof file === 'string') {
          normalize(dir, file);
        }
      });
    } else if (typeof value === 'string') {
      normalize(dir, value);
    }
  }
}

export function normalizeScripts(pkg: Pkg, dir: string, files: string[]): void {
  normalizeField(pkg, dir, 'bin');
  files.forEach((file) => normalize(dir, file));
}
