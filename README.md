# pkg-ok [![Build status](https://github.com/abraham/pkg-ok/actions/workflows/index.yaml/badge.svg)](https://github.com/abraham/pkg-ok/actions/workflows/index.yaml) [![npm](https://img.shields.io/npm/v/pkg-ok.svg)](https://www.npmjs.com/package/pkg-ok)

> `pkg-ok` checks paths and scripts defined in `package.json` before you publish 👌

- Ensures paths defined in `main`, `bin`, `module`, `types`, `typings`, `es2015`, `browser`, and `exports` exist
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

## Options

`pkg-ok` can be configured to check additional `package.json` fields or bin files

```
pkg-ok --field someField --bin script.sh
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
