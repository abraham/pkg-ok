# CHANGELOG

## 3.0.0

- Require node 12+
- Switch to ESM
- Update dependencies
- Switch to GitHub Actions
- Remove package-lock.json
- Format with Prettier
- Convert to TypeScript
- Add `exports` field
- Use `main` as default branch
- Move files to `src` and compile to `dist`
- Check `main`, `bin`, and `browser` paths are relative
- Support passing a directory to the CLI `pkg-ok some/path`

## 2.3.1

- Change CLI parser ([meow](https://github.com/sindresorhus/meow))

## 2.3.0

- Add `browser` field

## 2.2.0

- Add `types` which is synonymous with `typings`

## 2.1.0

- Use `pkg-ok` as a module
- Add `es2015` field for Angular modules

## 2.0.0

- Normalizes line ending for files declared in `bin` field
- In addition to checking `main` and `bin`, checks `typings` and `module` fields if present
- CLI signature has been changed
- Drop Node 4 support

## 1.0.0

- Initial version
