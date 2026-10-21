import { afterEach, describe, expect, it } from '@jest/globals';
import mock from 'mock-fs';
import { checkLinkedDependencies } from './linked-dependencies.js';

describe('checkLinkedDependencies', () => {
  afterEach(() => mock.restore());

  it('reports local direct dependency links but ignores installed package-store links', () => {
    mock({
      '/consumer/node_modules/local-dep': mock.symlink({ path: '/workspace/local-dep' }),
      '/consumer/node_modules/broken-dep': mock.symlink({ path: '/workspace/missing-dep' }),
      '/consumer/node_modules/@scope/scoped-dep': mock.symlink({ path: '/workspace/scoped-dep' }),
      '/consumer/node_modules/optional-dep': mock.symlink({ path: '/workspace/optional-dep' }),
      '/consumer/node_modules/peer-dep': mock.symlink({ path: '/workspace/peer-dep' }),
      '/consumer/node_modules/dev-dep': mock.symlink({ path: '/workspace/dev-dep' }),
      '/consumer/node_modules/store-dep': mock.symlink({
        path: '/consumer/node_modules/.pnpm/store-dep@1.0.0/node_modules/store-dep',
      }),
      '/consumer/node_modules/.pnpm/store-dep@1.0.0/node_modules/store-dep/package.json': '{}',
      '/consumer/node_modules/ordinary-dep/package.json': '{}',
      '/workspace/local-dep/package.json': '{}',
      '/workspace/scoped-dep/package.json': '{}',
      '/workspace/optional-dep/package.json': '{}',
      '/workspace/peer-dep/package.json': '{}',
      '/workspace/dev-dep/package.json': '{}',
      '/consumer/package.json': '{}',
    });

    expect(
      checkLinkedDependencies(
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
        '/consumer',
      ),
    ).toEqual([
      'Dependency "local-dep" is linked to a local package',
      'Dependency "broken-dep" is linked to a local package',
      'Dependency "@scope/scoped-dep" is linked to a local package',
      'Dependency "optional-dep" is linked to a local package',
      'Dependency "peer-dep" is linked to a local package',
    ]);
  });

  it('ignores dependencies that are not installed', () => {
    mock({ '/consumer/package.json': '{}' });
    expect(checkLinkedDependencies({ dependencies: { missing: '*' } }, '/consumer')).toEqual([]);
  });
});
