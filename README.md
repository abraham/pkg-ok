# pkg-ok [![Build Status](https://img.shields.io/travis/typicode/pkg-ok.svg?style=flat-square)](https://travis-ci.org/typicode/pkg-ok) [![npm](https://img.shields.io/npm/v/pkg-ok.svg?style=flat-square)](https://www.npmjs.com/package/pkg-ok)

> `pkg-ok` checks paths and scripts defined in `package.json` before you publish 👌

* Ensures paths defined in `main`, `bin`, `module`, `types`, `typings` and `es2015` exist
* Ensures `bin` scripts use cross-platform line endings

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
pkgOk --field someField --bin script.sh
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

MIT - [Typicode :cactus:](https://github.com/typicode) - [Patreon](https://patreon.com/typicode)
