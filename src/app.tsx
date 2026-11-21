import { OverlayHost } from "@ui-sdk/react/overlays"
import { useEffect, useLayoutEffect, useRef, useState, type ReactElement } from "react"
import { LeonidaToasts } from "./leonida/mission-toast"
import type { Hour } from "./leonida/time-of-day"
import { SegmentedControl, SegmentedControlItem } from "./ui/segmented-control"
import { Toggle } from "./ui/toggle-group"
import { BY_ID } from "./site/catalog"
import { DetailPage } from "./site/detail"
import { HomePage } from "./site/home"
import { useRoute } from "./site/route"
import { Search } from "./site/search"
import { ViceText } from "./ui/vice-text"

const HOURS = [
  { value: "day", label: "Day" },
  { value: "sunset", label: "Sunset" },
  { value: "night", label: "Night" },
]

// The rockstargames.com/VI theme that matches each hour.
const SKY: Record<Hour, string> = { day: "blueSky", sunset: "blackout", night: "night" }

function savedHour(): Hour {
  try {
    const saved = localStorage.getItem("vc-hour")
    if (saved === "day" || saved === "sunset" || saved === "night") return saved
  } catch {}
  return "sunset"
}

function App(): ReactElement {
  const [hour, setHour] = useState<Hour>(savedHour)
  const [still, setStill] = useState(false)
  const route = useRoute()
  // Where the reader was on the catalogue, so Back lands them on the card they opened.
  const homeScroll = useRef(0)
  const lastId = useRef<string | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = hour
    document.documentElement.dataset.sky = SKY[hour]
    try {
      localStorage.setItem("vc-hour", hour)
    } catch {}
  }, [hour])
  useLayoutEffect(() => {
    document.documentElement.dataset.motion = still ? "still" : "live"
  }, [still])

  useLayoutEffect(() => {
    if (route.page === "component") {
      lastId.current = route.id
      document.title = `${BY_ID.get(route.id)?.name ?? "Component"} · Vice City UI`
      return
    }
    document.title = "Vice City UI"
    if (!lastId.current) return
    window.scrollTo(0, homeScroll.current)
    const card = document.querySelector<HTMLAnchorElement>(`[data-id="${lastId.current}"] .cat-card__link`)
    if (card) card.focus({ preventScroll: true })
    else document.getElementById("home-title")?.focus({ preventScroll: true })
  }, [route])

  useEffect(() => {
    if (route.page !== "home") return
    const remember = () => {
      homeScroll.current = window.scrollY
    }
    window.addEventListener("scroll", remember, { passive: true })
    return () => window.removeEventListener("scroll", remember)
  }, [route])


  return (
    <>
      <OverlayHost />
      <LeonidaToasts />
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById("main")?.focus()
        }}
      >
        Skip to content
      </a>
      <header className="topbar">
        <ViceText render={<a className="brand" href="#/" />}>Vice City UI</ViceText>
        <Search />
        <div className="topbar__tools">
          <SegmentedControl aria-label="Time of day" size="sm" value={hour} onValueChange={(next) => next && setHour(next as Hour)}>
            {HOURS.map((item) => (
              <SegmentedControlItem key={item.value} value={item.value}>
                {item.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <Toggle pressed={still} onPressedChange={setStill}>
            Still
          </Toggle>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {route.page === "component" ? <DetailPage key={route.id} id={route.id} /> : <HomePage />}
      </main>

    </>
  )
}

export { App }
