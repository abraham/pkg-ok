# pkg-ok

> Prevents publishing a module with incorrect paths :ok_hand:

Tests package.json `main` and `bin` paths

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

## License

MIT - [Typicode :cactus:](https://github.com/typicode)