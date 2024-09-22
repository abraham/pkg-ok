import { beforeAll, describe, expect, it } from '@jest/globals';
import { execFile } from 'child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

let directory = '';

describe('pkg-ok', () => {
  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), 'pkg-ok-'));
    mkdirSync(join(directory, 'A'));
    writeFileSync(
      join(directory, 'A/package.json'),
      JSON.stringify({
        main: 'unknown.js',
        bin: 'unknown.js',
        types: 'unknown.js',
        typings: 'unknown.js',
        module: 'unknown.js',
        es2015: 'unknown.js',
        browser: 'unknown.js',
        exports: 'unknown.js',
      }),
    );
    mkdirSync(join(directory, 'B'));
    writeFileSync(
      join(directory, 'B/package.json'),
      JSON.stringify({
        bin: {
          X: 'unknown.js',
          Y: 'unknown.js',
        },
      }),
    );
    mkdirSync(join(directory, 'C'));
    writeFileSync(
      join(directory, 'C/package.json'),
      JSON.stringify({
        foo: 'unknown.js',
      }),
    );
    mkdirSync(join(directory, 'D'));
    writeFileSync(
      join(directory, 'D/package.json'),
      JSON.stringify({
        foo: {
          bar: 'bar',
          baz: 'baz',
        },
      }),
    );
    mkdirSync(join(directory, 'E'));
    writeFileSync(
      join(directory, 'E/package.json'),
      JSON.stringify({
        bin: './script.js',
      }),
    );
    writeFileSync(join(directory, 'E/script.js'), 'foo\r\nbar');
    writeFileSync(join(directory, 'E/another-script.js'), 'baz\r\nqux');
    mkdirSync(join(directory, 'F'));
    mkdirSync(join(directory, 'F', 'dist'));
    writeFileSync(
      join(directory, 'F/package.json'),
      JSON.stringify({
        browser: {
          './dist/lib.cjs.js': './dist/lib.cjs.browser.js',
          './dist/lib.esm.js': './dist/lib.esm.browser.js',
        },
      }),
    );
    writeFileSync(join(directory, 'F/dist/lib.cjs.browser.js'), 'cjs');
    writeFileSync(join(directory, 'F/dist/lib.esm.browser.js'), 'esm');
    mkdirSync(join(directory, 'G'));
    mkdirSync(join(directory, 'G', 'dist'));
    writeFileSync(
      join(directory, 'G/package.json'),
      JSON.stringify({
        browser: {
          'dist/lib.cjs.js': './dist/lib.cjs.browser.js',
          './dist/lib.esm.js': 'dist/lib.esm.browser.js',
        },
      }),
    );
    writeFileSync(join(directory, 'G/dist/lib.cjs.js'), './dist/lib.cjs.browser.js');
  });

  it('checks /A', (done) => {
    execFile('node', ['dist/bin.js', join(directory, 'A')], (_error, stdout) => {
      expect(stdout).toMatch(
        /main[\s\S]*bin[\s\S]*types[\s\S]*typings[\s\S]*module[\s\S]*es2015[\s\S]*browser[\s\S]*exports/,
      );
      done();
    });
  });

  it('checks /B', (done) => {
    execFile('node', ['dist/bin.js', join(directory, 'B')], (_error, stdout) => {
      expect(stdout).toMatch(/bin\.X[\s\S]*bin\.Y/);
      done();
    });
  });

  it('checks /C', (done) => {
    execFile('node', ['dist/bin.js', join(directory, 'C'), '--field', 'foo'], (_error, stdout) => {
      expect(stdout).toMatch(/foo/);
      done();
    });
  });

  it('checks /D', (done) => {
    execFile('node', ['dist/bin.js', join(directory, 'D'), '--field', 'foo'], (_error, stdout) => {
      expect(stdout).toMatch(/foo\.bar[\s\S]*foo\.baz/);
      done();
    });
  });

  it('checks /E', (done) => {
    execFile('node', ['dist/bin.js', join(directory, 'E'), '--bin', 'another-script.js'], () => {
      expect(readFileSync(join(directory, '/E/script.js'), 'utf-8')).toEqual('foo\nbar');
      expect(readFileSync(join(directory, '/E/another-script.js'), 'utf-8')).toEqual('baz\nqux');
      done();
    });
  });

  it('checks /F', (done) => {
    execFile('node', ['dist/bin.js', join(directory, 'F'), '--bin', 'another-script.js'], () => {
      expect(readFileSync(join(directory, '/F/dist/lib.cjs.browser.js'), 'utf-8')).toEqual('cjs');
      expect(readFileSync(join(directory, '/F/dist/lib.esm.browser.js'), 'utf-8')).toEqual('esm');
      done();
    });
  });

  it('checks /G', (done) => {
    execFile(
      'node',
      ['dist/bin.js', join(directory, 'G'), '--bin', 'another-script.js'],
      (_error, stdout) => {
        expect(stdout).toMatch(/browser.*path[\s\S]*browser.*path[\s\S]*browser.*must/);
        done();
      },
    );
  });
});
