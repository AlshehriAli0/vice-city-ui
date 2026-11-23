import {
  Meter as MeterRoot,
  MeterIndicator as MeterIndicatorRoot,
  MeterLabel as MeterLabelRoot,
  MeterTrack as MeterTrackRoot,
  MeterValue as MeterValueRoot,
} from "@ui-sdk/react/meter";
import type { ComponentProps } from "react";

import { merge, styled } from "../../shared/class-names";
import { plain } from "../shared/plain-part";
import { useVital, type VitalProps } from "./progress";

import "../shared/base.css";
import "./progress.css";

type MeterProps = ComponentProps<typeof MeterRoot> & VitalProps;

const Meter = ({ tone, segments, dimWhenIdle, className, style, ...props }: MeterProps) => {
  const vital = useVital(props.value, { tone, segments, dimWhenIdle }, style);
  return <MeterRoot {...props} {...vital} className={merge("vc-vital", className)} />;
};

const MeterIcon = plain("span", "meter-icon", "vc-vital__icon");
const MeterLabel = styled(MeterLabelRoot, "vc-vital__label");
const MeterTrack = styled(MeterTrackRoot, "vc-vital__track");
const MeterIndicator = styled(MeterIndicatorRoot, "vc-vital__fill");
const MeterValue = styled(MeterValueRoot, "vc-vital__value");

export { Meter, MeterIcon, MeterIndicator, MeterLabel, MeterTrack, MeterValue };
