import { Meter, MeterIndicator, MeterLabel, MeterTrack } from "@ui-sdk/react/meter";
import { Eye, Heart, House, Wallet, Zap } from "lucide-react";
import { useEffect, useState, type HTMLAttributes, type ReactElement } from "react";

import { cssVariables } from "../ui/css-variables";
import { cx } from "../ui/cx";

import "./hud-meters.css";

type VitalsShow = "all" | "stamina" | "none";

const BARS = [
  { key: "health", label: "Health", Icon: Heart, fill: true },
  { key: "stamina", label: "Stamina", Icon: Zap, fill: true },
  { key: "focus", label: "Focus", Icon: Eye, fill: false },
] as const;

type HudVitalsProps = HTMLAttributes<HTMLDivElement> & {
  health: number;
  stamina: number;
  focus: number;
  show?: VitalsShow;
  length?: { health?: number; stamina?: number; focus?: number };
};

function HudVitals({
  health,
  stamina,
  focus,
  show = "all",
  length = {},
  className,
  ...props
}: HudVitalsProps): ReactElement {
  const values = { health, stamina, focus };
  const [lit, setLit] = useState(false);
  const levels = `${health}/${stamina}/${focus}`;
  const [previous, setPrevious] = useState(levels);
  if (levels !== previous) {
    setPrevious(levels);
    setLit(true);
  }

  const litKey = lit ? levels : null;
  useEffect(() => {
    if (litKey === null) return undefined;
    const timer = setTimeout(() => setLit(false), 3000);
    return () => clearTimeout(timer);
  }, [litKey]);

  return (
    <div
      {...props}
      className={cx("ld-vitals", className)}
      data-slot="hud-vitals"
      data-show={show}
      data-lit={lit || undefined}
    >
      {BARS.map(({ key, label, Icon, fill }) => (
        <Meter
          key={key}
          className="ld-vitals__row"
          data-kind={key}
          value={values[key]}
          max={100}
          style={cssVariables({ "--len": length[key] ?? 182 })}
          hidden={show === "none" || (show === "stamina" && key !== "stamina")}
        >
          <span className="ld-vitals__icon" data-slot="hud-vitals-icon" aria-hidden="true">
            <Icon fill="currentColor" stroke="#303030" strokeWidth={fill ? 0 : 2.25} />
          </span>
          <MeterLabel className="ld-sr">{label}</MeterLabel>
          <MeterTrack className="ld-vitals__track">
            <MeterIndicator className="ld-vitals__fill" />
            {key === "health" && <span className="ld-vitals__cuts" data-slot="hud-vitals-cuts" aria-hidden="true" />}
          </MeterTrack>
        </Meter>
      ))}
    </div>
  );
}

function HudCash({
  wallet,
  bank,
  className,
  ...props
}: HTMLAttributes<HTMLDListElement> & { wallet: number; bank?: number }): ReactElement {
  const money = (n: number) => `$${n.toLocaleString("en-US")}`;
  return (
    <dl {...props} className={cx("ld-cash", className)} data-slot="hud-cash">
      <div className="ld-cash__row" data-slot="hud-cash-row" data-kind="wallet">
        <dt className="ld-sr">Cash</dt>
        <dd>
          <span>{money(wallet)}</span>
        </dd>
        <span className="ld-cash__icon" aria-hidden="true">
          <Wallet fill="currentColor" stroke="#2a2a2a" strokeWidth={1.75} />
        </span>
      </div>
      {bank !== undefined && (
        <div className="ld-cash__row" data-slot="hud-cash-row" data-kind="bank">
          <dt className="ld-sr">Bank</dt>
          <dd>
            <span>{money(bank)}</span>
          </dd>
          <span className="ld-cash__icon" aria-hidden="true">
            <House fill="currentColor" stroke="currentColor" strokeWidth={1.5} />
            <span className="ld-cash__sign">$</span>
          </span>
        </div>
      )}
    </dl>
  );
}

type HudAmmoProps = HTMLAttributes<HTMLDivElement> & { clip: number; reserve: number; weapon?: string; image?: string };

function HudAmmo({
  clip,
  reserve,
  weapon = "Pistol",
  image = "/vc/hud-pistol.png",
  className,
  ...props
}: HudAmmoProps): ReactElement {
  return (
    <div
      {...props}
      className={cx("ld-ammo", className)}
      data-slot="hud-ammo"
      role="group"
      aria-label={`${weapon}: ${clip} in the clip, ${reserve} in reserve`}
    >
      <p className="ld-ammo__count" aria-hidden="true">
        <span>{clip}</span>
        <span data-kind="reserve">{reserve}</span>
      </p>
      <img className="ld-ammo__weapon" src={image} alt="" />
    </div>
  );
}

export { HudAmmo, HudCash, HudVitals };
export type { VitalsShow };
