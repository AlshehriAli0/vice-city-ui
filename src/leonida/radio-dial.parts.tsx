import { Button } from "@ui-sdk/react/button";
import { Radio, RadioGroup, type createRadioGroupController } from "@ui-sdk/react/radio";
import type { LucideIcon } from "lucide-react";
import type { Ref } from "react";

import { cssVariables } from "../ui/css-variables";
import { PadGlyph } from "./button-prompt";
import { ShowCover } from "./radio-cover";
import { NOUNS, SOURCES, offset, type Source } from "./radio-dial.data";

type Tile = { value: string; name: string; art?: string; icon?: LucideIcon; lit?: boolean; cover?: string };

const SourceRail = ({ source, onSourceChange }: { source: Source; onSourceChange: (source: Source) => void }) => (
  <RadioGroup
    className="ld-radio__rail"
    aria-label="Source"
    value={source}
    onValueChange={next => next && onSourceChange(next)}
  >
    {SOURCES.map(([id, name]) => (
      <label key={id} className="ld-radio__source">
        <span>{name}</span>
        <Radio value={id} className="ld-radio__node">
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <path d="M14 4.5l2.6 3h-5.2zM14 23.5l2.6-3h-5.2z" />
            <text x="14" y="18.2">
              R
            </text>
          </svg>
        </Radio>
      </label>
    ))}
  </RadioGroup>
);

type DialPanelProps = {
  source: Source;
  track: Ref<HTMLDivElement>;
  label: string;
  tiles: Tile[];
  index: number;
  current: string;
  switched: boolean;
  strip: ReturnType<typeof createRadioGroupController>;
  action: string;
  lines: string[];
  onStep: (by: number, event: MouseEvent | KeyboardEvent) => void;
  onPick: (value: string) => void;
  onAction: () => void;
};

const DialPanel = ({
  source,
  track,
  label,
  tiles,
  index,
  current,
  switched,
  strip,
  action,
  lines,
  onStep,
  onPick,
  onAction,
}: DialPanelProps) => (
  <>
    <Button
      className="ld-radio__chev"
      data-side="prev"
      aria-label={`Previous ${NOUNS[source]}`}
      onClick={event => onStep(-1, event.nativeEvent)}
    >
      <svg viewBox="0 0 8 14" aria-hidden="true">
        <path d="M7 1L1.5 7 7 13" />
      </svg>
    </Button>
    <div className="ld-radio__window" data-switched={switched || undefined}>
      <div ref={track} className="ld-radio__track">
        <RadioGroup
          key={source}
          className="ld-radio__strip"
          controller={strip}
          aria-label={label}
          value={current}
          loop
          onValueChange={next => next && onPick(next)}
        >
          {tiles.map((tile, at) => {
            const pos = offset(at, index, tiles.length);
            return (
              <Radio
                key={tile.value}
                value={tile.value}
                className="ld-radio__tile"
                data-pos={pos}
                data-lit={tile.lit ? true : undefined}
                aria-label={tile.name}
                style={cssVariables({ "--pos": pos })}
              >
                {tile.art && <img className="ld-radio__art" src={`/vc/${tile.art}.jpg`} alt="" draggable={false} />}
                {tile.icon && <tile.icon className="ld-radio__icon" strokeWidth={1.75} aria-hidden="true" />}
                {tile.cover && <ShowCover cover={tile.cover} />}
              </Radio>
            );
          })}
        </RadioGroup>
      </div>
    </div>
    <span className="ld-radio__focus" aria-hidden="true" />
    <Button
      className="ld-radio__chev"
      data-side="next"
      aria-label={`Next ${NOUNS[source]}`}
      onClick={event => onStep(1, event.nativeEvent)}
    >
      <svg viewBox="0 0 8 14" aria-hidden="true">
        <path d="M1 1l5.5 6L1 13" />
      </svg>
    </Button>

    <div className="ld-radio__actions">
      <Button className="ld-radio__action" onClick={onAction}>
        <PadGlyph glyph="cross" />
        {action}
      </Button>
      {source === "demand" && (
        <span className="ld-radio__action" aria-hidden="true">
          <PadGlyph glyph="touchpad" />
          View episodes
        </span>
      )}
    </div>

    <div className="ld-radio__scrub" aria-hidden="true">
      <PadGlyph glyph="L1" />
      <span className="ld-radio__track-bar">
        <i style={cssVariables({ "--at": tiles.length > 1 ? index / (tiles.length - 1) : 0, "--n": tiles.length })} />
      </span>
      <PadGlyph glyph="R1" />
    </div>
    <p className="ld-radio__now" aria-live="polite">
      <b>{tiles[index].name}</b>
      {lines.map(line => (
        <span key={line} data-off={line === "Off" || undefined}>
          {line}
        </span>
      ))}
    </p>
  </>
);

export { DialPanel, SourceRail };
export type { Tile };
