#!/usr/bin/env node
const meow = require('meow')
const chalk = require('chalk')
const pkgOk = require('./')

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
