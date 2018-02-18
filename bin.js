#!/usr/bin/env node
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

const errors = pkgOk(process.cwd(), { fields: argv.field, bin: argv.bin })

if (errors.length) {
  errors.forEach(error => {
    console.error(`Error package.json > ${error} path doesn't exist`)
  })

  process.exit(1)
}
