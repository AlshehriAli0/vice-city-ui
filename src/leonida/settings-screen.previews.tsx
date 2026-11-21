import type { ReactElement } from "react"
import type { Preview } from "./settings-screen.data"

/* Line-art previews in the settings style: thin white strokes on a dark translucent plum box. Our own drawings. */

const LEGEND = [
  { label: "Player", color: "#1f1f24", ring: "#fff" },
  { label: "Companion", color: "#4fb6f0" },
  { label: "Objective", color: "#ff6b9f" },
  { label: "Enemy", color: "#e0393b" },
  { label: "Personal", color: "#33d6c0" },
  { label: "Main Missions", color: "#ff6b9f" },
  { label: "Side Missions", color: "#b994f0" },
  { label: "Gangs", color: "#f4c542" },
  { label: "Robberies", color: "#5cc95c" },
]

function Legend(): ReactElement {
  return (
    <ul className="ld-set__legend" aria-label="Colours">
      {LEGEND.map((item) => (
        <li key={item.label}>
          <i style={{ background: item.color, borderColor: item.ring }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

function Reticle({ shape }: { shape: string }): ReactElement | null {
  if (shape === "Off") return null
  if (shape === "Dot") return <circle cx="353" cy="203" r="3" className="pv-solid" />
  if (shape === "Simple") return <path d="M353 191v8M353 207v8M341 203h8M357 203h8" className="pv-solid" />
  return <path d="M336 197h11M359 197h11M353 203v9" className="pv-solid" />
}

function Street({ reticle }: { reticle: string }): ReactElement {
  return (
    <svg className="ld-set__art" viewBox="0 0 707 398" aria-hidden="true">
      <path d="M76 0v226M128 0v234M128 14h30M76 210l-76 52M128 234h-12M158 14v80h72v22h260M250 0v80M560 0v130h-112M560 130l60 0M648 0v95l-64 2v90M705 70l-30 18v40l-24 8v100" />
      <path d="M0 262l178 -40M178 222l240 0M418 222l290 98M0 336l112 -70M112 266h168M280 266l60 132M178 222l-66 44M650 318l-80 -60M560 140v120M596 186v20M584 196h20" />
      <path d="M60 280h86l-6 12h-86z" />
      <Reticle shape={reticle} />
    </svg>
  )
}

function Prompts(): ReactElement {
  return (
    <svg className="ld-set__art" viewBox="0 0 707 398" aria-hidden="true">
      <path d="M150 320c60-90 150-140 280-150 90-6 150 10 190 40M210 330c50-70 120-110 220-116M560 230l60 60M480 170l40-60h90" />
      <circle cx="300" cy="190" r="26" className="pv-ring" />
      <circle cx="300" cy="190" r="12" className="pv-ring" />
      <circle cx="372" cy="190" r="26" className="pv-ring" />
      <circle cx="372" cy="190" r="12" className="pv-ring" />
    </svg>
  )
}

function Flash(): ReactElement {
  return (
    <div className="ld-set__art ld-set__flash" aria-hidden="true">
      <i />
    </div>
  )
}

function Hits(): ReactElement {
  return (
    <svg className="ld-set__art" viewBox="0 0 707 398" aria-hidden="true">
      {[
        [90, 60],
        [150, 300],
        [600, 80],
        [640, 320],
        [70, 200],
        [560, 210],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="22" className="pv-blot" />
      ))}
    </svg>
  )
}

function Hud(): ReactElement {
  return (
    <svg className="ld-set__art" viewBox="0 0 707 398" aria-hidden="true">
      <rect x="30" y="268" width="150" height="100" rx="4" />
      <circle cx="105" cy="318" r="5" className="pv-solid" />
      <circle cx="70" cy="290" r="6" className="pv-pink" />
      <circle cx="150" cy="340" r="6" className="pv-pink" />
      <path d="M30 380h150M560 30h120M600 46h80" />
    </svg>
  )
}

const LEFT = ["Map", "Loadout", "Aim / Interact", "Phone", "Radio Menu", "Quick Navigation", "Partner Menu", "Run", "Move"]
const RIGHT = ["Pause", "Cover", "Shoot", "Interact", "Melee", "Reload", "Jump / Climb", "Look Behind", "Look"]

/* CONTROL SCHEME: a controller drawn in line art with callouts either side. */
function Controller({ title }: { title: string }): ReactElement {
  return (
    <div className="ld-set__pad" aria-hidden="true">
      <p className="ld-set__pad-title">{title}</p>
      <ul className="ld-set__callouts" data-side="left">
        {LEFT.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
      <svg className="ld-set__pad-art" viewBox="0 0 340 230">
        <path d="M72 34L268 34C300 40 316 70 322 110L334 190C338 214 322 228 304 224C292 222 284 212 276 198L256 160C250 150 242 146 230 146L110 146C98 146 90 150 84 160L64 198C56 212 48 222 36 224C18 228 2 214 6 190L18 110C24 70 40 40 72 34Z" />
        <path d="M118 26h104v62c0 8-6 14-14 14h-76c-8 0-14-6-14-14z" />
        <circle cx="122" cy="132" r="22" />
        <circle cx="218" cy="132" r="22" />
        <circle cx="122" cy="132" r="12" />
        <circle cx="218" cy="132" r="12" />
        <path d="M62 66h10v-10h10v10h10v10h-10v10h-10v-10h-10z" />
        <circle cx="270" cy="54" r="8" />
        <circle cx="290" cy="72" r="8" />
        <circle cx="250" cy="72" r="8" />
        <circle cx="270" cy="90" r="8" />
        <path d="M60 22l14-12h40M280 22l-14-12h-40" />
      </svg>
      <ul className="ld-set__callouts" data-side="right">
        {RIGHT.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
    </div>
  )
}

function PreviewArt({ kind, value }: { kind: Preview; value: string }): ReactElement | null {
  if (kind === "street") return <Street reticle={value} />
  if (kind === "prompts") return <Prompts />
  if (kind === "flash") return <Flash />
  if (kind === "hits") return <Hits />
  if (kind === "hud") return <Hud />
  return null
}

export { Controller, Legend, PreviewArt }
