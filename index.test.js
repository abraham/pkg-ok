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
  })

  afterEach(() => mock.restore())

  it('checks /A', () => {
    expect(() => pkgOk(path.join('/A'))).toThrowError(/main[\s\S]*bin[\s\S]*module/)
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
})
