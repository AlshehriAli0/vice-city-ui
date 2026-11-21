import {
  SegmentedControl as SegmentedControlRoot,
  SegmentedControlIndicator as SegmentedControlIndicatorRoot,
  SegmentedControlItem as SegmentedControlItemRoot,
} from "@ui-sdk/react/segmented-control";
import type { ComponentProps, ReactElement } from "react";

import { merge, styled } from "./cx";

import "./ui.css";
import "./segmented-control.css";

type SegmentedControlProps = ComponentProps<typeof SegmentedControlRoot> & { size?: "sm" | "md" };

function SegmentedControl({ size = "md", className, ...props }: SegmentedControlProps): ReactElement {
  return <SegmentedControlRoot {...props} className={merge("vc-segments", className)} data-size={size} />;
}

const SegmentedControlItem = styled(SegmentedControlItemRoot, "vc-segments__item");
const SegmentedControlIndicator = styled(SegmentedControlIndicatorRoot, "vc-segments__indicator");

export { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem };
export type { SegmentedControlProps };
