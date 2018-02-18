const fs = require('fs')
const path = require('path')
const mock = require('mock-fs')
const expect = require('expect')
const pkgOk = require('./')

expect(pkgOk(__dirname)).toEqual([])

mock({
  '/A/package.json': JSON.stringify({
    main: 'unknown.js',
    bin: 'unknown.js',
    module: 'unknown.js'
  }),
  '/B/package.json': JSON.stringify({
    bin: {
      X: 'unknown.js',
      Y: 'unknown.js'
    }
  }),
  '/C/package.json': JSON.stringify({
    foo: 'unknown.js'
  }),
  '/D/package.json': JSON.stringify({
    foo: {
      bar: 'bar',
      baz: 'baz'
    }
  }),
  '/E/package.json': JSON.stringify({
    bin: 'script.js'
  }),
  '/E/script.js': 'foo\r\nbar',
  '/E/another-script.js': 'baz\r\nqux'
})

expect(pkgOk(path.join('/A'))).toEqual([
  'main',
  'bin',
  'module'
])

expect(pkgOk(path.join('/B'))).toEqual([
  'bin.X',
  'bin.Y'
])

expect(pkgOk(path.join('/C'), { fields: [ 'foo' ] })).toEqual([
  'foo'
])

expect(pkgOk(path.join('/D'), { fields: [ 'foo' ] })).toEqual([
  'foo.bar',
  'foo.baz'
])

pkgOk(path.join('/E'), { bin: ['another-script.js'] })
expect(fs.readFileSync('/E/script.js')).toEqual('foo\nbar')
expect(fs.readFileSync('/E/another-script.js')).toEqual('baz\nqux')
