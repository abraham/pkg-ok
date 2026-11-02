import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { pkgOk } from './index.ts';
import { isPacked, isPublishable } from './packed.ts';

describe('isPacked', () => {
  const packed = new Set(['package.json', 'dist/index.js', 'lib/a/b.js']);

  it('matches files with or without ./', () => {
    assert.ok(isPacked(packed, './dist/index.js'));
    assert.ok(isPacked(packed, 'dist/index.js'));
    assert.ok(isPacked(packed, '.\\dist\\index.js'));
    assert.ok(!isPacked(packed, './dist/other.js'));
  });

  it('matches directories that contain packed files', () => {
    assert.ok(isPacked(packed, './lib'));
    assert.ok(isPacked(packed, './lib/a/'));
    assert.ok(!isPacked(packed, './li'));
  });
});

describe('isPublishable', () => {
  it('needs a name and version and no private flag', () => {
    assert.ok(isPublishable({ name: 'a', version: '1.0.0' }));
    assert.ok(!isPublishable({ name: 'a', version: '1.0.0', private: true }));
    assert.ok(!isPublishable({ name: 'a' }));
    assert.ok(!isPublishable({}));
  });
});

describe('published check', () => {
  let directory = '';

  function write(files: Record<string, string>) {
    for (const [file, content] of Object.entries(files)) {
      mkdirSync(dirname(join(directory, file)), { recursive: true });
      writeFileSync(join(directory, file), content);
    }
  }

  before(() => {
    directory = mkdtempSync(join(tmpdir(), 'pkg-ok-packed-'));
    const pkg = { name: 'p', version: '1.0.0' };
    write({
      'files/package.json': JSON.stringify({
        ...pkg,
        files: ['dist'],
        main: './lib/index.js',
        types: './dist/index.d.ts',
      }),
      'files/lib/index.js': '',
      'files/dist/index.d.ts': '',
      'npmignore/package.json': JSON.stringify({ ...pkg, main: './lib/index.js' }),
      'npmignore/.npmignore': 'lib\n',
      'npmignore/lib/index.js': '',
      'directory/package.json': JSON.stringify({ ...pkg, files: ['lib'], main: './lib' }),
      'directory/lib/index.js': '',
      'private/package.json': JSON.stringify({
        ...pkg,
        private: true,
        files: ['dist'],
        main: './lib/index.js',
      }),
      'private/lib/index.js': '',
      'scripts/package.json': JSON.stringify({
        ...pkg,
        main: './index.js',
        scripts: { prepack: "node -e \"require('fs').writeFileSync('marker', '')\"" },
      }),
      'scripts/index.js': '',
    });
  });

  after(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it('reports paths left out by files', () => {
    assert.throws(() => pkgOk(join(directory, 'files')), {
      message: "main path exists but isn't published; check files and .npmignore",
    });
  });

  it('reports paths left out by .npmignore', () => {
    assert.throws(
      () => pkgOk(join(directory, 'npmignore')),
      /main path exists but isn't published/,
    );
  });

  it('accepts directories with published files', () => {
    assert.doesNotThrow(() => pkgOk(join(directory, 'directory')));
  });

  it('skips private packages and published: false', () => {
    assert.doesNotThrow(() => pkgOk(join(directory, 'private')));
    assert.doesNotThrow(() => pkgOk(join(directory, 'files'), { published: false }));
  });

  it("doesn't run lifecycle scripts", () => {
    pkgOk(join(directory, 'scripts'));
    assert.throws(() => rmSync(join(directory, 'scripts/marker')), { code: 'ENOENT' });
  });
});
