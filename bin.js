#!/usr/bin/env node
import meow from 'meow'
import chalk from 'chalk'
import { pkgOk } from './index.js'

const cli = meow(`
  Usage
    $ pkg-ok

  Options
    --field, -f  additional field to check
    --bin, -b    additional bin file to check

  Examples
    $ pkg-ok
    $ pkg-ok --field otherField --bin otherFile
`, {
  importMeta: import.meta,
  flags: {
    field: {
      alias: 'f',
      type: 'array'
    },
    bin: {
      alias: 'b',
      type: 'array'
    }
  }
})

try {
  pkgOk(process.cwd(), { fields: cli.flags.field, bin: cli.flags.bin })
} catch (error) {
  console.log(chalk.red('pkg-ok error'))
  console.log(chalk.red(error.message))
  process.exit(1)
}
