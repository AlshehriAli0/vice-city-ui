import {
  Slider as SliderRoot,
  SliderControl as SliderControlRoot,
  SliderIndicator as SliderIndicatorRoot,
  SliderThumb as SliderThumbRoot,
  SliderTrack as SliderTrackRoot,
  SliderValue as SliderValueRoot,
} from "@ui-sdk/react/slider";
import type { ComponentProps } from "react";

import { merge, styled } from "../../shared/class-names";

import "../shared/kit-theme.css";
import "./slider.css";

type SliderProps = ComponentProps<typeof SliderRoot> & { thumbLabels?: string[]; showValue?: boolean };

const Slider = ({ thumbLabels, showValue = true, className, children, ...props }: SliderProps) => {
  const initial = props.value ?? props.defaultValue ?? props.min ?? 0;
  const count = Array.isArray(initial) ? initial.length : 1;
  return (
    <SliderRoot {...props} className={merge("vc-slider", className)}>
      {children ?? (
        <>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              {Array.from({ length: count }, (_, index) => (
                <SliderThumb key={thumbLabels?.[index] ?? index} index={index} aria-label={thumbLabels?.[index]} />
              ))}
            </SliderTrack>
          </SliderControl>
          {showValue && <SliderValue />}
        </>
      )}
    </SliderRoot>
  );
};

const SliderControl = styled(SliderControlRoot, "vc-slider__control");
const SliderTrack = styled(SliderTrackRoot, "vc-slider__track");
const SliderIndicator = styled(SliderIndicatorRoot, "vc-slider__fill");
const SliderThumb = styled(SliderThumbRoot, "vc-slider__thumb");
const SliderValue = styled(SliderValueRoot, "vc-slider__value");

export { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue };
export type { SliderProps };
