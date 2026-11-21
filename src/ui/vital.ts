import { useEffect, useState, type CSSProperties } from "react"

// The HUD vitals brighten when a value changes and drop back to 40% after about 3s idle.
function useVitalActive(value: number | null, enabled: boolean): boolean {
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (!enabled) return
    setActive(true)
    const timer = setTimeout(() => setActive(false), 3000)
    return () => clearTimeout(timer)
  }, [value, enabled])
  return active
}

// Gaps are 2px cuts: a count gives equal cells, a list gives cut points as fractions of the bar.
function segmentStyle(segments: number | number[] | undefined): CSSProperties | undefined {
  if (!segments) return undefined
  if (typeof segments === "number") return { "--segments": segments } as CSSProperties
  const stops = segments.map((at) => `#000 calc(${at * 100}% - 1px), transparent calc(${at * 100}% - 1px) calc(${at * 100}% + 1px), #000 calc(${at * 100}% + 1px)`)
  return { "--vital-mask": `linear-gradient(90deg, #000 0, ${stops.join(", ")}, #000 100%)` } as CSSProperties
}

export { segmentStyle, useVitalActive }
