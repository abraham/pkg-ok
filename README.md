# pkg-ok [![Build Status](https://img.shields.io/travis/typicode/pkg-ok.svg?style=flat-square)](https://travis-ci.org/typicode/pkg-ok) [![npm](https://img.shields.io/npm/v/pkg-ok.svg?style=flat-square)](https://www.npmjs.com/package/pkg-ok)

> Whether you're publishing a Node, React, Vue, or any kind of module on npm, pkg-ok will do some last minute checks before you publish

* Ensures paths declared in `main`, `bin`, `module`, `types`, `typings` and `es2015` exists
* Ensures `bin` scripts uses cross-platform line endings

Also pkg-ok being a __devDependency__, it won't increase your published module size.

## Usage

```sh
npm install pkg-ok --save-dev
```

```js
// package.json
{
  "main": "this_file_doesnt_exist.js",
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

You can also configure pkg-ok to check additional `package.json` fields or bin files

```
pkgOk --field someField --bin script.sh
```

## Module

```js
const pkgOk = require('pkg-ok')
const opts = {
  fields: ['someField'],
  bin: ['script.sh']
}

// Assuming this file is at the same level as package.json
pkgOk(__dirname, opts)
```

## License

MIT - [Typicode :cactus:](https://github.com/typicode) - [Patreon](https://patreon.com/typicode)
