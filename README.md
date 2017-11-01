# pkg-ok [![Build Status](https://travis-ci.org/typicode/pkg-ok.svg?branch=master)](https://travis-ci.org/typicode/pkg-ok) [![npm](https://img.shields.io/npm/v/pkg-ok.svg)](https://www.npmjs.com/package/pkg-ok)

> Prevents publishing a module with bad paths 👌

Because it happened to me more than I'd like to admit 😅, `pkg-ok` checks `main` and `bin` paths and prevents publishing if there's a bad path.

__Used in:__

* [json-server](https://github.com/typicode/json-server)
* [hotel](https://github.com/typicode/hotel)
* [lowdb](https://github.com/typicode/lowdb)
* [react-fake-props](https://github.com/typicode/react-fake-props)
* ... and [other](https://libraries.io/npm/pkg-ok/dependent-repositories) awesome projects

## Usage

```sh
npm install pkg-ok --save-dev
```

```js
// Edit package.json
{
  "main": "doesnt/exist.js"
  "scripts": {
    "prepublish": "pkg-ok"
  }
}
```

```sh
npm publish
# Error package.json > main path doesn't exist
```

For non-standard fields like `module`, `es2015`, `typings`, ... you can pass them as arguments to `pkg-ok` and it will check them as well (e.g. `pkg-ok module`)

## License

MIT - [Typicode :cactus:](https://github.com/typicode) - [Patreon](https://patreon.com/typicode)
