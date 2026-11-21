import { useEffect, useEffectEvent, useState, type ReactElement } from "react";

import { cssVariables } from "../ui/css-variables";
import { KeyCap } from "./menu-backdrop";
import type { WheelTab } from "./weapon-wheel";
import type { Slot } from "./weapon-wheel.art";

function useLagged<T>(value: T, ms = 50): T {
  const [shown, setShown] = useState(value);
  const pending = !Object.is(value, shown);
  const reveal = useEffectEvent(() => setShown(value));

  useEffect(() => {
    if (!pending) return undefined;
    const timer = setTimeout(() => reveal(), ms);
    return () => clearTimeout(timer);
  }, [pending, ms]);

  return shown;
}

function Stats({ slot }: { slot: Slot }): ReactElement | null {
  if (!slot.stats || !slot.name) return null;
  const rows: [string, number][] = [
    ["Damage", slot.stats.damage],
    ["Accuracy", slot.stats.accuracy],
    ["Handling", slot.stats.handling],
    ["Range", slot.stats.range],
  ];
  return (
    <div className="ld-wheel__stats" data-rarity={slot.rarity} aria-hidden="true">
      <div className="ld-wheel__pages">
        <i data-on="" />
        <i />
        <KeyCap>R3</KeyCap>
      </div>
      <div className="ld-wheel__stats-head">
        <b>{slot.name}</b>
        <span>{slot.kind}</span>
      </div>
      {rows.map(([label, value]) => (
        <div key={label} className="ld-wheel__stat">
          <span>{label}</span>
          <b>{value.toFixed(1)}</b>
          <i style={cssVariables({ "--v": value / 10 })} />
        </div>
      ))}
    </div>
  );
}

function WheelSelection({
  focused,
  held,
  tab,
}: {
  focused: Slot | undefined;
  held: string;
  tab: WheelTab;
}): ReactElement {
  const shown = useLagged(focused);
  return (
    <>
      {shown && (
        <p className="ld-wheel__label" data-rarity={shown.name ? shown.rarity : undefined} aria-live="polite">
          <b>{shown.name ?? "Empty"}</b>
          <span>{shown.value === held ? "In hand" : shown.category}</span>
        </p>
      )}
      {tab === "weapons" && focused && <Stats slot={focused} />}
    </>
  );
}

export { WheelSelection };
