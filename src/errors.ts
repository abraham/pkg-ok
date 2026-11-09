export const doesNotExistError = (field: string) => `${field} path doesn't exist in package.json`;
export const mustBeRelativeError = (field: string) => `${field} must use a relative path for value`;
export const notPublishedError = (field: string) =>
  `${field} path exists but isn't published; check files and .npmignore`;
export const linkedDependencyError = (name: string) =>
  `Dependency "${name}" is linked to a local package`;
