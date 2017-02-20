#!/usr/bin/env node
const pkgOk = require('./')

const errors = pkgOk(process.cwd())

if (errors.length) {
  errors.forEach(error => {
    console.error(`Error package.json > ${error} path doesn't exist`)
  })

  process.exit(1)
}

