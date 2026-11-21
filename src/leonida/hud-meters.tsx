import { Meter, MeterIndicator, MeterLabel, MeterTrack } from "@ui-sdk/react/meter"
import { Eye, Heart, House, Wallet, Zap } from "lucide-react"
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactElement } from "react"
import { cx } from "../ui/cx"
import "./hud-meters.css"

type VitalsShow = "all" | "stamina" | "none"

const BARS = [
  { key: "health", label: "Health", Icon: Heart, fill: true },
  { key: "stamina", label: "Stamina", Icon: Zap, fill: true },
  { key: "focus", label: "Focus", Icon: Eye, fill: false },
] as const

type HudVitalsProps = HTMLAttributes<HTMLDivElement> & {
  health: number
  stamina: number
  focus: number
  show?: VitalsShow
  // Bar length in 1080p px. Stamina and focus grow with training, up to the full 182.
  length?: { health?: number; stamina?: number; focus?: number }
}

/* Health, stamina and focus, top-left. Rows 30px apart, 10px square-ended bars. It dims to 40% when idle and lights up for 3 s on any change. */
function HudVitals({ health, stamina, focus, show = "all", length = {}, className, ...props }: HudVitalsProps): ReactElement {
  const values = { health, stamina, focus }
  const [lit, setLit] = useState(false)
  const last = useRef(`${health}/${stamina}/${focus}`)
  useEffect(() => {
    const key = `${health}/${stamina}/${focus}`
    if (key === last.current) return
    last.current = key
    setLit(true)
    const timer = setTimeout(() => setLit(false), 3000)
    return () => clearTimeout(timer)
  }, [health, stamina, focus])
  return (
    <div {...props} className={cx("ld-vitals", className)} data-slot="hud-vitals" data-show={show} data-lit={lit || undefined}>
      {BARS.map(({ key, label, Icon, fill }) => (
        <Meter
          key={key}
          className="ld-vitals__row"
          data-kind={key}
          value={values[key]}
          max={100}
          style={{ "--len": length[key] ?? 182 } as CSSProperties}
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
  )
}

/* Wallet and bank, top-right, in the blocky money face with their round icons. */
function HudCash({ wallet, bank, className, ...props }: HTMLAttributes<HTMLDListElement> & { wallet: number; bank?: number }): ReactElement {
  const money = (n: number) => `$${n.toLocaleString("en-US")}`
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
  )
}

/* Clip and reserve with no slash, and the weapon under them. */
type HudAmmoProps = HTMLAttributes<HTMLDivElement> & { clip: number; reserve: number; weapon?: string; image?: string }

function HudAmmo({ clip, reserve, weapon = "Pistol", image = "/vc/hud-pistol.png", className, ...props }: HudAmmoProps): ReactElement {
  return (
    <div {...props} className={cx("ld-ammo", className)} data-slot="hud-ammo" role="group" aria-label={`${weapon}: ${clip} in the clip, ${reserve} in reserve`}>
      <p className="ld-ammo__count" aria-hidden="true">
        <span>{clip}</span>
        <span data-kind="reserve">{reserve}</span>
      </p>
      <img className="ld-ammo__weapon" src={image} alt="" />
    </div>
  )
}

export { HudAmmo, HudCash, HudVitals }
export type { VitalsShow }
