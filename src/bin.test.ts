import { beforeAll, describe, expect, it } from '@jest/globals';
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

let directory = '';

describe('pkg-ok', () => {
  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-ok-'));
    fs.mkdirSync(path.join(directory, 'A'));
    fs.writeFileSync(
      path.join(directory, 'A/package.json'),
      JSON.stringify({
        main: 'unknown.js',
        bin: 'unknown.js',
        types: 'unknown.js',
        typings: 'unknown.js',
        module: 'unknown.js',
        es2015: 'unknown.js',
        browser: 'unknown.js',
        exports: 'unknown.js',
      })
    );
    fs.mkdirSync(path.join(directory, 'B'));
    fs.writeFileSync(
      path.join(directory, 'B/package.json'),
      JSON.stringify({
        bin: {
          X: 'unknown.js',
          Y: 'unknown.js',
        },
      })
    );
    fs.mkdirSync(path.join(directory, 'C'));
    fs.writeFileSync(
      path.join(directory, 'C/package.json'),
      JSON.stringify({
        foo: 'unknown.js',
      })
    );
    fs.mkdirSync(path.join(directory, 'D'));
    fs.writeFileSync(
      path.join(directory, 'D/package.json'),
      JSON.stringify({
        foo: {
          bar: 'bar',
          baz: 'baz',
        },
      })
    );
    fs.mkdirSync(path.join(directory, 'E'));
    fs.writeFileSync(
      path.join(directory, 'E/package.json'),
      JSON.stringify({
        bin: './script.js',
      })
    );
    fs.writeFileSync(path.join(directory, 'E/script.js'), 'foo\r\nbar');
    fs.writeFileSync(path.join(directory, 'E/another-script.js'), 'baz\r\nqux');
    fs.mkdirSync(path.join(directory, 'F'));
    fs.mkdirSync(path.join(directory, 'F', 'dist'));
    fs.writeFileSync(
      path.join(directory, 'F/package.json'),
      JSON.stringify({
        browser: {
          './dist/lib.cjs.js': './dist/lib.cjs.browser.js',
          './dist/lib.esm.js': './dist/lib.esm.browser.js',
        },
      })
    );
    fs.writeFileSync(path.join(directory, 'F/dist/lib.cjs.browser.js'), 'cjs');
    fs.writeFileSync(path.join(directory, 'F/dist/lib.esm.browser.js'), 'esm');
    fs.mkdirSync(path.join(directory, 'G'));
    fs.mkdirSync(path.join(directory, 'G', 'dist'));
    fs.writeFileSync(
      path.join(directory, 'G/package.json'),
      JSON.stringify({
        browser: {
          'dist/lib.cjs.js': './dist/lib.cjs.browser.js',
          './dist/lib.esm.js': 'dist/lib.esm.browser.js',
        },
      })
    );
    fs.writeFileSync(path.join(directory, 'G/dist/lib.cjs.js'), './dist/lib.cjs.browser.js');
  });

  it('checks /A', (done) => {
    execFile('node', ['dist/bin.js', path.join(directory, 'A')], (_error, stdout) => {
      expect(stdout).toMatch(
        /main[\s\S]*bin[\s\S]*types[\s\S]*typings[\s\S]*module[\s\S]*es2015[\s\S]*browser[\s\S]*exports/
      );
      done();
    });
  });

  it('checks /B', (done) => {
    execFile('node', ['dist/bin.js', path.join(directory, 'B')], (_error, stdout) => {
      expect(stdout).toMatch(/bin\.X[\s\S]*bin\.Y/);
      done();
    });
  });

  it('checks /C', (done) => {
    execFile(
      'node',
      ['dist/bin.js', path.join(directory, 'C'), '--field', 'foo'],
      (_error, stdout) => {
        expect(stdout).toMatch(/foo/);
        done();
      }
    );
  });

  it('checks /D', (done) => {
    execFile(
      'node',
      ['dist/bin.js', path.join(directory, 'D'), '--field', 'foo'],
      (_error, stdout) => {
        expect(stdout).toMatch(/foo\.bar[\s\S]*foo\.baz/);
        done();
      }
    );
  });

  it('checks /E', (done) => {
    execFile(
      'node',
      ['dist/bin.js', path.join(directory, 'E'), '--bin', 'another-script.js'],
      () => {
        expect(fs.readFileSync(path.join(directory, '/E/script.js'), 'utf-8')).toEqual('foo\nbar');
        expect(fs.readFileSync(path.join(directory, '/E/another-script.js'), 'utf-8')).toEqual(
          'baz\nqux'
        );
        done();
      }
    );
  });

  it('checks /F', (done) => {
    execFile(
      'node',
      ['dist/bin.js', path.join(directory, 'F'), '--bin', 'another-script.js'],
      () => {
        expect(
          fs.readFileSync(path.join(directory, '/F/dist/lib.cjs.browser.js'), 'utf-8')
        ).toEqual('cjs');
        expect(
          fs.readFileSync(path.join(directory, '/F/dist/lib.esm.browser.js'), 'utf-8')
        ).toEqual('esm');
        done();
      }
    );
  });

  it('checks /G', (done) => {
    execFile(
      'node',
      ['dist/bin.js', path.join(directory, 'G'), '--bin', 'another-script.js'],
      (_error, stdout) => {
        expect(stdout).toMatch(/browser.*path[\s\S]*browser.*path[\s\S]*browser.*must/);
        done();
      }
    );
  });
});
