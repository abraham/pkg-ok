import fs from 'fs';
import normalizeNewline from 'normalize-newline';
import path from 'path';

// TODO: Remove any
type Pkg = any;

export interface Options {
  bin?: string[];
  fields?: string[];
}

// TODO: add exports
const FIELDS = [
  'bin',
  'types', // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html used by TypeScript
  'typings', // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html alternatively used by TypeScript
  'module', // https://github.com/stereobooster/package.json#module used by rollup, webpack
  'es2015', // https://github.com/stereobooster/package.json#es2015 used by Angular
  'browser', // https://docs.npmjs.com/files/package.json#browser
  'exports', // https://nodejs.org/api/packages.html#subpath-exports
];

// Check fields for file existence

function doesntExist(dir: string, file: string) {
  return !fs.existsSync(path.join(dir, file));
}

function checkField(pkg: Pkg, dir: string, field: string) {
  const errors = [];

  if (pkg[field]) {
    if (pkg[field] instanceof Object) {
      Object.keys(pkg[field]).forEach((key) => {
        if (doesntExist(dir, pkg[field][key])) {
          errors.push(`${field}.${key}`);
        }
      });
    } else {
      if (doesntExist(dir, pkg[field])) {
        errors.push(field);
      }
    }
  }

  return errors;
}

function checkFields(pkg: Pkg, dir: string, otherFields: string[]) {
  const errors = [];

  // https://docs.npmjs.com/files/package.json#main
  if (pkg.main && doesntExist(dir, pkg.main)) {
    errors.push('main');
  }

  const fields = FIELDS.concat(otherFields || []);

  // Check fields and add errors to the errors array
  fields.forEach((field) => {
    checkField(pkg, dir, field).forEach((error) => errors.push(error));
  });

  return errors;
}

// Check scripts line endings

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

function normalizeScripts(pkg: Pkg, dir: string, files: string[]) {
  normalizeField(pkg, dir, 'bin');
  files.forEach((file) => normalize(dir, file));
}

// Main function
export function pkgOk(dir: string, { fields = [], bin = [] }: Options = {}) {
  const pkgPath = path.join(dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath).toString());

  // Check files exist in package.json fields and additional fields
  const errors = checkFields(pkg, dir, fields);

  if (errors.length) {
    const message = errors.map((error) => `${error} path doesn't exist in package.json`).join('\n');

    throw new Error(message);
  }

  // Normalize line endings for bin scripts and additional scripts
  normalizeScripts(pkg, dir, bin);
}
