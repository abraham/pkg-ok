# pkg-ok [![Build status](https://github.com/abraham/pkg-ok/actions/workflows/index.yaml/badge.svg)](https://github.com/abraham/pkg-ok/actions/workflows/index.yaml) [![npm](https://img.shields.io/npm/v/pkg-ok.svg)](https://www.npmjs.com/package/pkg-ok)

> `pkg-ok` checks paths and scripts defined in `package.json` before you publish 👌

- Ensures paths defined in `main`, `bin`, `module`, `types`, `typings`, `es2015`, `browser`, and `exports` exist
- Ensures those paths will be published, so they aren't left out by `files` or `.npmignore`
- Ensures paths defined in `main`, `bin`, and `browser` are relative
- Ensures `bin` scripts use cross-platform line endings

## Usage

```sh
npm install pkg-ok --save-dev
```

```js
// package.json
{
  "main": "oops_this_file_doesnt_exist.js",
  "scripts": {
    "prepublishOnly": "... && pkg-ok"
  }
}
```

```sh
npm publish
# Error!
# Since main file doesn't exist, publish is blocked
```

## CLI

Check the `package.json` in the current directory.

```sh
pkg-ok
```

Check the `package.json` in a specific directory.

```sh
pkg-ok some/directory
pkg-ok some/directory/package.json
```

Check several packages, such as in a monorepo. Quote globs so `pkg-ok` expands them; `node_modules` is skipped and `.gitignore` is not read.

```sh
pkg-ok . packages/a packages/b
pkg-ok 'packages/*'
pkg-ok '**/package.json'
```

Check additional `package.json` fields or bin files.

```sh
pkg-ok --field someField --bin script.sh
```

The published check runs `npm pack --dry-run --ignore-scripts`, so npm must be installed. It's skipped for `private` packages and packages without a `name` or `version`. Turn it off with `--no-published`.

```sh
pkg-ok --no-published
```

## API

```js
const pkgDirectory = __dirname;

pkgOk(pkgDirectory, {
  fields: ['someAdditonalField'],
  bin: ['someAdditionalScript.sh'],
});
```

## License

MIT
