import { useEffect, useRef } from "react"

// Runs `run` each time a playground action button is pressed (its count goes up), never on mount.
function useAction(count: number | undefined, run: () => void): void {
  const seen = useRef(count ?? 0)
  const latest = useRef(run)
  latest.current = run
  useEffect(() => {
    if ((count ?? 0) === seen.current) return
    seen.current = count ?? 0
    latest.current()
  }, [count])
}

export { useAction }
