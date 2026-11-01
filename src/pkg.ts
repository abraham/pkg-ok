import type { PackageJson } from 'type-fest';

export type Pkg = PackageJson & Record<string, unknown>;

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
