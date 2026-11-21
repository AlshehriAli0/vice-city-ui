import { bindLayer } from "@ui-sdk/core";
import { sectorOf } from "@ui-sdk/core/gesture";
import { createRadioGroupController } from "@ui-sdk/react/radio";
import { useEffect, useEffectEvent, useRef, useState, type PointerEvent, type ReactElement } from "react";

import { GameFrame, MenuBackdrop } from "./menu-backdrop";
import { useMenuPhase } from "./use-menu-phase";
import type { Slot } from "./weapon-wheel.art";
import { WheelDetails, WheelGuide, WheelTabs } from "./weapon-wheel.parts";
import { WheelSelection } from "./weapon-wheel.selection";

import "./game-ui.css";
import "./weapon-wheel.css";

type WheelTab = "weapons" | "items";

type WeaponWheelProps = {
  weapons: Slot[];
  items?: Slot[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  inHand?: string;
  defaultInHand?: string;
  onEquip?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  tab?: WheelTab;
  defaultTab?: WheelTab;
  onTabChange?: (tab: WheelTab) => void;
  heals?: [number, number];
  label?: string;
};

const firstOf = (list: Slot[]) => list.find(slot => slot.name) ?? list.at(0);

const canEquip = (opening: boolean, slot: Slot | undefined, tab: WheelTab): slot is Slot =>
  !opening && Boolean(slot?.name) && tab === "weapons";

function WeaponWheel({
  weapons,
  items = [],
  value,
  defaultValue,
  onValueChange,
  inHand,
  defaultInHand = "unarmed",
  onEquip,
  open,
  defaultOpen = true,
  onOpenChange,
  tab: tabProp,
  defaultTab = "weapons",
  onTabChange,
  heals = [2, 0],
  label = "Weapon wheel",
}: WeaponWheelProps): ReactElement {
  const [ownValue, setOwnValue] = useState(defaultValue ?? weapons.at(0)?.value);
  const [ownHand, setOwnHand] = useState(defaultInHand);
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const [ownTab, setOwnTab] = useState<WheelTab>(defaultTab);
  const [rings] = useState(() => ({ weapons: createRadioGroupController(), items: createRadioGroupController() }));
  const canvas = useRef<HTMLDivElement>(null);
  const ui = useRef<HTMLFormElement>(null);
  const tab = tabProp ?? ownTab;
  const held = inHand ?? ownHand;
  const isOpen = open ?? ownOpen;
  const phase = useMenuPhase(isOpen);
  const slots = tab === "items" ? items : weapons;
  const picked = value ?? ownValue;
  const focused = slots.find(slot => slot.value === picked) ?? firstOf(slots);
  const selected = focused?.value;

  function select(next: string) {
    setOwnValue(next);
    onValueChange?.(next);
  }

  function setOpen(next: boolean) {
    if (!next && ui.current?.contains(document.activeElement)) canvas.current?.focus({ preventScroll: true });
    setOwnOpen(next);
    onOpenChange?.(next);
    if (canEquip(next, focused, tab)) {
      setOwnHand(focused.value);
      onEquip?.(focused.value);
    }
  }

  function aim(event: PointerEvent<HTMLDivElement>) {
    const box = canvas.current?.getBoundingClientRect();
    if (!box || event.pointerType === "touch") return;
    const k = box.width / 1920;
    const sector = sectorOf((event.clientX - box.left) / k - 960, (event.clientY - box.top) / k - 526, 8, {
      deadZone: 120,
    });
    const slot = sector >= 0 ? slots.at(sector) : undefined;
    if (slot && slot.value !== selected)
      rings[tab].setValue(slot.value, { reason: "item-press", event: event.nativeEvent });
  }

  const close = useEffectEvent(() => setOpen(false));
  useEffect(() => {
    if (phase !== "open" || !ui.current) return undefined;
    return bindLayer(ui.current, { onDismiss: reason => reason === "escape-key" && close() });
  }, [phase]);

  const changeTab = (next: WheelTab | null) => {
    if (!next) return;
    setOwnTab(next);
    onTabChange?.(next);
    const first = firstOf(next === "items" ? items : weapons);
    if (first) select(first.value);
  };

  return (
    <GameFrame className="ld-wheel">
      <div
        ref={canvas}
        className="ld-wheel__stage"
        data-phase={phase}
        tabIndex={-1}
        onPointerMove={isOpen ? aim : undefined}
      >
        <MenuBackdrop phase={phase} />
        {phase !== "closed" && (
          <form
            ref={ui}
            className="ld-menu-ui"
            inert={phase === "closing" || undefined}
            onSubmit={event => {
              event.preventDefault();
              setOpen(false);
            }}
          >
            <WheelGuide />
            <WheelTabs
              tab={tab}
              onTabChange={changeTab}
              weapons={weapons}
              items={items}
              label={label}
              rings={rings}
              selected={selected}
              held={held}
              onSelect={select}
            />
            <WheelSelection focused={focused} held={held} tab={tab} />
            <WheelDetails tab={tab} heals={heals} />
          </form>
        )}
      </div>
    </GameFrame>
  );
}

export { GameIcon } from "./weapon-wheel.art";
export { WeaponWheel };
export type { Slot, Slot as Weapon } from "./weapon-wheel.art";
export type { WheelTab };
