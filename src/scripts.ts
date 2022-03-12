import fs from 'fs';
import normalizeNewline from 'normalize-newline';
import path from 'path';
import { Pkg } from './pkg.js';

function normalize(dir: string, file: string) {
  const filename = path.join(dir, file);
  const data = fs.readFileSync(filename, 'utf-8');
  const normalizedData = normalizeNewline(data);
  fs.writeFileSync(filename, normalizedData);
}

function normalizeField(pkg: Pkg, dir: string, field: string) {
  if (pkg[field]) {
    if (pkg[field] instanceof Object) {
      Object.keys(pkg[field]).forEach((key) => normalize(dir, pkg[field][key]));
    } else {
      normalize(dir, pkg[field]);
    }
  }
}

export function normalizeScripts(pkg: Pkg, dir: string, files: string[]) {
  normalizeField(pkg, dir, 'bin');
  files.forEach((file) => normalize(dir, file));
}
