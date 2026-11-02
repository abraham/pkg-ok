import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { pkgOk } from './index.ts';

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
      '/H/package.json': JSON.stringify({
        exports: {
          '.': {
            types: './index.d.ts',
            import: './index.js',
            require: './index.cjs',
          },
          './features/*.js': './features/*.js',
          './internal/*': null,
          './package.json': './package.json',
        },
        browser: {
          fs: false,
          './index.js': './browser.js',
        },
      }),
      '/H/index.d.ts': '',
      '/H/index.js': '',
      '/H/index.cjs': '',
      '/H/browser.js': '',
      '/I/package.json': JSON.stringify({
        exports: {
          '.': {
            node: { import: './missing.mjs' },
            default: ['./index.js', './fallback.js'],
          },
        },
      }),
      '/I/index.js': '',
      '/J/package.json': 'null',
      '/K/package.json': '[]',
    };
    for (const [file, content] of Object.entries(files)) {
      mkdirSync(dirname(join(directory, file)), { recursive: true });
      writeFileSync(join(directory, file), content);
    }
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  it('checks /A', () => {
    assert.throws(
      () => pkgOk(join(directory, 'A')),
      /main[\s\S]*bin[\s\S]*types[\s\S]*typings[\s\S]*module[\s\S]*es2015[\s\S]*browser[\s\S]*exports/,
    );
  });

  it('checks /B', () => {
    assert.throws(() => pkgOk(join(directory, 'B')), /bin\.X[\s\S]*bin\.Y/);
  });

  it('checks /C', () => {
    assert.throws(() => pkgOk(join(directory, 'C'), { fields: ['foo'] }), /foo/);
  });

  it('checks /D', () => {
    assert.throws(
      () => pkgOk(join(directory, 'D'), { fields: ['foo'] }),
      /foo\.bar[\s\S]*foo\.baz/,
    );
  });

  it('checks /E', () => {
    pkgOk(join(directory, 'E'), { bin: ['another-script.js'] });
    assert.equal(readFileSync(join(directory, 'E/script.js'), 'utf-8'), 'foo\nbar');
    assert.equal(readFileSync(join(directory, 'E/another-script.js'), 'utf-8'), 'baz\nqux');
  });

  it('checks /F', () => {
    pkgOk(join(directory, 'F'));
    assert.equal(readFileSync(join(directory, 'F/dist/lib.cjs.browser.js'), 'utf-8'), 'cjs');
    assert.equal(readFileSync(join(directory, 'F/dist/lib.esm.browser.js'), 'utf-8'), 'esm');
  });

  it('checks /G', () => {
    assert.throws(
      () => pkgOk(join(directory, 'G')),
      /browser.*path[\s\S]*browser.*path[\s\S]*browser.*must/,
    );
  });

  it('checks /H', () => {
    assert.doesNotThrow(() => pkgOk(join(directory, 'H')));
  });

  it('checks /J', () => {
    assert.throws(() => pkgOk(join(directory, 'J')), /package\.json must contain a JSON object/);
  });

  it('checks /K', () => {
    assert.throws(() => pkgOk(join(directory, 'K')), /package\.json must contain a JSON object/);
  });

  it('checks /I', () => {
    assert.throws(() => pkgOk(join(directory, 'I')), {
      message: /^exports\.\.\.node\.import path[^\n]*\nexports\.\.\.default\.1 path[^\n]*$/,
    });
  });
});
