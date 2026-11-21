import type { ReactElement } from "react"

// Original glyphs drawn on a 24 grid to match each icon's colour, shape and weight in the frames.
// The disc, its gradient and gloss come from CSS on [data-slot="phone-app-icon"][data-app].
const MARKS: Record<string, ReactElement> = {
  whatup: (
    <>
      <circle cx="12" cy="12" r="8.9" fill="#fff" />
      <path fill="#3d8fe0" d="M12 7.4c2.9 0 5 1.9 5 4.3S14.9 16 12 16c-.6 0-1.2-.1-1.7-.2L7.6 17l.7-2.1A4.1 4.1 0 0 1 7 11.7c0-2.4 2.1-4.3 5-4.3z" />
      <circle cx="10" cy="11.7" r=".8" fill="#fff" />
      <circle cx="12" cy="11.7" r=".8" fill="#fff" />
      <circle cx="14" cy="11.7" r=".8" fill="#fff" />
    </>
  ),
  contacts: <path fill="#fff" d="M8.3 6h2l1.1 2.9-1.4 1a7.5 7.5 0 0 0 3.9 3.9l1-1.4 2.9 1.1v2a1.5 1.5 0 0 1-1.6 1.5A10.3 10.3 0 0 1 6.8 7.6 1.5 1.5 0 0 1 8.3 6z" />,
  fitness: (
    <>
      <rect x="6.2" y="7.6" width="11.6" height="2.3" rx="1.15" fill="#ff6fb4" />
      <rect x="7.6" y="10.85" width="10.2" height="2.3" rx="1.15" fill="#a77bff" />
      <rect x="6.2" y="14.1" width="8.4" height="2.3" rx="1.15" fill="#56a7ff" />
    </>
  ),
  snapmatic: (
    <>
      <rect x="6.6" y="6.6" width="10.8" height="10.8" rx="2.4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <path fill="#fff" d="M12 15.3s-3.1-1.8-3.1-4A1.7 1.7 0 0 1 12 10.2a1.7 1.7 0 0 1 3.1 1.1c0 2.2-3.1 4-3.1 4z" />
    </>
  ),
  news: (
    <>
      <path fill="#fff" d="M8.2 6.4h8.6a.8.8 0 0 1 .8.8v9.4a1.4 1.4 0 0 1-1.4 1.4H7.8a1.4 1.4 0 0 1-1.4-1.4V9.2h1.8z" />
      <rect x="9.6" y="8.2" width="6.2" height="1.6" fill="#d7343f" />
      <rect x="9.6" y="11" width="6.2" height="1" fill="#d7343f" />
      <rect x="9.6" y="13" width="6.2" height="1" fill="#d7343f" />
      <rect x="9.6" y="15" width="4" height="1" fill="#d7343f" />
    </>
  ),
  weather: (
    <>
      <circle cx="14.4" cy="9.6" r="3" fill="#ffd34a" />
      <path fill="#fff" d="M8 17.6h7.6a2.7 2.7 0 0 0 .3-5.4 3.7 3.7 0 0 0-7 .6A2.4 2.4 0 0 0 8 17.6z" />
    </>
  ),
  waink: (
    <g fill="#fff">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse key={angle} cx="12" cy="7.4" rx="1.55" ry="3.3" transform={`rotate(${angle} 12 12)`} />
      ))}
    </g>
  ),
  settings: (
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M10.9 5h2.2l.4 1.8 1.3.6 1.6-1 1.5 1.5-1 1.6.6 1.3 1.8.4v2.2l-1.8.4-.6 1.3 1 1.6-1.5 1.5-1.6-1-1.3.6-.4 1.8h-2.2l-.4-1.8-1.3-.6-1.6 1-1.5-1.5 1-1.6-.6-1.3L5 13.1v-2.2l1.8-.4.6-1.3-1-1.6 1.5-1.5 1.6 1 1.3-.6zM12 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"
    />
  ),
}

function AppMark({ app }: { app: string }): ReactElement {
  return <svg viewBox="0 0 24 24">{MARKS[app]}</svg>
}

/* The multicolour 8-petal pinwheel used by Reminders and the Suggested label. */
function Pinwheel({ className }: { className?: string }): ReactElement {
  const petals = ["#ff6f9f", "#ffb04a", "#ffe04a", "#64d68a", "#4fc4e8", "#5b7cf0", "#9d6cf2", "#e06ad6"]
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#fff" />
      {petals.map((fill, index) => (
        <ellipse key={fill} cx="12" cy="7" rx="1.9" ry="4" fill={fill} transform={`rotate(${index * 45} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="1.6" fill="#fff" />
    </svg>
  )
}

type Weather = "sun" | "cloud" | "partly"

/* The status-row weather glyph: a small yellow sun dot, a cloud, or both. */
function WeatherGlyph({ weather, className }: { weather: Weather; className?: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {weather !== "cloud" && <circle cx={weather === "partly" ? 15 : 12} cy={weather === "partly" ? 9 : 12} r={weather === "partly" ? 4.5 : 5} fill="#f6c443" />}
      {weather !== "sun" && <path fill="#fff" d="M6 19h11a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1A3 3 0 0 0 6 19z" />}
    </svg>
  )
}

/* A 4-way D-pad. The active axis pair is filled white, the other outlined. */
function DpadGlyph({ axis }: { axis?: "vertical" | "horizontal" | "up" }): ReactElement {
  const on = (part: "up" | "down" | "left" | "right") =>
    axis === "up" ? part === "up" : axis === "vertical" ? part === "up" || part === "down" : axis === "horizontal" ? part === "left" || part === "right" : false
  const arm = (part: "up" | "down" | "left" | "right", d: string) => <path d={d} data-on={on(part) || undefined} />
  return (
    <svg className="ld-dpad" data-slot="dpad-glyph" viewBox="0 0 32 32" aria-hidden="true">
      {arm("up", "M12.6 3h6.8v7.4L16 13.8l-3.4-3.4z")}
      {arm("down", "M12.6 29h6.8v-7.4L16 18.2l-3.4 3.4z")}
      {arm("left", "M3 12.6v6.8h7.4l3.4-3.4-3.4-3.4z")}
      {arm("right", "M29 12.6v6.8h-7.4L18.2 16l3.4-3.4z")}
    </svg>
  )
}

/* A stick button, "L3", "R3", or the right stick with its up/down ticks. */
function StickGlyph({ label }: { label: "L3" | "R3" | "R" }): ReactElement {
  return (
    <span className="ld-stick" data-slot="stick-glyph" data-stick={label} aria-hidden="true">
      {label}
    </span>
  )
}

export { AppMark, DpadGlyph, Pinwheel, StickGlyph, WeatherGlyph }
export type { Weather }
