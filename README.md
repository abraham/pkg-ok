# pkg-ok [![Build Status](https://img.shields.io/travis/typicode/pkg-ok.svg?style=flat-square)](https://travis-ci.org/typicode/pkg-ok) [![npm](https://img.shields.io/npm/v/pkg-ok.svg?style=flat-square)](https://www.npmjs.com/package/pkg-ok)

> `pkg-ok` checks paths and scripts defined in `package.json` before you publish 👌

* Ensures paths defined in `main`, `bin`, `module`, `types`, `typings`, `es2015` and `browser` exist
* Ensures `bin` scripts use cross-platform line endings

<a href="https://www.patreon.com/typicode">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

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

MIT

[Patreon](https://www.patreon.com/typicode) - [Supporters](https://thanks.typicode.com) ✨