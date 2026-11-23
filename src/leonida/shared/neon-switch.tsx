import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import type { ComponentProps, ReactNode } from "react";

import { merge } from "../../shared/class-names";

import "./neon-switch.css";

type NeonSwitchProps = Omit<ComponentProps<typeof Switch>, "children"> & { children: ReactNode };

const NeonSwitch = ({ children, className, ...props }: NeonSwitchProps) => (
  <label className="ld-toggle" data-disabled={props.disabled ? true : undefined}>
    <span className="ld-toggle__label">{children}</span>
    <span className="ld-toggle__state" aria-hidden="true">
      <span data-when="on">On</span>
      <span data-when="off">Off</span>
    </span>
    <Switch {...props} className={merge("ld-toggle__track", className)}>
      <SwitchThumb className="ld-toggle__knob" />
    </Switch>
  </label>
);

export { NeonSwitch };
export type { NeonSwitchProps };
