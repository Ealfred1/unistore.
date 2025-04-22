"use client"

import { useEffect } from "react"

type KeyboardShortcutOptions = {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  callback: () => void
}

export function useKeyboardShortcut({
  key,
  ctrlKey = false,
  altKey = false,
  shiftKey = false,
  metaKey = false,
  callback,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.altKey === altKey &&
        event.shiftKey === shiftKey &&
        event.metaKey === metaKey
      ) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [key, ctrlKey, altKey, shiftKey, metaKey, callback])
}
