import { Button } from "@ui-sdk/react/button";
import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { BookOpen, MapPin, Wallet } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";

import { cssVariables } from "../ui/css-variables";
import { ButtonPrompt, ButtonPrompts, PadGlyph, type Glyph } from "./button-prompt";
import { FormattedText } from "./formatted-text";
import { GameScreen } from "./game-screen";
import { ART, BLIPS } from "./map-screen.blips";
import { MapCameraParts } from "./map-screen.camera";
import { MAP_CATEGORIES as CATEGORIES, MAP_TABS as TABS } from "./map-screen.data";
import { PLAYER, useMapNavigation, type MapScreenProps } from "./map-screen.navigation";
import { BriefPanel, CharacterPanel, ProgressPanel } from "./map-screen.panels";

import "./map-screen.css";

function StickPrompt({
  stick,
  children,
  onClick,
}: {
  stick: "L3" | "R3";
  children: string;
  onClick: () => void;
}): ReactElement {
  return (
    <Button className="ld-prompt" onClick={onClick}>
      <span className="ld-prompt__label">{children}</span>
      <svg className="ld-btnglyph" viewBox="0 0 32 32" aria-hidden="true">
        <circle className="ld-btnglyph__disc" cx="16" cy="16" r="15" />
        <text className="ld-map__stick" x="16" y="21.5" textAnchor="middle">
          {stick}
        </text>
      </svg>
    </Button>
  );
}

type MapPanelProps = Pick<MapScreenProps, "zoom" | "defaultZoom" | "onZoomChange"> & {
  navigation: ReturnType<typeof useMapNavigation>;
};

function MapPanel({ navigation, zoom, defaultZoom, onZoomChange }: MapPanelProps): ReactElement {
  const {
    camera,
    category,
    flat,
    goal,
    hovered,
    hoveredCategory,
    look,
    markerAt,
    miles,
    routeLine,
    setHovered,
    targets,
    updateDestination,
  } = navigation;
  return (
    <TabsPanel value="map" className="ld-map__panel ld-map__panel--map">
      <MapCameraParts.Root
        className="ld-map__world"
        aria-label="Map"
        data-flat={flat || undefined}
        controller={camera}
        targets={targets}
        start={category}
        zoom={zoom}
        defaultZoom={defaultZoom}
        onZoomChange={onZoomChange && (next => onZoomChange(next))}
        destination={goal}
        onDestinationChange={updateDestination}
        onHoverChange={setHovered}
      >
        <MapCameraParts.World className="ld-map__layer">
          <img className="ld-map__art" src={flat ? "/vc/map-2d.svg" : "/vc/map-3d.svg"} alt="" draggable={false} />
          {routeLine && (
            <svg aria-hidden="true" className="ld-map__route" viewBox={`0 0 ${ART.width} ${ART.height}`}>
              <path d={`M${routeLine}`} />
            </svg>
          )}
          {CATEGORIES.map(item => {
            const [x, y] = BLIPS[item.value][flat ? "flat" : "tilted"];
            return (
              <span
                key={item.value}
                className="ld-map__blip"
                data-active={item.value === hovered || undefined}
                style={cssVariables({ "--x": `${x}px`, "--y": `${y}px` })}
              >
                {item.icon}
                {item.value === hovered && miles !== null && (
                  <span className="ld-map__miles">{miles.toFixed(2)} mi</span>
                )}
              </span>
            );
          })}
          {markerAt && (
            <MapPin
              className="ld-map__marker"
              style={cssVariables({ "--x": `${markerAt[0]}px`, "--y": `${markerAt[1]}px` })}
            />
          )}
        </MapCameraParts.World>
        <MapCameraParts.Cursor className="ld-map__cursor" />
        {hoveredCategory && (
          <article className="ld-map__card ld-map__hover" aria-live="polite">
            <h3>{hoveredCategory.title}</h3>
            <p>{hoveredCategory.text}</p>
            <p className="ld-map__status">{hoveredCategory.label}</p>
          </article>
        )}
      </MapCameraParts.Root>

      <RadioGroup
        className="ld-map__rail"
        aria-label="Map legend"
        value={category}
        onValueChange={next => next && look(next)}
      >
        {CATEGORIES.map(item => (
          <Radio key={item.value} value={item.value} className="ld-map__cat" aria-label={item.label}>
            {item.icon}
            {item.isNew && <span className="ld-map__new" />}
          </Radio>
        ))}
      </RadioGroup>

      <article className="ld-map__card ld-map__mission">
        <span className="ld-map__avatar" aria-hidden="true">
          <BookOpen aria-hidden="true" strokeWidth={2.5} fill="none" />
        </span>
        <h3>Task Name</h3>
        <p>Placeholder objective text for the current task, over two lines.</p>
      </article>

      <p className="ld-map__chip">Vice City</p>
      <p className="ld-map__objective">
        <FormattedText text="Go to the *marker*." />
      </p>
    </TabsPanel>
  );
}

