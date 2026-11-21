import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import type { ComponentProps, ReactElement, ReactNode } from "react"
import { merge, styled } from "../ui/cx"
import "./game-ui.css"
import "./postcard-tabs.css"

type Place = {
  value: string
  name: string
  region: string
  blurb: string
  scene: "beach" | "keys" | "swamp" | "port" | "plant" | "peak"
}

const PLACES: Place[] = [
  {
    value: "vice-city",
    name: "Vice City",
    region: "Leonida's neon heart",
    blurb: "Pastel hotels, chrome bumpers and a skyline that never once went to bed early.",
    scene: "beach",
  },
  {
    value: "leonida-keys",
    name: "Leonida Keys",
    region: "Island chain",
    blurb: "One road, forty bridges and a bar at the end of each of them.",
    scene: "keys",
  },
  {
    value: "grassrivers",
    name: "Grassrivers",
    region: "Wetlands",
    blurb: "Airboats at dawn. The gators have seen things, and they're not talking.",
    scene: "swamp",
  },
  {
    value: "port-gellhorn",
    name: "Port Gellhorn",
    region: "Gulf coast",
    blurb: "Rust, cranes and motels with a vacancy sign that's been lit since 1987.",
    scene: "port",
  },
  {
    value: "ambrosia",
    name: "Ambrosia",
    region: "Sugar country",
    blurb: "Cane fields, refinery smoke and a biker bar that only takes cash.",
    scene: "plant",
  },
  {
    value: "mount-kalaga",
    name: "Mount Kalaga",
    region: "National park",
    blurb: "The only hill in the state. Locals call it a mountain, and you'd better too.",
    scene: "peak",
  },
]

// Each place's section theme on rockstargames.com/VI.
const SKY: Record<Place["scene"], string> = {
  beach: "dustyNeon",
  keys: "blueSky",
  swamp: "swamp",
  port: "hotSun",
  plant: "night",
  peak: "swamp",
}

/* A ui-sdk Tabs of "Visit Leonida" postcards: arrow keys flip between regions. */
function PostcardTabs({ defaultValue = PLACES[0].value, className, ...props }: ComponentProps<typeof Tabs>): ReactElement {
  return <Tabs {...props} defaultValue={props.value === undefined ? defaultValue : undefined} className={merge("ld-postcards", className)} />
}

/* The row of region names with its sliding underline. */
function PostcardTabsList({ className, children, ...props }: Omit<ComponentProps<typeof TabsList>, "children"> & { children?: ReactNode }): ReactElement {
  return (
    <TabsList {...props} className={merge("ld-postcards__list", className)}>
      {children}
      <TabsIndicator className="ld-postcards__indicator" />
    </TabsList>
  )
}

const PostcardTab = styled(TabsTab, "ld-postcards__tab")

type PostcardProps = Omit<ComponentProps<typeof TabsPanel>, "value" | "children"> & { place: Place }

/* One region's panel: the official postcard art and its caption. */
function Postcard({ place, className, ...props }: PostcardProps): ReactElement {
  return (
    <TabsPanel {...props} value={place.value} className={merge("ld-postcard", className)} data-scene={place.scene} data-sky={SKY[place.scene]}>
      <figure className="ld-postcard__card" data-slot="postcard-card" aria-hidden="true">
        <img className="ld-postcard__photo" src={`/vc/art-${place.value.replace("mount-", "")}.jpg`} alt="" loading="lazy" />
        <img className="ld-postcard__frame" src={`/vc/frame-${place.value}.png`} alt="" loading="lazy" />
      </figure>
      <div className="ld-postcard__copy" data-slot="postcard-copy">
        <h4 className="ld-postcard__name">{place.name}</h4>
        <p className="ld-postcard__region">{place.region}</p>
        <p className="ld-postcard__blurb">{place.blurb}</p>
      </div>
    </TabsPanel>
  )
}

export { PLACES, Postcard, PostcardTab, PostcardTabs, PostcardTabsList }
export type { Place }
