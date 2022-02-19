# pkg-ok [![Build status](https://github.com/abraham/pkg-ok/actions/workflows/index.yaml/badge.svg)](https://github.com/abraham/pkg-ok/actions/workflows/index.yaml) [![npm](https://img.shields.io/npm/v/@abraham/pkg-ok.svg)](https://www.npmjs.com/package/@abraham/pkg-ok)

> `pkg-ok` checks paths and scripts defined in `package.json` before you publish 👌

* Ensures paths defined in `main`, `bin`, `module`, `types`, `typings`, `es2015` and `browser` exist
* Ensures `bin` scripts use cross-platform line endings

_This is a modernized fork of [typicode/pkg-ok](https://github.com/typicode/pkg-ok)._

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
const pkgDirectory = __dirname

pkgOk(pkgDirectory, {
  fields: ['someAdditonalField'],
  bin: ['someAdditionalScript.sh']
})
```

## License

MIT
