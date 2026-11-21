import { useLayoutEffect, useRef, type ReactElement, type ReactNode } from "react"

/* Lays the demo out at its design width, then zooms it down to fit the stage, like Sadu's catalogue. */
function FitStage({ width, children }: { width: number; children: ReactNode }): ReactElement {
  const box = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const fit = box.current
    const stage = fit?.parentElement
    if (!fit || !stage) return
    const refit = () => {
      fit.style.zoom = "1"
      const scale = Math.min(1, stage.clientWidth / Math.max(1, fit.scrollWidth), stage.clientHeight / Math.max(1, fit.scrollHeight))
      fit.style.zoom = scale < 0.995 ? String(Math.floor(scale * 100) / 100) : ""
    }
    const observer = new ResizeObserver(refit)
    observer.observe(stage)
    observer.observe(fit)
    refit()
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={box} className="fit-stage" style={{ width }}>
      {children}
    </div>
  )
}

export { FitStage }
