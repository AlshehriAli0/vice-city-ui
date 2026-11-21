import {
  Progress as ProgressRoot,
  ProgressIndicator as ProgressIndicatorRoot,
  ProgressLabel as ProgressLabelRoot,
  ProgressTrack as ProgressTrackRoot,
  ProgressValue as ProgressValueRoot,
} from "@ui-sdk/react/progress"
import type { ComponentProps, CSSProperties, ReactElement } from "react"
import { merge, styled } from "./cx"
import { plain } from "./plain"
import { segmentStyle, useVitalActive } from "./vital"
import "./base.css"
import "./progress.css"

type VitalTone = "health" | "stamina" | "focus"

type VitalProps = {
  tone?: VitalTone
  // Health is cut into segments by 2px gaps: a count of equal cells, or cut points from 0 to 1.
  segments?: number | number[]
  // Rest at 40% and brighten for about 3s whenever the value changes, like the HUD vitals.
  dimWhenIdle?: boolean
}

type StyleProp<S> = CSSProperties | ((state: S) => CSSProperties | undefined) | undefined

function withVars<S>(vars: CSSProperties | undefined, style: StyleProp<S>): StyleProp<S> {
  if (!vars) return style
  return typeof style === "function" ? (state: S) => ({ ...vars, ...style(state) }) : { ...vars, ...style }
}

function useVital<S>(value: number | null | undefined, { tone = "health", segments, dimWhenIdle }: VitalProps, style: StyleProp<S>) {
  const active = useVitalActive(value ?? null, Boolean(dimWhenIdle))
  return {
    "data-tone": tone,
    "data-segmented": segments ? "" : undefined,
    "data-idle": dimWhenIdle && !active ? "" : undefined,
    style: withVars(segmentStyle(segments), style),
  }
}

type ProgressProps = ComponentProps<typeof ProgressRoot> & VitalProps

// GTA VI's vitals bar: a 10px square bar after a 20px icon disc, pastel fill over a dark track.
function Progress({ tone, segments, dimWhenIdle, className, style, ...props }: ProgressProps): ReactElement {
  const vital = useVital(props.value, { tone, segments, dimWhenIdle }, style)
  return <ProgressRoot {...props} {...vital} className={merge("vc-vital", className)} />
}

const ProgressIcon = plain("span", "progress-icon", "vc-vital__icon")
const ProgressLabel = styled(ProgressLabelRoot, "vc-vital__label")
const ProgressTrack = styled(ProgressTrackRoot, "vc-vital__track")
const ProgressIndicator = styled(ProgressIndicatorRoot, "vc-vital__fill")
const ProgressValue = styled(ProgressValueRoot, "vc-vital__value")

export { Progress, ProgressIcon, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue, useVital }
export type { VitalProps, VitalTone }
