import { announce } from "@ui-sdk/core";
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

import { cx } from "../../shared/class-names";
import { cssVariables } from "../../shared/css-variables";
import { ButtonGlyph } from "../shared/button-prompt";

import "./hud-feed.css";

type FeedKind = "crime" | "pickup" | "map";
type FeedLine = { id: string; kind: FeedKind; text: string };

// what: Measured holds: "Crime reported" 3.6 s, a pickup 5 s, "Map updated" 4 s.
const HOLD: Record<FeedKind, number> = { crime: 3600, pickup: 5000, map: 4000 };

const spoken = (line: FeedLine): string => (line.kind === "pickup" ? `+ ${line.text}` : line.text);

const Line = ({ line, onDone }: { line: FeedLine; onDone: (id: string) => void }) => (
  <p
    className="ld-feed__line"
    data-slot="hud-feed-line"
    data-kind={line.kind}
    style={cssVariables({ "--hold": `${HOLD[line.kind]}ms` })}
    onAnimationEnd={event => event.animationName === "ld-feed-out" && onDone(line.id)}
  >
    {line.kind === "map" ? (
      <>
        <span className="ld-feed__badge" aria-hidden="true">
          $
        </span>
        <span>
          <b>Map</b> updated
        </span>
        <ButtonGlyph shape="touchpad" />
      </>
    ) : (
      spoken(line)
    )}
  </p>
);

type HudFeedProps = HTMLAttributes<HTMLDivElement> & { lines: FeedLine[]; onDone: (id: string) => void };

const HudFeed = ({ lines, onDone, className, ...props }: HudFeedProps) => {
  const known = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!known.current) {
      known.current = new Set(lines.map(line => line.id));
      return;
    }
    for (const line of lines) {
      if (known.current.has(line.id)) continue;
      known.current.add(line.id);
      announce(spoken(line));
    }
  }, [lines]);
  const map = lines.filter(line => line.kind === "map");
  const world = lines.filter(line => line.kind !== "map");
  return (
    <div {...props} className={cx("ld-feed", className)} data-slot="hud-feed">
      <div className="ld-feed__slot" data-slot="hud-feed-lane" data-lane="map">
        {map.map(line => (
          <Line key={line.id} line={line} onDone={onDone} />
        ))}
      </div>
      <div className="ld-feed__slot" data-slot="hud-feed-lane" data-lane="world">
        {world.map(line => (
          <Line key={line.id} line={line} onDone={onDone} />
        ))}
      </div>
    </div>
  );
};

type SubtitleProps = HTMLAttributes<HTMLParagraphElement> & { speaker: string; color: string };

const Subtitle = ({ speaker, color, className, style, children, ...props }: SubtitleProps) => (
  <p
    {...props}
    className={cx("ld-subtitle", className)}
    data-slot="hud-subtitle"
    style={cssVariables({ ...style, "--speaker": color })}
  >
    <span className="ld-subtitle__speaker">{speaker}:</span> {children}
  </p>
);

const Objective = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) => (
  <p {...props} className={cx("ld-objective", className)} data-slot="hud-objective" />
);

export { HudFeed, Objective, Subtitle };
export type { FeedKind, FeedLine };
