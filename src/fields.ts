import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { doesNotExistError, mustBeRelativeError, notPublishedError } from './errors.ts';
import { isPacked } from './packed.ts';
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

function checkValue(
  field: string,
  path: string,
  dir: string,
  value: unknown,
  packed: ReadonlySet<string> | undefined,
): string[] {
  if (isObject(value)) {
    return Object.entries(value).flatMap(([key, nested]) =>
      checkValue(field, `${path}.${key}`, dir, nested, packed),
    );
  }

  // Subpath patterns like ./features/*.js match many files, not one
  if (typeof value !== 'string' || !value || value.includes('*')) {
    return [];
  }

  const errors: string[] = [];
  if (doesNotExist(dir, value)) {
    errors.push(doesNotExistError(path));
  } else if (packed && !isPacked(packed, value)) {
    errors.push(notPublishedError(path));
  }

  if (mustBeRelative(field, value)) {
    errors.push(mustBeRelativeError(path));
  }

  return errors;
}

function checkField(pkg: Pkg, dir: string, field: string, packed: ReadonlySet<string> | undefined) {
  return checkValue(field, field, dir, pkg[field], packed);
}

// Pass the files npm will publish to also check that each path is published
export function checkFields(
  pkg: Pkg,
  dir: string,
  otherFields: string[],
  packed?: ReadonlySet<string>,
): string[] {
  const fields = [...FIELD_NAMES, ...otherFields];

  return fields.flatMap((field) => checkField(pkg, dir, field, packed));
}
