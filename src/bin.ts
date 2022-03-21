#!/usr/bin/env node

import chalk from 'chalk';
import meow from 'meow';
import { pkgOk } from './index.js';

const cli = meow(
  `
  Usage
    $ pkg-ok

  Options
    --field, -f  additional field to check
    --bin, -b    additional bin file to check

  Examples
    $ pkg-ok
    $ pkg-ok --field otherField --bin otherFile
`,
  {
    importMeta: import.meta,
    flags: {
      field: {
        alias: 'f',
        type: 'string',
        isMultiple: true,
      },
      bin: {
        alias: 'b',
        type: 'string',
        isMultiple: true,
      },
    },
  }
);

const errorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  } else {
    return 'Unknown error running pkg-ok';
  }
};

const directory = cli.input[0] || process.cwd();

try {
  pkgOk(directory, { fields: cli.flags.field, bin: cli.flags.bin });
  console.log(chalk.green('Package ok'));
} catch (error) {
  console.log(chalk.red('pkg-ok error'));
  console.log(chalk.red(errorMessage(error)));
  process.exit(1);
}
