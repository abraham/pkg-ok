#!/usr/bin/env node

import chalk from 'chalk';
import meow from 'meow';
import { relative } from 'node:path';
import { pkgOk } from './index.ts';
import { resolveTargets } from './targets.ts';

const cli = meow(
  `
  Usage
    $ pkg-ok [path ...]

  Paths can be package directories, package.json files, or quoted globs.
  Defaults to the current directory. node_modules is skipped.

  Options
    --field, -f       additional field to check
    --bin, -b         additional bin file to check
    --no-published    skip checking that paths are in the files npm will publish
    --no-linked       skip checking that dependencies aren't linked to local folders

  Private packages and packages without a name or version skip the published check.

  Examples
    $ pkg-ok
    $ pkg-ok packages/name-of-package/package.json
    $ pkg-ok . 'packages/*'
    $ pkg-ok --field otherField --bin otherFile
`,
  {
    importMeta: import.meta,
    flags: {
      field: {
        shortFlag: 'f',
        type: 'string',
        isMultiple: true,
      },
      bin: {
        shortFlag: 'b',
        type: 'string',
        isMultiple: true,
      },
      published: {
        type: 'boolean',
        default: true,
      },
      linked: {
        type: 'boolean',
        default: true,
      },
    },
  },
);

const errorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  } else {
    return 'Unknown error running pkg-ok';
  }
};

const fail = (prefix: string, error: unknown) => {
  console.error(chalk.red(`${prefix}pkg-ok error`));
  console.error(chalk.red(errorMessage(error)));
  process.exitCode = 1;
};

try {
  const directories = resolveTargets(cli.input, process.cwd());
  for (const directory of directories) {
    const prefix = directories.length > 1 ? `${relative(process.cwd(), directory) || '.'}: ` : '';
    try {
      pkgOk(directory, {
        fields: cli.flags.field,
        bin: cli.flags.bin,
        published: cli.flags.published,
        linked: cli.flags.linked,
      });
      console.log(chalk.green(`${prefix}Package ok`));
    } catch (error) {
      fail(prefix, error);
    }
  }
} catch (error) {
  fail('', error);
}
