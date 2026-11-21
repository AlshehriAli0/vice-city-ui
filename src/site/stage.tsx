import type { ReactElement, ReactNode } from "react"

/* Neutral stage. Game UI with white text gets the dark CSS scene; no photography. */
function Stage({ scene, className, children }: { scene: boolean; className: string; children: ReactNode }): ReactElement {
  return (
    <div className={className} data-scene={scene ? "" : undefined}>
      {children}
    </div>
  )
}

export { Stage }
