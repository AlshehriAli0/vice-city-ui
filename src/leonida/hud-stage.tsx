import type { HTMLAttributes, ReactElement } from "react";

import { cx } from "../ui/cx";

import "./hud-stage.css";

type HudStageProps = HTMLAttributes<HTMLElement> & { label?: string };

function HudStage({ label = "Game HUD", className, ...props }: HudStageProps): ReactElement {
  return (
    <div className="ld-hud-stage" data-slot="hud-stage">
      <section {...props} className={cx("ld-hud-frame", className)} data-slot="hud-frame" aria-label={label} />
    </div>
  );
}

export { HudStage };
