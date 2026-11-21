import type { HTMLAttributes, ReactElement } from "react"
import { cx } from "../ui/cx"
import "./game-screen.css"

/* A 1920x1080 game screen. Children are laid out in 1080p pixels and the frame scales to the box width. */
function GameScreen({ className, children, ...props }: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div {...props} className={cx("ld-screen", className)} data-slot="game-screen">
      <div className="ld-screen__frame" data-slot="game-screen-frame">
        {children}
      </div>
    </div>
  )
}

export { GameScreen }
