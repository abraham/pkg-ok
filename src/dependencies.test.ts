import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { checkDependencies } from './dependencies.ts';

let directory = '';

function writeFiles(files: Record<string, string>) {
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(directory, file)), { recursive: true });
    writeFileSync(join(directory, file), content);
  }
}

function link(target: string, path: string) {
  mkdirSync(dirname(join(directory, path)), { recursive: true });
  symlinkSync(join(directory, target), join(directory, path), 'junction');
}

describe('checkDependencies', () => {
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'pkg-ok-'));
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  it('reports local direct dependency links but ignores installed package-store links', () => {
    writeFiles({
      'consumer/node_modules/.pnpm/store-dep@1.0.0/node_modules/store-dep/package.json': '{}',
      'consumer/node_modules/ordinary-dep/package.json': '{}',
      'workspace/local-dep/package.json': '{}',
      'workspace/scoped-dep/package.json': '{}',
      'workspace/optional-dep/package.json': '{}',
      'workspace/peer-dep/package.json': '{}',
      'workspace/dev-dep/package.json': '{}',
      'consumer/package.json': '{}',
    });
    link('workspace/local-dep', 'consumer/node_modules/local-dep');
    link('workspace/missing-dep', 'consumer/node_modules/broken-dep');
    link('workspace/scoped-dep', 'consumer/node_modules/@scope/scoped-dep');
    link('workspace/optional-dep', 'consumer/node_modules/optional-dep');
    link('workspace/peer-dep', 'consumer/node_modules/peer-dep');
    link('workspace/dev-dep', 'consumer/node_modules/dev-dep');
    link(
      'consumer/node_modules/.pnpm/store-dep@1.0.0/node_modules/store-dep',
      'consumer/node_modules/store-dep',
    );

    assert.deepEqual(
      checkDependencies(
        {
          dependencies: {
            'local-dep': '*',
            'broken-dep': '*',
            '@scope/scoped-dep': '*',
            'store-dep': '*',
            'ordinary-dep': '*',
          },
          optionalDependencies: { 'optional-dep': '*' },
          peerDependencies: { 'peer-dep': '*' },
          devDependencies: { 'dev-dep': '*' },
        },
        join(directory, 'consumer'),
      ),
      [
        `Dependency "local-dep" is linked to ${join('..', 'workspace', 'local-dep')}; install it from the registry before publishing`,
        `Dependency "broken-dep" is linked to ${join(directory, 'workspace', 'missing-dep')} (missing); install it from the registry before publishing`,
        `Dependency "@scope/scoped-dep" is linked to ${join('..', 'workspace', 'scoped-dep')}; install it from the registry before publishing`,
        `Dependency "optional-dep" is linked to ${join('..', 'workspace', 'optional-dep')}; install it from the registry before publishing`,
        `Dependency "peer-dep" is linked to ${join('..', 'workspace', 'peer-dep')}; install it from the registry before publishing`,
      ],
    );
  });

  it('ignores dependencies that are not installed', () => {
    writeFiles({ 'consumer/package.json': '{}' });
    assert.deepEqual(
      checkDependencies({ dependencies: { missing: '*' } }, join(directory, 'consumer')),
      [],
    );
  });
});
