import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { internalRootValueAtom } from '../atom'

export type Path = string | number;

export const internalPathCacheAtom = atom<WeakMap<object, Path[]>>(new WeakMap())

function findPath (cache: WeakMap<object, Path[]>, root: object, target: object): Path[] {
  if (root === target) {
    return []
  }
  const path = cache.get(target)
  if (path) {
    return path
  }
  for (const key of Object.keys(root)) {
    const value = root[key as keyof typeof root]
    if (value === target) {
      cache.set(root, [key])
      return [key]
    }
    if (typeof value === 'object' && value !== null) {
      const path = findPath(cache, value, target)
      if (path) {
        cache.set(root, [key, ...path])
        return [key, ...path]
      }
    }
  }
  throw new Error('unreachable')
}

export function usePath (currentValue: object): Path[] {
  const root = useAtomValue(internalRootValueAtom)
  const cache = useAtomValue(internalPathCacheAtom)
  return useMemo(() => {
    if (currentValue === root) {
      return []
    }
    if (typeof root !== 'object' || root === null) {
      throw new Error('root is not an object')
    }
    return findPath(cache, root, currentValue)
  }, [cache, currentValue, root])
}