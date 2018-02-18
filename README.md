# pkg-ok [![Build Status](https://travis-ci.org/typicode/pkg-ok.svg?branch=master)](https://travis-ci.org/typicode/pkg-ok) [![npm](https://img.shields.io/npm/v/pkg-ok.svg)](https://www.npmjs.com/package/pkg-ok)

A tiny __devDependency__ preventing some basic errors when publishing a module:

* Ensures paths declared in `main`, `bin`, `module` and `typings` exists
* Ensures `bin` scripts use cross-platform line endings

## Why?

When refactoring a project and changing paths, it's easy to forget to update `main` or `bin` paths. When coding from Windows, it's easy to use line endings that aren't supported by Linux or OS X.

Just by adding `pkg-ok` as a __devDependency__ and with __zero-config__, you can prevent these 2 mistakes and get a safer project.

## Install

```
npm install pkg-ok --save-dev
```

```
yarn add pkg-ok --dev
```

## Usage

Simply add `pkg-ok` CLI at the end of your `prepublishOnly` script

```json
{
  "scripts": {
    "prepublishOnly": "... && pkg-ok"
  }
}
```

## Options

`pkg-ok` can be configured to check more fields or bin files:

```
pkgOk --field someField --bin script.sh
```

## Module

You can also use it as a module

```js
const path = require('path')
const pkgOk = require('pkg-ok')

const opts = {
  fields: [/* ... */],
  bin: [/* ... */]
}

pkgOk(path.join(__dirname, './package.json'), opts)
```

## License

MIT - [Typicode :cactus:](https://github.com/typicode) - [Patreon](https://patreon.com/typicode)