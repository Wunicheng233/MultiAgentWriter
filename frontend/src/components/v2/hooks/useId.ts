import { useId as useReactId } from 'react'

let idCounter = 0

export function useId(prefix = 'v2'): string {
  const reactId = useReactId()
  return `${prefix}-${reactId || ++idCounter}`
}
