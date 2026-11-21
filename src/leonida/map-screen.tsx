import { Button } from "@ui-sdk/react/button"
import { Radio, RadioGroup } from "@ui-sdk/react/radio"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import { BookOpen, Car, Dumbbell, MapPin, Navigation2, Shirt, Utensils, Wallet, type LucideIcon } from "lucide-react"
import { createController } from "@ui-sdk/core"
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from "react"
import { ButtonPrompt, ButtonPrompts, PadGlyph, type Glyph } from "./button-prompt"
import { GameScreen } from "./game-screen"
import { ART, BLIPS } from "./map-screen.blips"
import { MAX_ZOOM, MIN_ZOOM, MapCameraParts, type MapCameraController, type Target } from "./map-screen.camera"
import { project, route, routeLength, unproject, type Point } from "./map-screen.route"
import "./map-screen.css"

/* Pistol-gun by John Colburn and swap-bag by Lorc, game-icons.net, CC BY 3.0. */
const PISTOL =
  "M79.238 115.768l-28.51 67.863h406.15l-.273-67.862h-263.83v55.605h-15v-55.605h-16.68v55.605H146.1v-55.605h-17.434v55.605h-15v-55.605H79.238zm387.834 15.96v40.66h18.688v-40.66h-18.688zM56.768 198.63l20.566 32.015L28.894 406.5l101.68 7.174 21.54-97.996h115.74l14.664-80.252 174.55-3.873-.13-32.922H56.767zM263.44 235.85l-11.17 61.142h-96.05l12.98-59.05 12.53-.278-2.224 35.5 14.262 13.576 1.003-33.65 24.69-16.264 43.98-.976z"
const BAG =
  "M363.783 23.545c-9.782.057-16.583 3.047-20.744 10.22-17.51 30.18-38.432 61.645-48.552 97.245 2.836.83 5.635 1.787 8.373 2.853 7.353 2.863 14.38 6.482 20.542 10.858 27.534-25.542 58.165-45.21 87.45-65.462 11.356-7.854 12.273-13.584 10.183-20.83-2.09-7.246-9.868-16.365-20.525-23.176-10.658-6.81-23.87-11.33-34.73-11.68-.68-.022-1.345-.03-1.997-.027zm-68.998.746c-10.02-.182-17.792 6.393-23.924 20.24-8.94 20.194-10.212 53.436-1.446 83.185.156-.008.31-.023.467-.03 1.99-.087 3.99-.072 6 .03 9.436-34.822 27.966-64.72 44.013-91.528-10.31-8.496-18.874-11.782-25.108-11.896zM197.5 82.5L187 97.97c14.82 10.04 29.056 19.725 39.813 31.374 3.916 4.24 7.37 8.722 10.31 13.607 3.77-4.73 8.51-8.378 13.69-10.792.407-.188.82-.355 1.228-.53-3.423-5.44-7.304-10.418-11.51-14.972C227.765 102.83 212.29 92.52 197.5 82.5zm223.77 12.27c-29.255 20.228-58.575 39.152-84.348 62.78.438.576.848 1.168 1.258 1.76 20.68-6.75 49.486-15.333 73.916-19.41 11.484-1.916 15.66-6.552 17.574-13.228 1.914-6.676.447-16.71-5.316-26.983-.924-1.647-1.96-3.29-3.083-4.92zm-223.938 47.87c-14.95.2-29.732 4.3-43.957 12.766l9.563 16.03c21.657-12.89 42.626-14.133 65.232-4.563.52-5.592 1.765-10.66 3.728-15.21.35-.806.73-1.586 1.123-2.354-11.87-4.52-23.83-6.827-35.688-6.67zm75.8 3.934c-5.578-.083-10.597.742-14.427 2.526-4.377 2.038-7.466 4.914-9.648 9.97-.884 2.047-1.572 4.54-1.985 7.494.456-.007.91-.03 1.365-.033 16.053-.084 32.587 2.77 49.313 9.19 7.714 2.96 15.062 7.453 22.047 13.184 3.217-2.445 4.99-4.72 5.773-6.535 1.21-2.798 1.095-5.184-.634-8.82-3.46-7.275-15.207-16.955-28.856-22.27-6.824-2.658-13.98-4.224-20.523-4.614-.818-.05-1.627-.08-2.424-.092zm-24.757 38.457c-22.982.075-44.722 7.386-65 19.782-32.445 19.835-60.565 53.124-80.344 90.032-19.777 36.908-31.133 77.41-31.186 110.53-.053 33.06 10.26 57.27 32.812 67.782.043.02.082.043.125.063h.032c24.872 11.51 65.616 19.337 108.407 20.092 42.79.756 87.79-5.457 121.874-20.187 21.96-9.49 34.545-28.452 40.5-54.156 5.954-25.705 4.518-57.657-2.375-89.314-6.894-31.657-19.2-63.06-34.095-87.875-14.894-24.814-32.614-42.664-48.063-48.593-14.664-5.627-28.898-8.2-42.687-8.156z"

