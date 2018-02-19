#!/usr/bin/env node
const chalk = require('chalk')
const pkgOk = require('./')

var argv = require('yargs')
  .usage('$0 --field [otherField] --bin [otherFile]')
  .pkgConf('pkg-ok')
  .option('field', {
    alias: 'f',
    describe: `additional field to check`,
    type: 'array'
  })
  .option('bin', {
    alias: 'b',
    describe: 'additional bin file to check',
    type: 'array'
  })
  .argv

try {
  pkgOk(process.cwd(), { fields: argv.field, bin: argv.bin })
} catch (error) {
  console.log(chalk.red('pkg-ok error'))
  console.log(chalk.red(error.message))
  process.exit(1)
}
