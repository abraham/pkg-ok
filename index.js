const fs = require('fs')
const path = require('path')

function doesntExist (dir, file) {
  return !fs.existsSync(path.join(dir, file))
}

module.exports = function pkgOk (dir) {
  const errors = []
  const pkgPath = path.join(dir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath))

  // https://docs.npmjs.com/files/package.json#main
  if (pkg.main && doesntExist(dir, pkg.main)) {
    errors.push('main')
  }

  // https://docs.npmjs.com/files/package.json#bin
  if (pkg.bin) {
    if (pkg.bin instanceof Object) {
      for (let key in pkg.bin) {
        if (doesntExist(dir, pkg.bin[key])) {
          errors.push(`bin.${key}`)
        }
      }
    } else {
      if (doesntExist(dir, pkg.bin)) {
        errors.push('bin')
      }
    }
  }

  return errors
}
