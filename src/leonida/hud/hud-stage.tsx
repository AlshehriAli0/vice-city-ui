import type { HTMLAttributes } from "react";

import { cx } from "../../shared/class-names";

import "./hud-stage.css";

type HudStageProps = HTMLAttributes<HTMLElement> & { label?: string };

const HudStage = ({ label = "Game HUD", className, ...props }: HudStageProps) => (
  <div className="ld-hud-stage" data-slot="hud-stage">
    <section {...props} className={cx("ld-hud-frame", className)} data-slot="hud-frame" aria-label={label} />
  </div>
);

export { HudStage };
