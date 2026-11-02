import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../dist/bin.js', import.meta.url));

let directory = '';

function runIn(
  cwd: string,
  ...args: string[]
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile('node', [BIN, ...args], { cwd }, (error, stdout, stderr) => {
      resolve({ code: typeof error?.code === 'number' ? error.code : 0, stdout, stderr });
    });
  });
}

function run(...args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return runIn(process.cwd(), ...args);
}

describe('pkg-ok', () => {
  before(() => {
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
    for (const name of ['M/packages/x', 'M/packages/y', 'M/node_modules/z']) {
      mkdirSync(join(directory, name), { recursive: true });
    }
    writeFileSync(join(directory, 'M/packages/x/package.json'), '{}');
    writeFileSync(join(directory, 'M/packages/y/package.json'), '{}');
    writeFileSync(join(directory, 'M/node_modules/z/package.json'), '{"main": "missing.js"}');
  });

  it('checks /A', async () => {
    const { code, stdout, stderr } = await run(join(directory, 'A'));
    assert.equal(code, 1);
    assert.equal(stdout, '');
    assert.match(
      stderr,
      /main[\s\S]*bin[\s\S]*types[\s\S]*typings[\s\S]*module[\s\S]*es2015[\s\S]*browser[\s\S]*exports/,
    );
  });

  it('checks /B', async () => {
    const { code, stderr } = await run(join(directory, 'B'));
    assert.equal(code, 1);
    assert.match(stderr, /bin\.X[\s\S]*bin\.Y/);
  });

  it('checks /C', async () => {
    const { code, stderr } = await run(join(directory, 'C'), '--field', 'foo');
    assert.equal(code, 1);
    assert.match(stderr, /foo/);
  });

  it('checks /D', async () => {
    const { code, stderr } = await run(join(directory, 'D'), '--field', 'foo');
    assert.equal(code, 1);
    assert.match(stderr, /foo\.bar[\s\S]*foo\.baz/);
  });

  it('checks /E', async () => {
    const { code, stdout, stderr } = await run(join(directory, 'E'), '--bin', 'another-script.js');
    assert.equal(code, 0);
    assert.match(stdout, /Package ok/);
    assert.equal(stderr, '');
    assert.equal(readFileSync(join(directory, '/E/script.js'), 'utf-8'), 'foo\nbar');
    assert.equal(readFileSync(join(directory, '/E/another-script.js'), 'utf-8'), 'baz\nqux');
  });

  it('checks /F', async () => {
    await run(join(directory, 'F'), '--bin', 'another-script.js');
    assert.equal(readFileSync(join(directory, '/F/dist/lib.cjs.browser.js'), 'utf-8'), 'cjs');
    assert.equal(readFileSync(join(directory, '/F/dist/lib.esm.browser.js'), 'utf-8'), 'esm');
  });

  it('checks /G', async () => {
    const { code, stderr } = await run(join(directory, 'G'), '--bin', 'another-script.js');
    assert.equal(code, 1);
    assert.match(stderr, /browser.*path[\s\S]*browser.*path[\s\S]*browser.*must/);
  });

  it('checks a package.json path', async () => {
    const { code, stdout } = await run(join(directory, 'E/package.json'));
    assert.equal(code, 0);
    assert.match(stdout, /^Package ok$/m);
  });

  it('checks several packages and reports each one', async () => {
    const { code, stdout, stderr } = await runIn(directory, 'A', 'E');
    assert.equal(code, 1);
    assert.match(stderr, /^A: pkg-ok error$/m);
    assert.match(stdout, /^E: Package ok$/m);
  });

  it('expands globs and skips node_modules', async () => {
    const { code, stdout, stderr } = await runIn(join(directory, 'M'), '**/package.json');
    assert.equal(code, 0);
    assert.equal(stderr, '');
    assert.match(stdout, /^packages[\\/]x: Package ok$/m);
    assert.match(stdout, /^packages[\\/]y: Package ok$/m);
    assert.doesNotMatch(stdout, /node_modules/);
  });

  it('fails when a glob matches no packages', async () => {
    const { code, stderr } = await runIn(directory, 'missing/*');
    assert.equal(code, 1);
    assert.match(stderr, /missing\/\* matched no packages/);
  });
});
