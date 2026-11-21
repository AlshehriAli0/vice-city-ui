import { announce } from "@ui-sdk/core";
import { useEffect, useRef, type HTMLAttributes, type ReactElement, type ReactNode } from "react";

import { cssVariables } from "../ui/css-variables";
import { cx } from "../ui/cx";
import { ButtonGlyph } from "./button-prompt";

import "./hud-feed.css";

type FeedKind = "crime" | "pickup" | "map";
type FeedLine = { id: string; kind: FeedKind; text: string };

// what: Measured holds: "Crime reported" 3.6 s, a pickup 5 s, "Map updated" 4 s.
const HOLD: Record<FeedKind, number> = { crime: 3600, pickup: 5000, map: 4000 };

function spoken(line: FeedLine): string {
  return line.kind === "pickup" ? `+ ${line.text}` : line.text;
}

function Line({ line, onDone }: { line: FeedLine; onDone: (id: string) => void }): ReactElement {
  return (
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
}

type HudFeedProps = HTMLAttributes<HTMLDivElement> & { lines: FeedLine[]; onDone: (id: string) => void };

function HudFeed({ lines, onDone, className, ...props }: HudFeedProps): ReactElement {
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
}

type SubtitleProps = HTMLAttributes<HTMLParagraphElement> & { speaker: string; color: string };

function Subtitle({ speaker, color, className, style, children, ...props }: SubtitleProps): ReactElement {
  return (
    <p
      {...props}
      className={cx("ld-subtitle", className)}
      data-slot="hud-subtitle"
      style={cssVariables({ ...style, "--speaker": color })}
    >
      <span className="ld-subtitle__speaker">{speaker}:</span> {children}
    </p>
  );
}

function Objective({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }): ReactElement {
  return <p {...props} className={cx("ld-objective", className)} data-slot="hud-objective" />;
}

export { HudFeed, Objective, Subtitle };
export type { FeedKind, FeedLine };
