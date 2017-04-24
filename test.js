const path = require('path')
const mock = require('mock-fs')
const expect = require('expect')
const pkgOk = require('./')

expect(pkgOk(__dirname)).toEqual([])

mock({
  '/A/package.json': JSON.stringify({
    main: 'unknown.js',
    bin: 'unknown.js'
  }),
  '/B/package.json': JSON.stringify({
    bin: {
      X: 'unknown.js',
      Y: 'unknown.js'
    }
  }),
  '/C/package.json': JSON.stringify({
    module: 'unknown.js'
  })
})

expect(pkgOk(path.join('/A'))).toEqual([
  'main',
  'bin'
])

expect(pkgOk(path.join('/B'))).toEqual([
  'bin.X',
  'bin.Y'
])

expect(pkgOk(path.join('/C'), [ 'module' ])).toEqual([
  'module'
])
