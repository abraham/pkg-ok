import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { readFileSync } from 'fs';
import mock from 'mock-fs';
import { join } from 'path';
import { pkgOk } from './index.js';

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
        browser: 'unknown.js',
        exports: 'unknown.js',
      }),
      '/B/package.json': JSON.stringify({
        bin: {
          X: 'unknown.js',
          Y: 'unknown.js',
        },
      }),
      '/C/package.json': JSON.stringify({
        foo: 'unknown.js',
      }),
      '/D/package.json': JSON.stringify({
        foo: {
          bar: 'bar',
          baz: 'baz',
        },
      }),
      '/E/package.json': JSON.stringify({
        bin: './script.js',
      }),
      '/E/script.js': 'foo\r\nbar',
      '/E/another-script.js': 'baz\r\nqux',
      '/F/package.json': JSON.stringify({
        browser: {
          './dist/lib.cjs.js': './dist/lib.cjs.browser.js',
          './dist/lib.esm.js': './dist/lib.esm.browser.js',
        },
      }),
      '/F/dist/lib.cjs.browser.js': 'cjs',
      '/F/dist/lib.esm.browser.js': 'esm',
      '/G/package.json': JSON.stringify({
        browser: {
          'dist/lib.cjs.js': './dist/lib.cjs.browser.js',
          './dist/lib.esm.js': 'dist/lib.esm.browser.js',
        },
      }),
      '/G/dist/lib.cjs.js': './dist/lib.cjs.browser.js',
    });
  });

  afterEach(() => mock.restore());

  it('checks /A', () => {
    expect(() => pkgOk(join('/A'))).toThrowError(
      /main[\s\S]*bin[\s\S]*types[\s\S]*typings[\s\S]*module[\s\S]*es2015[\s\S]*browser[\s\S]*exports/,
    );
  });

  it('checks /B', () => {
    expect(() => pkgOk(join('/B'))).toThrowError(/bin\.X[\s\S]*bin\.Y/);
  });

  it('checks /C', () => {
    expect(() => pkgOk(join('/C'), { fields: ['foo'] })).toThrowError(/foo/);
  });

  it('checks /D', () => {
    expect(() => pkgOk(join('/D'), { fields: ['foo'] })).toThrowError(/foo\.bar[\s\S]*foo\.baz/);
  });

  it('checks /E', () => {
    pkgOk(join('/E'), { bin: ['another-script.js'] });
    expect(readFileSync('/E/script.js', 'utf-8')).toEqual('foo\nbar');
    expect(readFileSync('/E/another-script.js', 'utf-8')).toEqual('baz\nqux');
  });

  it('checks /F', () => {
    pkgOk(join('/F'));
    expect(readFileSync('/F/dist/lib.cjs.browser.js', 'utf-8')).toEqual('cjs');
    expect(readFileSync('/F/dist/lib.esm.browser.js', 'utf-8')).toEqual('esm');
  });

  it('checks /G', () => {
    expect(() => pkgOk(join('/G'))).toThrowError(
      /browser.*path[\s\S]*browser.*path[\s\S]*browser.*must/,
    );
  });
});
