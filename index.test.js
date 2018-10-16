const fs = require('fs')
const path = require('path')
const mock = require('mock-fs')
const pkgOk = require('./')

describe('pkg-ok', () => {
  beforeEach(() => {
    mock({
      '/A/package.json': JSON.stringify({
        main: 'unknown.js',
        bin: 'unknown.js',
        types: 'unknown.js',
        typings: 'unknown.js',
        module: 'unknown.js',
        es2015: 'unknown.js',
        browser: 'unknown.js'
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
      '/E/another-script.js': 'baz\r\nqux',
      '/F/package.json': JSON.stringify({
        'browser': {
          './dist/lib.cjs.js': './dist/lib.cjs.browser.js',
          './dist/lib.esm.js': './dist/lib.esm.browser.js'
        }
      }),
      '/F/dist/lib.cjs.browser.js': 'cjs',
      '/F/dist/lib.esm.browser.js': 'esm',
      '/G/package.json': JSON.stringify({
        'browser': {
          'dist/lib.cjs.js': './dist/lib.cjs.browser.js',
          './dist/lib.esm.js': 'dist/lib.esm.browser.js'
        }
      }),
      '/G/dist/lib.cjs.js': './dist/lib.cjs.browser.js'
    })
  })

  afterEach(() => mock.restore())

  it('checks /A', () => {
    expect(() => pkgOk(path.join('/A'))).toThrowError(/main[\s\S]*bin[\s\S]*types[\s\S]*typings[\s\S]*module[\s\S]*es2015[\s\S]*browser path[\s\S]*browser must/)
  })

  it('checks /B', () => {
    expect(() => pkgOk(path.join('/B'))).toThrowError(/bin\.X[\s\S]*bin\.Y/)
  })

  it('checks /C', () => {
    expect(() => pkgOk(path.join('/C'), { fields: [ 'foo' ] }).toThrowError(/foo/))
  })

  it('checks /D', () => {
    expect(() => pkgOk(path.join('/D'), { fields: [ 'foo' ] })).toThrowError(/foo\.bar[\s\S]*foo\.baz/)
  })

  it('checks /E', () => {
    pkgOk(path.join('/E'), { bin: ['another-script.js'] })
    expect(fs.readFileSync('/E/script.js', 'utf-8')).toEqual('foo\nbar')
    expect(fs.readFileSync('/E/another-script.js', 'utf-8')).toEqual('baz\nqux')
  })

  it('checks /F', () => {
    pkgOk(path.join('/F'))
    expect(fs.readFileSync('/F/dist/lib.cjs.browser.js', 'utf-8')).toEqual('cjs')
    expect(fs.readFileSync('/F/dist/lib.esm.browser.js', 'utf-8')).toEqual('esm')
  })
  it('checks /G', () => {
    expect(() => pkgOk(path.join('/G'))).toThrowError(/browser.*path[\s\S]*browser.*must[\s\S]*browser.*path[\s\S]*browser.*must/)
  })
})
