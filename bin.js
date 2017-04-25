#!/usr/bin/env node
const pkgOk = require('./')
const otherFields = process.argv.slice(2)
const errors = pkgOk(process.cwd(), otherFields)

if (errors.length) {
  errors.forEach(error => {
    console.error(`Error package.json > ${error} path doesn't exist`)
  })

  process.exit(1)
}
