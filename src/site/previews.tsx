import type { ReactElement } from "react"
import { HudAmmo, HudCash, HudVitals } from "../leonida/hud-meters"
import { HudMinimap, type Blip } from "../leonida/hud-minimap"

const BLIPS: Blip[] = [
  { id: "goal", bearing: 72, kind: "destination", label: "Destination" },
  { id: "store", bearing: 290, kind: "store", label: "Store" },
]

/* The HUD at rest for its catalogue card: no heat, day minimap, vitals and cash gathered into one view. */
function CalmHud(): ReactElement {
  return (
    <div className="calm-hud">
      <div className="calm-hud__left">
        <HudVitals health={100} stamina={100} focus={100} />
        <HudMinimap heading={20} wash="none" route="none" blips={BLIPS} />
      </div>
      <div className="calm-hud__right">
        <HudCash wallet={407} bank={2480} />
        <HudAmmo clip={12} reserve={48} />
      </div>
    </div>
  )
}

// Card-only previews that replace a demo's live default when that default isn't the component's calm state.
const PREVIEWS: Record<string, () => ReactElement> = {
  "hud-meters": () => <CalmHud />,
}

export { PREVIEWS }
