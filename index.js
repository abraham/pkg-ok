const fs = require('fs')
const path = require('path')
const normalizeNewline = require('normalize-newline')

const FIELDS = [
  'bin',
  'types', // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html used by TypeScript
  'typings', // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html alternatively used by TypeScript
  'module', // https://github.com/stereobooster/package.json#module used by rollup, webpack
  'es2015', // https://github.com/stereobooster/package.json#es2015 used by Angular
  'browser' // https://docs.npmjs.com/files/package.json#browser
]

// Check fields for file existance

function doesntExist (dir, file) {
  return !fs.existsSync(path.join(dir, file))
}

function mustBeRelative (field, file, key) {
  const mustBeRelativeList = ['browser']

  if (!mustBeRelativeList.includes(field)) return

  return !file.match(/^.\//) || (key && !key.match(/^.\//))
}

function checkField (pkg, dir, field) {
  const errors = []

  if (pkg[field]) {
    if (pkg[field] instanceof Object) {
      Object
        .keys(pkg[field])
        .forEach(key => {
          if (doesntExist(dir, pkg[field][key])) {
            errors.push({
              type: 'doesNotExist',
              content: `${field}.${key}`
            })
          }
          if (mustBeRelative(field, pkg[field][key], key)) {
            errors.push({
              type: 'needsRelativePath',
              content: `${field}.${key}`
            })
          }
        })
    } else {
      if (doesntExist(dir, pkg[field])) {
        errors.push({
          type: 'doesNotExist',
          content: field
        })
      }
      if (mustBeRelative(field, pkg[field])) {
        errors.push({
          type: 'needsRelativePath',
          content: field
        })
      }
    }
  }

  return errors
}

function checkFields (pkg, dir, otherFields) {
  const errors = []

  // https://docs.npmjs.com/files/package.json#main
  if (pkg.main && doesntExist(dir, pkg.main)) {
    errors.push({
      type: 'doesNotExist',
      content: 'main'
    })
  }

  const fields = FIELDS.concat(otherFields || [])

  // Check fields and add errors to the errors array
  fields.forEach(field => {
    checkField(pkg, dir, field).forEach(error => errors.push(error))
  })

  return errors
}

// Check scripts line endings

function normalize (dir, file) {
  const filename = path.join(dir, file)
  const data = fs.readFileSync(filename, 'utf-8')
  const normalizedData = normalizeNewline(data)
  fs.writeFileSync(filename, normalizedData)
}

function normalizeField (pkg, dir, field) {
  if (pkg[field]) {
    if (pkg[field] instanceof Object) {
      Object
        .keys(pkg[field])
        .forEach(key => normalize(dir, pkg[field][key]))
    } else {
      normalize(dir, pkg[field])
    }
  }
}

function normalizeScripts (pkg, dir, files) {
  normalizeField(pkg, dir, 'bin')
  files.forEach(file => normalize(dir, file))
}

// Main function
function pkgOk (dir, { fields = [], bin = [] } = {}) {
  const pkgPath = path.join(dir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath))

  // Check files exist in package.json fields and additional fields
  const errors = checkFields(pkg, dir, fields)

  if (errors.length) {
    const message = errors
      .map(({ type, content }) => {
        let err = []
        if (type === 'doesNotExist') {
          err.push(`${content} path doesn't exist in package.json`)
        }
        if (type === 'needsRelativePath') {
          err.push(`${content} must use a relative path for value (and key when value is an object)`)
        }
        return err.reduce((mem, curr) => curr.concat(mem), [])
      })
      .join('\n')

    throw new Error(message)
  }

  // Normalize line endings for bin scripts and additional scripts
  normalizeScripts(pkg, dir, bin)

  return []
}

module.exports = pkgOk
