import type { HTMLAttributes } from "react";

import { cx } from "../ui/cx";

import "./game-screen.css";

const GameScreen = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cx("ld-screen", className)} data-slot="game-screen">
    <div className="ld-screen__frame" data-slot="game-screen-frame">
      {children}
    </div>
  </div>
);

export { GameScreen };
