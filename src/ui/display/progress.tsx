import {
  Progress as ProgressRoot,
  ProgressIndicator as ProgressIndicatorRoot,
  ProgressLabel as ProgressLabelRoot,
  ProgressTrack as ProgressTrackRoot,
  ProgressValue as ProgressValueRoot,
} from "@ui-sdk/react/progress";
import type { ComponentProps, CSSProperties } from "react";

import { merge, styled } from "../../shared/class-names";
import { plain } from "../shared/plain-part";
import { segmentStyle, useVitalActive } from "./vital";

import "../shared/base.css";
import "./progress.css";

type VitalTone = "health" | "stamina" | "focus";

type VitalProps = {
  tone?: VitalTone;
  segments?: number | number[];
  dimWhenIdle?: boolean;
};

type StyleProp<S> = CSSProperties | ((state: S) => CSSProperties | undefined) | undefined;

const withVars = <S,>(vars: CSSProperties | undefined, style: StyleProp<S>): StyleProp<S> => {
  if (!vars) return style;
  return typeof style === "function" ? (state: S) => ({ ...vars, ...style(state) }) : { ...vars, ...style };
};

const useVital = <S,>(
  value: number | null | undefined,
  { tone = "health", segments, dimWhenIdle }: VitalProps,
  style: StyleProp<S>
) => {
  const active = useVitalActive(value ?? null, Boolean(dimWhenIdle));
  return {
    "data-tone": tone,
    "data-segmented": segments ? "" : undefined,
    "data-idle": dimWhenIdle && !active ? "" : undefined,
    style: withVars(segmentStyle(segments), style),
  };
};

type ProgressProps = ComponentProps<typeof ProgressRoot> & VitalProps;

const Progress = ({ tone, segments, dimWhenIdle, className, style, ...props }: ProgressProps) => {
  const vital = useVital(props.value, { tone, segments, dimWhenIdle }, style);
  return <ProgressRoot {...props} {...vital} className={merge("vc-vital", className)} />;
};

const ProgressIcon = plain("span", "progress-icon", "vc-vital__icon");
const ProgressLabel = styled(ProgressLabelRoot, "vc-vital__label");
const ProgressTrack = styled(ProgressTrackRoot, "vc-vital__track");
const ProgressIndicator = styled(ProgressIndicatorRoot, "vc-vital__fill");
const ProgressValue = styled(ProgressValueRoot, "vc-vital__value");

export { Progress, ProgressIcon, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue, useVital };
export type { VitalProps, VitalTone };
