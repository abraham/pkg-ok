import fs from 'fs';
import normalizeNewline from 'normalize-newline';
import path from 'path';
import { isObject, Pkg } from './pkg.js';

function normalize(dir: string, file: string) {
  const filename = path.join(dir, file);
  const data = fs.readFileSync(filename, 'utf-8');
  const normalizedData = normalizeNewline(data);
  fs.writeFileSync(filename, normalizedData);
}

function normalizeField(pkg: Pkg, dir: string, field: string) {
  const value = pkg[field];
  if (value) {
    if (isObject(value)) {
      Object.keys(value).forEach((key) => normalize(dir, value[key]));
    } else if (typeof value === 'string') {
      normalize(dir, value);
    }
  }
}

export function normalizeScripts(pkg: Pkg, dir: string, files: string[]) {
  normalizeField(pkg, dir, 'bin');
  files.forEach((file) => normalize(dir, file));
}
