import { CarFront, Navigation2 } from "lucide-react"
import { useId, type CSSProperties, type HTMLAttributes, type ReactElement } from "react"
import { cx } from "../ui/cx"
import { useAnnouncement } from "./hud-stage"
import "./hud-minimap.css"

type Wash = "none" | "seen" | "search"
type Route = "none" | "mission" | "waypoint"
type Blip = { id: string; bearing: number; kind: "destination" | "store" | "vehicle"; label: string }

// The drawn world has north pointing down its sheet, so N rides the bottom edge while the route runs up.
const NORTH = 180

// The main road curves away ahead of the player at (1000, 1000). The route follows it past the horizon, where the map
// clips it; the turn lies beyond the edge, and the destination blip on the rim gives its bearing.
const ROAD = "M1000 2000V1000c0-50 60-80 60-160s-60-110-60-200V0"
const ROUTE = "M1000 1000c0-50 60-80 60-160s-60-110-60-200V0"

// The minimap view in 1080p px, with the player arrow at 50% across and 78% down.
const W = 302
const H = 168
const PX = W / 2
const PY = H * 0.78

/* Where a ray from the player at a screen bearing leaves the map rectangle, so N and off-map blips ride its edge. */
function edgePoint(screenBearing: number): { x: number; y: number } {
  const rad = (screenBearing * Math.PI) / 180
  const dx = Math.sin(rad)
  const dy = -Math.cos(rad)
  const tx = dx > 0 ? (W - PX) / dx : dx < 0 ? -PX / dx : Infinity
  const ty = dy > 0 ? (H - PY) / dy : dy < 0 ? -PY / dy : Infinity
  const t = Math.min(tx, ty)
  return { x: PX + dx * t, y: PY + dy * t }
}

function pin(screenBearing: number): CSSProperties {
  const { x, y } = edgePoint(screenBearing)
  return { "--x": x, "--y": y } as CSSProperties
}

const BLIP_GLYPH: Record<Blip["kind"], ReactElement | null> = {
  destination: null,
  store: <span className="ld-minimap__sign">$</span>,
  vehicle: <CarFront strokeWidth={2.5} aria-hidden="true" />,
}

const WASH_LABEL: Record<Wash, string> = { none: "", seen: ", police can see you", search: ", inside the search area" }

type HudMinimapProps = HTMLAttributes<HTMLElement> & {
  heading?: number
  wash?: Wash
  route?: Route
  distance?: string
  blips?: Blip[]
}

/* The 302×168 heading-up minimap: a tilted plane with roads, the route ribbon, a whole-map wanted wash, and N and blips pinned to its edge. */
function HudMinimap({ heading = 0, wash = "none", route = "none", distance, blips = [], className, style, ...props }: HudMinimapProps): ReactElement {
  const fade = `ld-route${useId().replace(/[^a-z0-9]/gi, "")}`
  return (
    <figure
      {...props}
      className={cx("ld-minimap", className)}
      data-slot="hud-minimap"
      data-wash={wash}
      data-route={route}
      style={{ ...style, "--heading": `${heading}deg` } as CSSProperties}
      aria-label={`Minimap${route !== "none" && distance ? `, ${distance} to go` : ""}${WASH_LABEL[wash]}`}
    >
      <div className="ld-minimap__view" aria-hidden="true">
        <div className="ld-minimap__tilt">
          <svg className="ld-minimap__world" viewBox="0 0 2000 2000">
            <defs>
              <linearGradient id={fade} gradientUnits="userSpaceOnUse" x1="1000" y1="985" x2="1000" y2="900">
                <stop offset="0" className="ld-minimap__stop" stopOpacity="0" />
                <stop offset="1" className="ld-minimap__stop" />
              </linearGradient>
              <pattern id={`${fade}g`} width="230" height="200" patternUnits="userSpaceOnUse" x="10" y="20">
                <rect className="ld-minimap__street" width="230" height="200" />
                <rect className="ld-minimap__block" x="20" y="20" width="190" height="160" rx="4" />
              </pattern>
            </defs>
            <rect className="ld-minimap__land" width="2000" height="2000" />
            <path className="ld-minimap__city" fill={`url(#${fade}g)`} d="M560 2000V420h620l300-160h520v1740z" />
            <path className="ld-minimap__water" d="M0 0h720c-60 120-180 170-300 230S120 420 0 470z" />
            <g className="ld-minimap__roads">
              <path d={ROAD} strokeWidth="64" />
              <path d="M0 600h2000" strokeWidth="56" />
              <path d="M300 2000L1500 0" strokeWidth="48" />
              <path d="M0 1250h2000" strokeWidth="44" />
            </g>
          </svg>
        </div>
        <span className="ld-minimap__wash" />
        <div className="ld-minimap__tilt">
          <svg className="ld-minimap__world" viewBox="0 0 2000 2000">
            <g className="ld-minimap__route" stroke={`url(#${fade})`}>
              <path d={ROUTE} />
              <path className="ld-minimap__route-core" d={ROUTE} />
            </g>
          </svg>
        </div>
        {route !== "none" && distance && <span className="ld-minimap__distance">{distance}</span>}
        <span className="ld-minimap__player">
          <Navigation2 fill="currentColor" strokeWidth={0} />
        </span>
      </div>
      <span className="ld-minimap__north" data-slot="hud-minimap-north" aria-hidden="true" style={pin(NORTH - heading)}>
        N
      </span>
      {blips.map((blip) => (
        <span key={blip.id} className="ld-minimap__blip" data-slot="hud-minimap-blip" data-kind={blip.kind} style={pin(blip.bearing - heading)} title={blip.label}>
          {BLIP_GLYPH[blip.kind]}
          <span className="ld-sr">{blip.label}</span>
        </span>
      ))}
    </figure>
  )
}

type TurnCardProps = HTMLAttributes<HTMLDivElement> & { turn: "left" | "right"; distance: string; tone?: "mission" | "waypoint"; label?: string }

/* GPS turn card above the minimap while driving a route: navy text block and a route-coloured arrow badge. A new turn is announced; the counting distance isn't. */
function TurnCard({ turn, distance, tone = "mission", label, className, ...props }: TurnCardProps): ReactElement {
  const instruction = label ?? (turn === "right" ? "Turn Right" : "Turn Left")
  useAnnouncement(instruction)
  return (
    <div {...props} className={cx("ld-turn", className)} data-slot="hud-turn" data-tone={tone} data-turn={turn}>
      <p className="ld-turn__text">
        <b>{instruction}</b>
        <span>{distance}</span>
      </p>
      <span className="ld-turn__badge" aria-hidden="true">
        <svg viewBox="0 0 32 32" data-turn={turn}>
          <path d="M9 28V12.5h14" />
          <path d="M18 6.5l6 6-6 6" />
        </svg>
      </span>
    </div>
  )
}

export { edgePoint, HudMinimap, TurnCard }
export type { Blip, Route, Wash }
