import { bindLayer } from "@ui-sdk/core";
import { createRadioGroupController } from "@ui-sdk/react/radio";
import { useShortcut } from "@ui-sdk/react/shortcuts";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, type RefObject } from "react";

import { GameFrame, MenuBackdrop } from "./menu-backdrop";
import { FEATURES, SHOWS, STATIONS, offset, type Source } from "./radio-dial.data";
import { DialPanel, SourceRail, type Tile } from "./radio-dial.parts";
import { useMenuPhase } from "./use-menu-phase";

import "./game-ui.css";
import "./radio-dial.css";

const SOURCE_LABEL = { radio: "Radio", vehicle: "Vehicle", demand: "On demand" };

const tilesFor = (source: Source, lit: Record<string, boolean>): Tile[] => {
  if (source === "radio") return STATIONS;
  if (source === "vehicle")
    return FEATURES.map(item => ({ value: item.value, name: item.name, icon: item.icon, lit: lit[item.value] }));
  return SHOWS;
};

const statusLines = (source: Source, playing: boolean, index: number, vehicleState: string): string[] => {
  if (source === "radio" && playing) return STATIONS[index].track;
  if (source === "vehicle") return [vehicleState];
  return ["Off"];
};

const actionLabel = (source: Source, playing: boolean, vehicleAction: string): string => {
  if (source === "radio") return playing ? "Turn off" : "Turn on";
  return source === "vehicle" ? vehicleAction : "Play";
};

const useTrackGlide = (track: RefObject<HTMLDivElement | null>, source: Source, index: number, count: number) => {
  const last = useRef({ source, index });
  useLayoutEffect(() => {
    const before = last.current;
    last.current = { source, index };
    const row = track.current;
    if (!row || before.source !== source || before.index === index) return;
    const distance = offset(index, before.index, count);
    if (Math.abs(distance) !== 1 || typeof row.animate !== "function") return;
    row.animate(
      [
        { translate: `${distance * 124}px 0`, filter: "blur(2px)" },
        { filter: "blur(0px)", offset: 0.45 },
        { translate: "0 0" },
      ],
      { duration: 90, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
  }, [track, source, index, count]);
};

type RadioDialProps = {
  label?: string;
  value?: string;
  defaultValue?: string;
  on?: boolean;
  defaultOn?: boolean;
  onValueChange?: (value: string) => void;
  onOnChange?: (on: boolean) => void;
  source?: Source;
  defaultSource?: Source;
  onSourceChange?: (source: Source) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const RadioDial = ({
  label = "Radio station",
  value,
  defaultValue = "flash",
  on,
  defaultOn = false,
  onValueChange,
  onOnChange,
  source: sourceProp,
  defaultSource = "radio",
  onSourceChange,
  open,
  defaultOpen = true,
  onOpenChange,
}: RadioDialProps) => {
  const [ownValue, setOwnValue] = useState(defaultValue);
  const [ownOn, setOwnOn] = useState(defaultOn);
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const [ownSource, setOwnSource] = useState<Source>(defaultSource);
  const source = sourceProp ?? ownSource;
  const [lastSource, setLastSource] = useState(source);
  const [switched, setSwitched] = useState(false);
  if (lastSource !== source) {
    setLastSource(source);
    setSwitched(true);
  }
  const [feature, setFeature] = useState(FEATURES[0].value);
  const [lit, setLit] = useState<Record<string, boolean>>({ headlights: true });
  const [show, setShow] = useState(SHOWS[1].value);
  const [strip] = useState(() => createRadioGroupController());
  const ui = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const station = value ?? ownValue;
  const playing = on ?? ownOn;
  const isOpen = open ?? ownOpen;
  const phase = useMenuPhase(isOpen);

  const tiles = tilesFor(source, lit);
  const current = { radio: station, vehicle: feature, demand: show }[source];
  const selectedIndex = tiles.findIndex(tile => tile.value === current);
  const index = Math.max(0, selectedIndex);

  const track = useRef<HTMLDivElement>(null);
  useTrackGlide(track, source, index, tiles.length);

  const pick = (next: string) => {
    if (source === "radio") {
      setOwnValue(next);
      onValueChange?.(next);
    } else if (source === "vehicle") setFeature(next);
    else setShow(next);
  };

  const step = (by: number, event: MouseEvent | KeyboardEvent) => {
    const reason = event instanceof KeyboardEvent ? "list-navigation" : "item-press";
    strip.setValue(tiles[(index + by + tiles.length) % tiles.length].value, { reason, event });
  };

  const act = () => {
    if (source === "radio") {
      setOwnOn(!playing);
      onOnChange?.(!playing);
    } else if (source === "vehicle") setLit(now => ({ ...now, [feature]: !now[feature] }));
  };

  const setOpen = (next: boolean) => {
    if (!next && ui.current?.contains(document.activeElement)) stage.current?.focus({ preventScroll: true });
    setOwnOpen(next);
    onOpenChange?.(next);
  };

  const dismiss = useEffectEvent(() => setOpen(false));
  useEffect(() => {
    if (phase !== "open" || !ui.current) return undefined;
    return bindLayer(ui.current, { onDismiss: reason => reason === "escape-key" && dismiss() });
  }, [phase]);
  useShortcut("q", event => step(-1, event), { layer: ui, when: () => isOpen, description: "Previous (L1)" });
  useShortcut("e", event => step(1, event), { layer: ui, when: () => isOpen, description: "Next (R1)" });

  const featureNow = FEATURES.find(item => item.value === feature) ?? FEATURES[0];
  const featureState = lit[feature] ? 1 : 0;
  const lines = statusLines(source, playing, index, featureNow.states[featureState]);
  const action = actionLabel(source, playing, featureNow.action[featureState]);

  const changeSource = (next: Source) => {
    setOwnSource(next);
    onSourceChange?.(next);
  };

  return (
    <GameFrame className="ld-radio">
      <div ref={stage} className="ld-radio__stage" data-phase={phase} tabIndex={-1}>
        <MenuBackdrop phase={phase} />
        {phase !== "closed" && (
          <div
            ref={ui}
            className="ld-menu-ui"
            data-power={(source === "radio" && !playing) || source === "demand" ? "off" : "on"}
            data-source={source}
            inert={phase === "closing" || undefined}
          >
            <SourceRail source={source} onSourceChange={changeSource} />

            <DialPanel
              source={source}
              track={track}
              label={source === "radio" ? label : SOURCE_LABEL[source]}
              tiles={tiles}
              index={index}
              current={current}
              switched={switched}
              strip={strip}
              action={action}
              lines={lines}
              onStep={step}
              onPick={pick}
              onAction={act}
            />
          </div>
        )}
      </div>
    </GameFrame>
  );
};

export { RadioDial };
export type { Source as RadioSource, Station } from "./radio-dial.data";