const prompt = (glyph: Glyph, label: string, onClick: () => void, muted?: boolean) => (
  <ButtonPrompt glyph={glyph} onClick={onClick} muted={muted} disabled={muted} focusableWhenDisabled>
    {label}
  </ButtonPrompt>
);

function MapPrompts({
  navigation,
  onExit,
}: {
  navigation: ReturnType<typeof useMapNavigation>;
  onExit?: () => void;
}): ReactElement {
  const { camera, flat, goal, hovered, hoveredCategory, marker, pressDestination, pressMarker, setView } = navigation;
  return (
    <ButtonPrompts label="Map prompts" stack>
      <StickPrompt stick="L3" onClick={() => camera.glideTo(PLAYER)}>
        Recenter
      </StickPrompt>
      <StickPrompt stick="R3" onClick={() => setView(flat ? "3d" : "2d")}>
        {flat ? "3D View" : "2D View"}
      </StickPrompt>
      {prompt("square", marker ? "Remove Marker" : "Add Marker", pressMarker, !marker && Boolean(hoveredCategory))}
      {prompt("cross", hovered && hovered === goal ? "Remove Destination" : "Set Destination", pressDestination)}
      {prompt("circle", "Exit", () => onExit?.())}
    </ButtonPrompts>
  );
}

function MapScreen({
  value,
  defaultValue = "map",
  onValueChange,
  cash = 601,
  time = "3:15 pm",
  onExit,
  zoom,
  defaultZoom,
  onZoomChange,
  destination,
  defaultDestination = null,
  onDestinationChange,
  view,
  defaultView = "3d",
  onViewChange,
}: MapScreenProps): ReactElement {
  const [ownTab, setOwnTab] = useState(defaultValue);
  const tab = value ?? ownTab;
  const setTab = (next: string) => {
    if (next === tab) return;
    setOwnTab(next);
    onValueChange?.(next);
  };
  const changeTab = (next: string | null) => {
    if (next) setTab(next);
  };
  const [opening, setOpening] = useState(true);
  const navigation = useMapNavigation({
    destination,
    defaultDestination,
    onDestinationChange,
    view,
    defaultView,
    onViewChange,
  });

  useEffect(() => {
    const timer = setTimeout(() => setOpening(false), 1150);
    return () => clearTimeout(timer);
  }, []);

  const bump = (by: number) => {
    const index = TABS.findIndex(item => item.value === tab);
    setTab(TABS[(index + by + TABS.length) % TABS.length].value);
  };
  return (
    <GameScreen className="ld-map" data-opening={opening || undefined} data-tab={tab}>
      <div className="ld-map__dim" aria-hidden="true" />
      <Tabs className="ld-map__tabs" value={tab} onValueChange={changeTab}>
        <MapPanel navigation={navigation} zoom={zoom} defaultZoom={defaultZoom} onZoomChange={onZoomChange} />
        <BriefPanel />
        <ProgressPanel />
        <CharacterPanel />

        <header className="ld-map__header">
          {tab === "map" && <p className="ld-map__clock">{time}</p>}
          <div className="ld-map__tabbar">
            <Button className="ld-map__bumper" aria-label="Previous tab" onClick={() => bump(-1)}>
              <PadGlyph glyph="L1" />
            </Button>
            <TabsList className="ld-map__tablist" aria-label="Map menu">
              {TABS.map(item => (
                <TabsTab key={item.value} value={item.value} className="ld-map__tab">
                  {item.label}
                </TabsTab>
              ))}
            </TabsList>
            <Button className="ld-map__bumper" aria-label="Next tab" onClick={() => bump(1)}>
              <PadGlyph glyph="R1" />
            </Button>
          </div>
        </header>
      </Tabs>

      <p className="ld-map__cash" aria-label={`Cash $${cash}`} hidden={tab !== "map"}>
        ${cash.toLocaleString("en-US")}
        <Wallet aria-hidden="true" />
      </p>

      {tab === "map" ? (
        <MapPrompts navigation={navigation} onExit={onExit} />
      ) : (
        <ButtonPrompts label="Map prompts">{prompt("circle", "Exit", () => onExit?.())}</ButtonPrompts>
      )}
    </GameScreen>
  );
}

export { MapScreen };
export type { MapScreenProps, View as MapView } from "./map-screen.navigation";
