import { Radio, RadioGroup, type createRadioGroupController } from "@ui-sdk/react/radio";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import type { ReactElement } from "react";

import { PadGlyph } from "./button-prompt";
import { HudCash, HudVitals } from "./hud-meters";
import type { WheelTab } from "./weapon-wheel";
import { AdrenalinePen, GameIcon, PillBottle, type Slot } from "./weapon-wheel.art";

const SPOTS: [number, number][] = [
  [866, 195],
  [1096, 305],
  [1157, 466],
  [1096, 628],
  [866, 738],
  [635, 628],
  [575, 466],
  [635, 305],
];

const banded = (slot: Slot) => slot.clip !== undefined || slot.worn !== undefined;

function Tile({ slot, inHand }: { slot: Slot; inHand: boolean }): ReactElement {
  return (
    <Radio
      value={slot.value}
      className="ld-wheel__tile"
      data-empty={slot.name ? undefined : ""}
      data-band={banded(slot) ? "" : undefined}
      data-rarity={slot.rarity}
      data-in-hand={inHand || undefined}
      aria-label={slot.name ? `${slot.name}, ${slot.category}` : `Empty ${slot.category}`}
    >
      {slot.icon && (
        <span className="ld-wheel__art" data-icon={slot.icon}>
          <GameIcon name={slot.icon} paint={slot.paint} />
        </span>
      )}
      {slot.clip !== undefined && (
        <span className="ld-wheel__band" aria-hidden="true">
          <b>{slot.clip}</b> <span>{slot.reserve}</span>
        </span>
      )}
      {slot.worn !== undefined && (
        <span className="ld-wheel__band" aria-hidden="true">
          <b>{slot.worn ? "ON" : "OFF"}</b>
        </span>
      )}
      {slot.equipped && (
        <span className="ld-wheel__check" aria-hidden="true">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M6 12.5l4 4 8-9" />
          </svg>
        </span>
      )}
    </Radio>
  );
}

type RingProps = {
  slots: Slot[];
  label: string;
  controller: ReturnType<typeof createRadioGroupController>;
  value?: string;
  held: string;
  onSelect: (next: string) => void;
};

function WheelRing({ slots, label, controller, value, held, onSelect }: RingProps): ReactElement {
  return (
    <RadioGroup
      className="ld-wheel__ring"
      aria-label={label}
      controller={controller}
      value={value}
      loop
      onValueChange={next => next && onSelect(next)}
    >
      {slots.map(slot => (
        <Tile key={slot.value} slot={slot} inHand={slot.value === held} />
      ))}
    </RadioGroup>
  );
}

function WheelGuide(): ReactElement {
  return (
    <svg className="ld-wheel__guide" viewBox="0 0 1920 1080" aria-hidden="true">
      <mask id="ld-wheel-gaps">
        <rect width="1920" height="1080" fill="#fff" />
        {SPOTS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 6} y={y - 6} width="200" height="132" fill="#000" />
        ))}
      </mask>
      <circle cx="960" cy="526" r="300" mask="url(#ld-wheel-gaps)" />
    </svg>
  );
}

function WheelDetails({ tab, heals }: { tab: WheelTab; heals: [number, number] }): ReactElement {
  return (
    <>
      <div className="ld-wheel__heals" aria-hidden="true">
        <span className="ld-wheel__heal" data-empty={heals[0] === 0 || undefined}>
          <span className="ld-wheel__heal-art">
            <PillBottle />
          </span>
          <b>
            {heals[0]} <i className="ld-wheel__badge" data-kind="health" />
          </b>
          <span className="ld-wheel__key">
            <PadGlyph glyph="square" />
          </span>
        </span>
        <span className="ld-wheel__heal" data-empty={heals[1] === 0 || undefined}>
          <span className="ld-wheel__heal-art">
            <AdrenalinePen />
          </span>
          <b>
            {heals[1]} <i className="ld-wheel__badge" data-kind="boost" />
          </b>
          <span className="ld-wheel__key">
            <PadGlyph glyph="triangle" />
          </span>
        </span>
      </div>
      <p className="ld-wheel__prompt ld-prompt" aria-hidden="true">
        <span className="ld-prompt__label">{tab === "items" ? "Put on" : "Drop"}</span>
        <PadGlyph glyph={tab === "items" ? "cross" : "circle"} />
      </p>
      <div className="ld-wheel__vitals">
        <HudVitals health={72} stamina={70} focus={64} length={{ stamina: 128 }} />
      </div>
      <div className="ld-wheel__cash">
        <HudCash wallet={407} bank={2480} />
      </div>
    </>
  );
}

type WheelTabsProps = {
  tab: WheelTab;
  onTabChange: (next: WheelTab | null) => void;
  weapons: Slot[];
  items: Slot[];
  label: string;
  rings: Record<WheelTab, ReturnType<typeof createRadioGroupController>>;
  selected?: string;
  held: string;
  onSelect: (next: string) => void;
};

function WheelTabs({
  tab,
  onTabChange,
  weapons,
  items,
  label,
  rings,
  selected,
  held,
  onSelect,
}: WheelTabsProps): ReactElement {
  return (
    <Tabs className="ld-wheel__tabs" value={tab} onValueChange={onTabChange}>
      <span className="ld-wheel__r1" aria-hidden="true">
        <PadGlyph glyph="R1" />
      </span>
      <TabsList className="ld-wheel__tablist" aria-label="Wheel">
        <TabsTab value="weapons" className="ld-wheel__tab">
          Weapons
        </TabsTab>
        <TabsTab value="items" className="ld-wheel__tab">
          Items
        </TabsTab>
      </TabsList>
      <TabsPanel value="weapons" className="ld-wheel__panel">
        <WheelRing
          slots={weapons}
          label={label}
          controller={rings.weapons}
          value={selected}
          held={held}
          onSelect={onSelect}
        />
      </TabsPanel>
      <TabsPanel value="items" className="ld-wheel__panel">
        <WheelRing
          slots={items}
          label="Items"
          controller={rings.items}
          value={selected}
          held={held}
          onSelect={onSelect}
        />
      </TabsPanel>
    </Tabs>
  );
}

export { WheelDetails, WheelGuide, WheelTabs };
