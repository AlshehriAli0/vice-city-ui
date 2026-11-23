import {
  SegmentedControl as SegmentedControlRoot,
  SegmentedControlIndicator as SegmentedControlIndicatorRoot,
  SegmentedControlItem as SegmentedControlItemRoot,
} from "@ui-sdk/react/segmented-control";
import type { ComponentProps } from "react";

import { merge, styled } from "../../shared/class-names";

import "../shared/kit-theme.css";
import "./segmented-control.css";

type SegmentedControlProps = ComponentProps<typeof SegmentedControlRoot> & { size?: "sm" | "md" };

const SegmentedControl = ({ size = "md", className, ...props }: SegmentedControlProps) => (
  <SegmentedControlRoot {...props} className={merge("vc-segments", className)} data-size={size} />
);

const SegmentedControlItem = styled(SegmentedControlItemRoot, "vc-segments__item");
const SegmentedControlIndicator = styled(SegmentedControlIndicatorRoot, "vc-segments__indicator");

export { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem };
export type { SegmentedControlProps };
