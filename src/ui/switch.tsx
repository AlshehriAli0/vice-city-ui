import { Switch as SwitchRoot, SwitchThumb as SwitchThumbRoot } from "@ui-sdk/react/switch";
import { useId, type ComponentProps, type ReactNode } from "react";

import { cx, merge, styled } from "./cx";

import "./ui.css";
import "./switch.css";

type SwitchProps = ComponentProps<typeof SwitchRoot> & { size?: "sm" | "md" | "lg" };

type SwitchRowProps = Omit<SwitchProps, "children"> & {
  children: ReactNode;
  description?: ReactNode;
  showState?: boolean;
};

const Switch = (props: SwitchProps | SwitchRowProps) => {
  if (isRow(props)) return <SwitchRow {...props} />;
  const { size = "md", className, ...rest } = props;
  return <SwitchRoot {...rest} className={merge("vc-switch", className)} data-size={size} />;
};

const SwitchThumb = styled(SwitchThumbRoot, "vc-switch__thumb");

const SwitchState = ({ className, ...props }: Omit<ComponentProps<"span">, "children">) => (
  <span aria-hidden="true" {...props} className={cx("vc-switch-state", className)} />
);

const isRow = (props: SwitchProps | SwitchRowProps): props is SwitchRowProps =>
  typeof props.children === "string" || "showState" in props || "description" in props;

const SwitchRow = ({ children, description, size = "md", showState, className, ...props }: SwitchRowProps) => {
  const hintId = useId();
  return (
    <div className="vc-switch-row" data-size={size}>
      <label className="vc-switch-row__hit">
        <span className="vc-switch-row__label">{children}</span>
        {showState && <SwitchState className="vc-switch-row__state" />}
        <SwitchRoot
          {...props}
          className={merge("vc-switch", className)}
          data-size={size}
          aria-describedby={description ? hintId : undefined}
        >
          <SwitchThumb />
        </SwitchRoot>
      </label>
      {description && (
        <span className="vc-switch-row__hint" id={hintId}>
          {description}
        </span>
      )}
    </div>
  );
};

export { Switch, SwitchState, SwitchThumb };
export type { SwitchProps };