function Glyph512({ d }: { d: string }): ReactElement {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  )
}

type Category = { value: string; label: string; icon: ReactElement; title: string; text: string; isNew?: boolean }

const lucide = (Icon: LucideIcon, fill?: boolean) => <Icon aria-hidden="true" strokeWidth={2.5} fill={fill ? "currentColor" : "none"} />

const CATEGORIES: Category[] = [
  { value: "nav", label: "Navigation", icon: lucide(Navigation2, true), title: "Waypoint", text: "Set a waypoint and the route shows on the minimap." },
  { value: "story", label: "Story", icon: lucide(BookOpen), title: "Task Name", text: "Placeholder description of a story task.", isNew: true },
  { value: "robberies", label: "Robberies", icon: <Glyph512 d={BAG} />, title: "Task Name", text: "Placeholder description of a robbery." },
  { value: "activities", label: "Activities", icon: lucide(Dumbbell), title: "Gym", text: "Work out to build up strength." },
  { value: "vehicles", label: "Vehicles", icon: lucide(Car), title: "Garage", text: "Store and repair your vehicles." },
  { value: "ammu", label: "Ammu-Nation", icon: <Glyph512 d={PISTOL} />, title: "Ammu-Nation", text: "Buy weapons, ammo and outfits." },
  { value: "style", label: "Style", icon: lucide(Shirt, true), title: "Clothing Store", text: "Change your look and lose the heat on a known outfit." },
  { value: "food", label: "Food & Drink", icon: lucide(Utensils), title: "Diner", text: "Eat to top up your health." },
]

const TABS = [
  { value: "characters", label: "Jason" },
  { value: "map", label: "Map" },
  { value: "brief", label: "Brief" },
  { value: "progress", label: "Progress" },
]

const FILTERS = [
  { value: "all", label: "All" },
  { value: "dialogue", label: "Dialogue" },
  { value: "help", label: "Help Text" },
  { value: "objective", label: "Objective Text" },
]

// Placeholder log: no dialogue or objectives from the game.
const LOG = [
  { id: "l1", type: "objective", text: "Go to the *marker*." },
  { id: "l2", type: "dialogue", text: "Character: Placeholder line of dialogue." },
  { id: "l3", type: "help", text: "Hold the stick to *sprint*." },
  { id: "l4", type: "dialogue", text: "Character: Another placeholder line." },
  { id: "l5", type: "objective", text: "Lose the *cops*." },
  { id: "l6", type: "help", text: "Changing your outfit lowers *heat*." },
]

const TILES = [
  { value: "stats", label: "Stats", image: "/vc/art-vice-city.jpg" },
  { value: "vehicles", label: "Vehicles", image: "/vc/ue-vapid-stanier.jpg" },
  { value: "weapons", label: "Weapons" },
  { value: "animals", label: "Animals", image: "/vc/art-port-gellhorn.jpg" },
]

const STATS = [
  ["Time played", "12h 40m"],
  ["Distance travelled", "84.2 mi"],
  ["Cash earned", "$12,400"],
  ["Vehicles stolen", "23"],
  ["Times wanted", "17"],
  ["Photos taken", "41"],
]

function rich(text: string): ReactElement[] {
  return text.split(/\*([^*]+)\*/g).map((part, index) => (index % 2 ? <em key={index}>{part}</em> : <span key={index}>{part}</span>))
}

/* L3 / R3: the stick glyph, a white disc with the label in it. */
function StickPrompt({ stick, children, onClick }: { stick: "L3" | "R3"; children: string; onClick: () => void }): ReactElement {
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
  )
}

type View = "3d" | "2d"

const PLAYER = "nav"
const METRES_PER_MILE = 1609.344

