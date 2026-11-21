// useDebounced — returns `value` once it has stayed unchanged for `delayMs`.
// Search boxes use it so typing sends one request when the user pauses,
// not one per keystroke.
import { useEffect, useState } from 'react'

export function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
