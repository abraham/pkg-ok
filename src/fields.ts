import fs from 'fs';
import path from 'path';
import { Pkg } from './pkg.js';

const FIELDS = [
  'main', // https://docs.npmjs.com/files/package.json#main
  'bin',
  'types', // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html used by TypeScript
  'typings', // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html alternatively used by TypeScript
  'module', // https://github.com/stereobooster/package.json#module used by rollup, webpack
  'es2015', // https://github.com/stereobooster/package.json#es2015 used by Angular
  'browser', // https://docs.npmjs.com/files/package.json#browser
  'exports', // https://nodejs.org/api/packages.html#subpath-exports
] as const;

function doesNotExist(dir: string, file: string) {
  return !fs.existsSync(path.join(dir, file));
}

function checkField(pkg: Pkg, dir: string, field: string) {
  const errors = [];

  if (pkg[field]) {
    if (pkg[field] instanceof Object) {
      Object.keys(pkg[field]).forEach((key) => {
        if (doesNotExist(dir, pkg[field][key])) {
          errors.push(`${field}.${key}`);
        }
      });
    } else {
      if (doesNotExist(dir, pkg[field])) {
        errors.push(field);
      }
    }
  }

  return errors;
}

export function checkFields(pkg: Pkg, dir: string, otherFields: string[]) {
  const fields = [...FIELDS, ...otherFields];

  // Check fields and add errors to the errors array
  return fields.flatMap((field) => checkField(pkg, dir, field));
}
