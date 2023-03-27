import copyToClipboard from 'copy-to-clipboard'
import { useCallback, useRef, useState } from 'react'

import { useJsonViewerStore } from '../stores/JsonViewerStore'
import type { JsonViewerOnCopy } from '../type'

function cleanStringify (object: unknown): string {
  function copyWithoutCircularReferences (references: object[], object: object) {
    const cleanObject = {}
    Object.keys(object).forEach(function (key) {
      const value = object[key]
      if (value && typeof value === 'object') {
        if (references.indexOf(value) < 0) {
          references.push(value)
          cleanObject[key] = copyWithoutCircularReferences(references, value)
          references.pop()
        } else {
          cleanObject[key] = '###_Circular_###'
        }
      } else if (typeof value !== 'function') {
        cleanObject[key] = value
      }
    })
    return cleanObject
  }
  if (object && typeof object === 'object') {
    object = copyWithoutCircularReferences([object], object)
  }
  return JSON.stringify(object)
}

/**
 * useClipboard hook accepts one argument options in which copied status timeout duration is defined (defaults to 2000). Hook returns object with properties:
 * - copy – function to copy value to clipboard
 * - copied – value that indicates that copy handler was called less than options.timeout ms ago
 * - reset – function to clear timeout and reset copied to false
 */
export function useClipboard ({ timeout = 2000 } = {}) {
  const [copied, setCopied] = useState(false)
  const copyTimeout = useRef<number | null>(null)

  const handleCopyResult = useCallback((value: boolean) => {
    const current = copyTimeout.current
    if (current) {
      window.clearTimeout(current)
    }
    copyTimeout.current = window.setTimeout(() => setCopied(false), timeout)
    setCopied(value)
  }, [timeout])
  const onCopy = useJsonViewerStore(store => store.onCopy)

  const copy = useCallback<JsonViewerOnCopy>(async (path, value: unknown) => {
    if (typeof onCopy === 'function') {
      try {
        const result = onCopy(path, value)
        if (result instanceof Promise) {
          return result.then(() => {
            handleCopyResult(true)
          }).catch((error) => {
            console.error(
              `error when copy ${path.length === 0
                ? 'src'
                : `src[${path.join(
                  '.')}`
              }]`, error)
          })
        } else {
          handleCopyResult(true)
        }
      } catch (error) {
        console.error(
          `error when copy ${path.length === 0
            ? 'src'
            : `src[${path.join(
              '.')}`
          }]`, error)
      }
    } else {
      const valueToCopy = cleanStringify(typeof value === 'function' ? value.toString() : value)
      if ('clipboard' in navigator) {
        return navigator.clipboard.writeText(valueToCopy)
          .then(() => handleCopyResult(true))
          // When navigator.clipboard throws an error, fallback to copy-to-clipboard package
          .catch(() => copyToClipboard(valueToCopy))
      } else {
        // fallback to copy-to-clipboard when navigator.clipboard is not available
        return copyToClipboard(valueToCopy)
      }
    }
  }, [handleCopyResult, onCopy])

  const reset = useCallback(() => {
    setCopied(false)
    if (copyTimeout.current) {
      clearTimeout(copyTimeout.current)
    }
  }, [])

  return { copy, reset, copied }
}