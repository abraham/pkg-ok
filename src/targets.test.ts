import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { resolveTargets } from './targets.ts';

let root = '';

describe('resolveTargets', () => {
  before(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), 'pkg-ok-targets-')));
    for (const file of [
      'package.json',
      'packages/a/package.json',
      'packages/b/package.json',
      'packages/empty/.keep',
      'packages/notes.txt',
      'node_modules/dep/package.json',
      'packages/a/node_modules/dep/package.json',
    ]) {
      mkdirSync(dirname(join(root, file)), { recursive: true });
      writeFileSync(join(root, file), '{}');
    }
  });

  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('defaults to the current directory', () => {
    assert.deepEqual(resolveTargets([], root), [root]);
  });

  it('accepts a package.json path', () => {
    assert.deepEqual(resolveTargets(['package.json'], root), [root]);
  });

  it('accepts several inputs and removes duplicates', () => {
    assert.deepEqual(resolveTargets(['packages/a', 'packages/a/package.json', '.'], root), [
      join(root, 'packages/a'),
      root,
    ]);
  });

  it('expands globs to directories with a package.json', () => {
    assert.deepEqual(resolveTargets(['packages/*'], root), [
      join(root, 'packages/a'),
      join(root, 'packages/b'),
    ]);
  });

  it('skips node_modules in globs', () => {
    assert.deepEqual(resolveTargets(['**/package.json'], root), [
      root,
      join(root, 'packages/a'),
      join(root, 'packages/b'),
    ]);
  });

  it('skips node_modules paths expanded by the shell', () => {
    assert.deepEqual(resolveTargets(['packages/a', 'node_modules/dep/package.json'], root), [
      join(root, 'packages/a'),
    ]);
    assert.throws(() => resolveTargets(['node_modules/dep'], root), /No packages to check/);
  });

  it('rejects paths without a package.json', () => {
    assert.throws(
      () => resolveTargets(['packages/empty'], root),
      /packages\/empty is not a directory with a package\.json/,
    );
    assert.throws(() => resolveTargets(['missing'], root), /missing is not a directory/);
  });

  it('rejects globs that match no packages', () => {
    assert.throws(() => resolveTargets(['missing/*'], root), /missing\/\* matched no packages/);
  });
});
