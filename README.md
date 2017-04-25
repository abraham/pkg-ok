# pkg-ok [![Build Status](https://travis-ci.org/typicode/pkg-ok.svg?branch=master)](https://travis-ci.org/typicode/pkg-ok) [![npm](https://img.shields.io/npm/v/pkg-ok.svg)](https://www.npmjs.com/package/pkg-ok) [![Support on Patreon](https://img.shields.io/badge/support-patreon-E6461A.svg)](https://www.patreon.com/typicode)

> Prevents publishing a module with bad paths :ok_hand:

Do you test your `package.json` `main` and `bin` paths?<br>
pkg-ok checks them and fails if there's a bad path.

Used in [json-server](https://github.com/typicode/json-server), [hotel](https://github.com/typicode/hotel) and [lowdb](https://github.com/typicode/lowdb).

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

MIT - [Typicode :cactus:](https://github.com/typicode)
