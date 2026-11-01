import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { doesNotExistError, mustBeRelativeError } from './errors.ts';
import { isObject, type Pkg } from './pkg.ts';

interface Field {
  name: string;
  relative: boolean;
}

const FIELDS: readonly Field[] = [
  // https://docs.npmjs.com/cli/v8/configuring-npm/package-json#main
  {
    name: 'main',
    relative: true,
  },
  // https://docs.npmjs.com/cli/v8/configuring-npm/package-json#bin
  {
    name: 'bin',
    relative: true,
  },
  // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html used by TypeScript
  {
    name: 'types',
    relative: false,
  },
  // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html alternatively used by TypeScript
  {
    name: 'typings',
    relative: false,
  },
  // https://github.com/stereobooster/package.json#module used by rollup, webpack
  {
    name: 'module',
    relative: false,
  },
  // https://github.com/stereobooster/package.json#es2015 used by Angular
  {
    name: 'es2015',
    relative: false,
  },
  // https://docs.npmjs.com/files/package.json#browser
  {
    name: 'browser',
    relative: true,
  },
  // https://nodejs.org/api/packages.html#subpath-exports
  {
    name: 'exports',
    relative: false,
  },
];

const FIELD_NAMES: readonly string[] = FIELDS.map((field) => field.name);

function doesNotExist(dir: string, file: string) {
  return !existsSync(join(dir, file));
}

function findField(name: string) {
  return FIELDS.find((field) => field.name === name);
}

function mustBeRelative(name: string, file: string): boolean {
  const field = findField(name);
  if (!field?.relative) {
    return false;
  }

  return !file.startsWith('./');
}

function checkValue(field: string, path: string, dir: string, value: unknown): string[] {
  if (isObject(value)) {
    return Object.entries(value).flatMap(([key, nested]) =>
      checkValue(field, `${path}.${key}`, dir, nested),
    );
  }

  // Subpath patterns like ./features/*.js match many files, not one
  if (typeof value !== 'string' || !value || value.includes('*')) {
    return [];
  }

  const errors: string[] = [];
  if (doesNotExist(dir, value)) {
    errors.push(doesNotExistError(path));
  }

  if (mustBeRelative(field, value)) {
    errors.push(mustBeRelativeError(path));
  }

  return errors;
}

function checkField(pkg: Pkg, dir: string, field: string) {
  return checkValue(field, field, dir, pkg[field]);
}

export function checkFields(pkg: Pkg, dir: string, otherFields: string[]): string[] {
  const fields = [...FIELD_NAMES, ...otherFields];

  // Check fields and add errors to the errors array
  return fields.flatMap((field) => checkField(pkg, dir, field));
}
