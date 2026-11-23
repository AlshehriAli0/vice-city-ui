import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../ui/cx";
import type { MenuPhase } from "./use-menu-phase";

import "./menu-backdrop.css";

const GameFrame = ({ className, children, label, ...props }: HTMLAttributes<HTMLDivElement> & { label?: string }) => (
  <div
    {...props}
    className={cx("ld-frame", className)}
    data-slot="game-frame"
    role={label ? "group" : undefined}
    aria-label={label}
  >
    <div className="ld-frame__canvas" data-slot="game-frame-canvas">
      {children}
    </div>
  </div>
);

const NeutralScene = ({ tone = "dusk" }: { tone?: "dusk" | "day" }) => (
  <div className="ld-scene" data-slot="neutral-scene" data-tone={tone} aria-hidden="true" />
);

const neutralScene = <NeutralScene />;

const MenuBackdrop = ({ phase, scene = neutralScene }: { phase: MenuPhase; scene?: ReactNode }) => (
  <div className="ld-backdrop" data-slot="menu-backdrop" data-phase={phase} aria-hidden="true">
    <svg aria-hidden="true" className="ld-backdrop__defs" width="0" height="0" focusable="false">
      <filter id="ld-menu-shift" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="red"
        />
        <feOffset in="red" dx="12" result="shifted" />
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="cyan"
        />
        <feComposite in="shifted" in2="cyan" operator="arithmetic" k2="1" k3="1" />
      </filter>
    </svg>
    <div className="ld-backdrop__sharp">{scene}</div>
    <div className="ld-backdrop__fx">
      <div className="ld-backdrop__blur">{scene}</div>
    </div>
    <div className="ld-backdrop__shade" />
  </div>
);

const KeyCap = ({ children }: { children: string }) => (
  <span className="ld-keycap" data-slot="keycap" aria-hidden="true">
    {children}
  </span>
);

export { GameFrame, KeyCap, MenuBackdrop, NeutralScene };