type MapScreenProps = {
  // The open tab: characters, map, brief or progress.
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  cash?: number
  time?: string
  onExit?: () => void
  // The map's zoom, 1 at its usual scale, from MIN_ZOOM (the whole map) to MAX_ZOOM.
  zoom?: number
  defaultZoom?: number
  onZoomChange?: (zoom: number) => void
  // The legend category whose blip has the GPS route, "marker" for your own marker, or null.
  destination?: string | null
  defaultDestination?: string | null
  onDestinationChange?: (destination: string | null) => void
  view?: View
  defaultView?: View
  onViewChange?: (view: View) => void
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
  const [ownTab, setOwnTab] = useState(defaultValue)
  const tab = value ?? ownTab
  const setTab = (next: string) => {
    if (next === tab) return
    setOwnTab(next)
    onValueChange?.(next)
  }
  const [opening, setOpening] = useState(true)
  const [category, setCategory] = useState("story")
  const [ownView, setOwnView] = useState(defaultView)
  const flat = (view ?? ownView) === "2d"
  const [ownDestination, setOwnDestination] = useState(defaultDestination)
  const goal = destination === undefined ? ownDestination : destination
  // Your marker, in world units so it stays put across the 2D and 3D views.
  const [marker, setMarker] = useState<Point | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [tile, setTile] = useState("stats")
  const [camera] = useState(() => createController<MapCameraController>())
  const at = TABS.findIndex((item) => item.value === tab)
  const tileAt = TILES.findIndex((item) => item.value === tile)
  const hoveredCategory = CATEGORIES.find((item) => item.value === hovered)

  const targets = useMemo<Target[]>(() => {
    const blips = CATEGORIES.map((item) => {
      const [x, y] = BLIPS[item.value][flat ? "flat" : "tilted"]
      return { value: item.value, x, y }
    })
    if (!marker) return blips
    const [x, y] = project(marker, flat)
    return [...blips, { value: "marker", x, y }]
  }, [flat, marker])
  const worldOf = (target: string | null): Point | undefined => (target === "marker" ? (marker ?? undefined) : target ? BLIPS[target]?.world : undefined)
  const goalPoint = worldOf(goal)
  const path = useMemo(() => (goalPoint ? route(BLIPS[PLAYER].world, goalPoint) : null), [goalPoint])
  const hoveredPoint = hovered === PLAYER ? undefined : worldOf(hovered)
  const miles = useMemo(() => (hoveredPoint ? routeLength(route(BLIPS[PLAYER].world, hoveredPoint)) / METRES_PER_MILE : null), [hoveredPoint])

  const look = (next: string) => {
    setCategory(next)
    camera.glideTo(next)
  }
  const setView = (next: View) => {
    setOwnView(next)
    onViewChange?.(next)
  }
  // The same spot stays under the cursor when the view flips.
  const shown = useRef(flat)
  useLayoutEffect(() => {
    if (shown.current === flat) return
    const centre = camera.centre()
    const [x, y] = project(unproject([centre.x, centre.y], shown.current), flat)
    shown.current = flat
    camera.jumpTo({ x, y })
  }, [camera, flat])
  const setGoal = (next: string | null) => camera.setDestination(next)
  const pressDestination = () => {
    if (hovered) return setGoal(goal === hovered ? null : hovered)
    setMarker(unproject([camera.centre().x, camera.centre().y], flat))
    setGoal("marker")
  }
  const pressMarker = () => {
    if (marker) {
      setMarker(null)
      if (goal === "marker") setGoal(null)
      return
    }
    if (hoveredCategory) return
    setMarker(unproject([camera.centre().x, camera.centre().y], flat))
  }

  useEffect(() => {
    const timer = setTimeout(() => setOpening(false), 1150)
    return () => clearTimeout(timer)
  }, [])

  const bump = (by: number) => setTab(TABS[(at + by + TABS.length) % TABS.length].value)
  const prompt = (glyph: Glyph, label: string, onClick: () => void, muted?: boolean) => (
    <ButtonPrompt glyph={glyph} onClick={onClick} muted={muted} disabled={muted} focusableWhenDisabled>
      {label}
    </ButtonPrompt>
  )
  const routeLine = path?.map((p) => project(p, flat).map((n) => n.toFixed(0)).join(" ")).join(" L")
  const markerAt = marker && project(marker, flat)

  return (
    <GameScreen className="ld-map" data-opening={opening || undefined} data-tab={tab}>
      <div className="ld-map__dim" aria-hidden="true" />
      <Tabs className="ld-map__tabs" value={tab} onValueChange={(next) => next && setTab(next as string)}>
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
            onZoomChange={onZoomChange && ((next) => onZoomChange(next))}
            destination={goal}
            onDestinationChange={(next) => {
              setOwnDestination(next)
              onDestinationChange?.(next)
            }}
            onHoverChange={setHovered}
          >
            <MapCameraParts.World className="ld-map__layer">
              {/* Pre-rendered by scripts/gen-map.py. */}
              <img className="ld-map__art" src={flat ? "/vc/map-2d.svg" : "/vc/map-3d.svg"} alt="" draggable={false} />
              {routeLine && (
                <svg className="ld-map__route" viewBox={`0 0 ${ART.width} ${ART.height}`}>
                  <path d={`M${routeLine}`} />
                </svg>
              )}
              {CATEGORIES.map((item) => {
                const [x, y] = BLIPS[item.value][flat ? "flat" : "tilted"]
                return (
                  <span
                    key={item.value}
                    className="ld-map__blip"
                    data-active={item.value === hovered || undefined}
                    style={{ "--x": `${x}px`, "--y": `${y}px` } as CSSProperties}
                  >
                    {item.icon}
                    {item.value === hovered && miles !== null && <span className="ld-map__miles">{miles.toFixed(2)} mi</span>}
                  </span>
                )
              })}
              {markerAt && <MapPin className="ld-map__marker" style={{ "--x": `${markerAt[0]}px`, "--y": `${markerAt[1]}px` } as CSSProperties} />}
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

          <RadioGroup className="ld-map__rail" aria-label="Map legend" value={category} onValueChange={(next) => next && look(next as string)}>
            {CATEGORIES.map((item) => (
              <Radio key={item.value} value={item.value} className="ld-map__cat" aria-label={item.label}>
                {item.icon}
                {item.isNew && <span className="ld-map__new" />}
              </Radio>
            ))}
          </RadioGroup>

          <article className="ld-map__card ld-map__mission">
            <span className="ld-map__avatar" aria-hidden="true">
              {lucide(BookOpen)}
            </span>
            <h3>Task Name</h3>
            <p>Placeholder objective text for the current task, over two lines.</p>
          </article>

          <p className="ld-map__chip">Vice City</p>
          <p className="ld-map__objective">{rich("Go to the *marker*.")}</p>
        </TabsPanel>

        <TabsPanel value="brief" className="ld-map__panel ld-map__panel--plum">
          <RadioGroup className="ld-map__filters" aria-label="Brief filter" value={filter} onValueChange={(next) => next && setFilter(next as string)}>
            {FILTERS.map((item) => (
              <label key={item.value} className="ld-map__filter" data-active={item.value === filter || undefined}>
                <Radio value={item.value} className="ld-map__filter-radio" />
                {item.label}
              </label>
            ))}
          </RadioGroup>
          <ul className="ld-map__log">
            {LOG.filter((entry) => filter === "all" || entry.type === filter).map((entry) => (
              <li key={entry.id}>{rich(entry.text)}</li>
            ))}
          </ul>
        </TabsPanel>

        <TabsPanel value="progress" className="ld-map__panel ld-map__panel--plum">
          <RadioGroup className="ld-map__tiles" aria-label="Progress" value={tile} onValueChange={(next) => next && setTile(next as string)}>
            <div className="ld-map__strip" style={{ "--at": Math.max(0, tileAt - 2) } as CSSProperties}>
              {TILES.map((item) => (
                <Radio key={item.value} value={item.value} className="ld-map__tile" aria-label={item.label}>
                  {item.image ? <img src={item.image} alt="" /> : <Glyph512 d={PISTOL} />}
                  <span>{item.label}</span>
                </Radio>
              ))}
            </div>
          </RadioGroup>
          <p className="ld-map__count" aria-hidden="true">
            <b>{tileAt + 1}</b> <i>/</i> {TILES.length}
          </p>
        </TabsPanel>

        <TabsPanel value="characters" className="ld-map__panel ld-map__panel--plum">
          <div className="ld-map__people" aria-hidden="true">
            <img src="/vc/art-jason.jpg" alt="" />
          </div>
          <table className="ld-map__stats">
            <caption>Stats</caption>
            <tbody>
              {STATS.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsPanel>

        <header className="ld-map__header">
          {tab === "map" && <p className="ld-map__clock">{time}</p>}
          <div className="ld-map__tabbar">
            <Button className="ld-map__bumper" aria-label="Previous tab" onClick={() => bump(-1)}>
              <PadGlyph glyph="L1" />
            </Button>
            <TabsList className="ld-map__tablist" aria-label="Map menu">
              {TABS.map((item) => (
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
      ) : (
        <ButtonPrompts label="Map prompts">{prompt("circle", "Exit", () => onExit?.())}</ButtonPrompts>
      )}
    </GameScreen>
  )
}

export { CATEGORIES as MAP_CATEGORIES, MAX_ZOOM as MAP_MAX_ZOOM, MIN_ZOOM as MAP_MIN_ZOOM, MapScreen, TABS as MAP_TABS }
export type { MapScreenProps, View as MapView }
