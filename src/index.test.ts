import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { pkgOk } from './index.js';

let directory = '';

describe('pkg-ok', () => {
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'pkg-ok-'));
    const files: Record<string, string> = {
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
    };
    for (const [file, content] of Object.entries(files)) {
      mkdirSync(dirname(join(directory, file)), { recursive: true });
      writeFileSync(join(directory, file), content);
    }
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  it('checks /A', () => {
    expect(() => pkgOk(join(directory, 'A'))).toThrow(
      /main[\s\S]*bin[\s\S]*types[\s\S]*typings[\s\S]*module[\s\S]*es2015[\s\S]*browser[\s\S]*exports/,
    );
  });

  it('checks /B', () => {
    expect(() => pkgOk(join(directory, 'B'))).toThrow(/bin\.X[\s\S]*bin\.Y/);
  });

  it('checks /C', () => {
    expect(() => pkgOk(join(directory, 'C'), { fields: ['foo'] })).toThrow(/foo/);
  });

  it('checks /D', () => {
    expect(() => pkgOk(join(directory, 'D'), { fields: ['foo'] })).toThrow(
      /foo\.bar[\s\S]*foo\.baz/,
    );
  });

  it('checks /E', () => {
    pkgOk(join(directory, 'E'), { bin: ['another-script.js'] });
    expect(readFileSync(join(directory, 'E/script.js'), 'utf-8')).toEqual('foo\nbar');
    expect(readFileSync(join(directory, 'E/another-script.js'), 'utf-8')).toEqual('baz\nqux');
  });

  it('checks /F', () => {
    pkgOk(join(directory, 'F'));
    expect(readFileSync(join(directory, 'F/dist/lib.cjs.browser.js'), 'utf-8')).toEqual('cjs');
    expect(readFileSync(join(directory, 'F/dist/lib.esm.browser.js'), 'utf-8')).toEqual('esm');
  });

  it('checks /G', () => {
    expect(() => pkgOk(join(directory, 'G'))).toThrow(
      /browser.*path[\s\S]*browser.*path[\s\S]*browser.*must/,
    );
  });
});
