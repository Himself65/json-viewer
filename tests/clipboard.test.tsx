import type { Path } from '@rich-data/viewer'
import { act, renderHook } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { useClipboard } from '../src/hooks/useCopyToClipboard'
import { createWrapper } from './utils'

let clipboardContent: string | null = null
beforeAll(() => {
  window.prompt = vi.fn()
  Object.assign(navigator, {
    clipboard: {
      writeText: async (text: string) => { clipboardContent = text }
    }
  })
})

describe('clipboard', () => {
  it('should copy success for circular object', async () => {
    const value = {
      a: 1,
      b: undefined
    }
    value.b = value
    const clipboardHook = renderHook(() => useClipboard(), {
      wrapper: createWrapper(value)
    })
    await act(async () => {
      await clipboardHook.result.current.copy([], value)
    })
    expect(clipboardContent).toBe('{"a":1,"b":"###_Circular_###"}')
  })

  it('should copy success for object', async () => {
    const value = {
      a: 1
    }
    const clipboardHook = renderHook(() => useClipboard(), {
      wrapper: createWrapper(value)
    })
    await act(async () => {
      await clipboardHook.result.current.copy([], value)
    })
    expect(clipboardContent).toBe('{"a":1}')
  })

  it('should copy success for custom onCopy', async () => {
    const value = {
      a: 1
    }

    const fn = vi.fn((path: Path, actual: unknown) => {
      expect(path).toEqual(['a'])
      expect(actual).toBe(value.a)
    })

    const clipboardHook = renderHook(() => useClipboard(), {
      wrapper: createWrapper(value, {
        onCopy: fn
      })
    })

    await act(async () => {
      await clipboardHook.result.current.copy(['a'], value.a)
    })

    expect(fn).toBeCalledTimes(1)
  })

  it('should copy success for custom async onCopy', async () => {
    const value = {
      a: 1
    }

    const fn = vi.fn(async (path: Path, actual: unknown) => {
      expect(path).toEqual(['a'])
      expect(actual).toBe(value.a)
    })

    const clipboardHook = renderHook(() => useClipboard(), {
      wrapper: createWrapper(value, {
        onCopy: fn
      })
    })

    await act(async () => {
      await clipboardHook.result.current.copy(['a'], value.a)
    })

    expect(fn).toBeCalledTimes(1)
  })

  it('should copy success for custom async onCopy error', async () => {
    const value = {
      a: 1
    }

    const fn = vi.fn(async () => {
      throw new Error()
    })

    const clipboardHook = renderHook(() => useClipboard(), {
      wrapper: createWrapper(value, {
        onCopy: fn
      })
    })

    await act(async () => {
      const fn = vi.fn((...args: unknown[]) => {
        expect(args[0]).toBe('error when copy src[a]')
      })
      vi.stubGlobal('console', {
        error: fn
      })
      await clipboardHook.result.current.copy(['a'], value.a)
      expect(fn).toBeCalledTimes(1)
    })

    expect(fn).toBeCalledTimes(1)
  })
})
