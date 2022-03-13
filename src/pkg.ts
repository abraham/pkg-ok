import { PackageJson } from 'type-fest';

export type Pkg = PackageJson & { [key: string]: unknown };

export function isObject(value: unknown): value is { [key: string]: string } {
  return typeof value === 'object' && value !== null;
}
