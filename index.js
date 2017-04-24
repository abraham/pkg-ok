const fs = require('fs')
const path = require('path')

function doesntExist (dir, file) {
  return !fs.existsSync(path.join(dir, file))
}

function checkField (pkg, field, dir) {
  const errors = []

  if (pkg[field]) {
    if (pkg[field] instanceof Object) {
      Object
        .keys(pkg[field])
        .forEach(key => {
          if (doesntExist(dir, pkg[field][key])) {
            errors.push(`${field}.${key}`)
          }
        })
    } else {
      if (doesntExist(dir, pkg[field])) {
        errors.push(field)
      }
    }
  }

  return errors
}

module.exports = function pkgOk (dir, otherFields = []) {
  const errors = []
  const pkgPath = path.join(dir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath))

  // https://docs.npmjs.com/files/package.json#main
  if (pkg.main && doesntExist(dir, pkg.main)) {
    errors.push('main')
  }

  // https://docs.npmjs.com/files/package.json#bin
  checkField(pkg, 'bin', dir)
    .forEach(error => errors.push(error))

  otherFields
    .forEach(field => {
      checkField(pkg, field, dir)
        .forEach(error => errors.push(error))
    })

  return errors
}
