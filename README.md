# pkg-ok [![Build Status](https://travis-ci.org/typicode/pkg-ok.svg?branch=master)](https://travis-ci.org/typicode/pkg-ok) [![npm](https://img.shields.io/npm/v/pkg-ok.svg)](https://www.npmjs.com/package/pkg-ok)

A tiny __devDependency__ preventing some basic errors when publishing a module:

* Ensures paths declared in `main`, `bin`, `module` and `typings` exists
* Ensures `bin` scripts use cross-platform line endings

## Why?

When refactoring a project and changing paths, it's easy to forget to update `main` or `bin` paths. When coding from Windows, it's easy to use line endings for `bin` files that aren't supported by OS X/Linux.

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

```js
// package.json
{
  "scripts": {
    "prepublishOnly": "... && pkg-ok"
  }
}
```

## Options

You can configure it to check more fields or bin files

```
pkgOk --field someField --bin script.sh
```

## Give it a try

If you want to give a try to `pkg-ok` without publishing, you can change your `main` path:

```js
// package.json
{
  "main": "this/path/doesnt/exist.js",
  "scripts": {
    "prepublishOnly": "pkg-ok"
  }
}
```

```sh
npm run prepublishOnly
# pkg-ok will give you an error since main path doesn't exist
```

## License

MIT - [Typicode :cactus:](https://github.com/typicode) - [Patreon](https://patreon.com/typicode)
