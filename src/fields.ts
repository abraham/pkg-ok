import fs from 'fs';
import path from 'path';
import { doesNotExistError, mustBeRelativeError } from './errors.js';
import { isObject, Pkg } from './pkg.js';

interface Field {
  name: string;
  relative: boolean;
}

const FIELDS: Readonly<Field[]> = [
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

const FIELD_NAMES: Readonly<string[]> = FIELDS.map((field) => field.name);

function doesNotExist(dir: string, file: string) {
  return !fs.existsSync(path.join(dir, file));
}

function findField(name: string) {
  return FIELDS.find((field) => field.name === name);
}

function mustBeRelative(name: string, file: string): boolean {
  const field = findField(name);
  if (!field || !field.relative) {
    return false;
  }

  return !file.startsWith('./');
}

function checkField(pkg: Pkg, dir: string, field: string) {
  const errors: string[] = [];

  const value = pkg[field];
  if (value) {
    if (isObject(value)) {
      Object.keys(value).forEach((key) => {
        if (doesNotExist(dir, value[key])) {
          errors.push(doesNotExistError(`${field}.${key}`));
        }

        if (mustBeRelative(field, value[key])) {
          errors.push(mustBeRelativeError(`${field}.${key}`));
        }
      });
    } else if (typeof value === 'string') {
      if (doesNotExist(dir, value)) {
        errors.push(doesNotExistError(field));
      }

      if (mustBeRelative(field, value)) {
        errors.push(mustBeRelativeError(field));
      }
    }
  }

  return errors;
}

export function checkFields(pkg: Pkg, dir: string, otherFields: string[]) {
  const fields = [...FIELD_NAMES, ...otherFields];

  // Check fields and add errors to the errors array
  return fields.flatMap((field) => checkField(pkg, dir, field));
}
