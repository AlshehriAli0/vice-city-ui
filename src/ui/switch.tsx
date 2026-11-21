import { Switch as SwitchRoot, SwitchThumb as SwitchThumbRoot } from "@ui-sdk/react/switch";
import { useId, type ComponentProps, type ReactElement, type ReactNode } from "react";

import { cx, merge, styled } from "./cx";

import "./ui.css";
import "./switch.css";

type SwitchProps = ComponentProps<typeof SwitchRoot> & { size?: "sm" | "md" | "lg" };

type SwitchRowProps = Omit<SwitchProps, "children"> & {
  children: ReactNode;
  description?: ReactNode;
  showState?: boolean;
};

function Switch(props: SwitchProps | SwitchRowProps): ReactElement {
  if (isRow(props)) return <SwitchRow {...props} />;
  const { size = "md", className, ...rest } = props;
  return <SwitchRoot {...rest} className={merge("vc-switch", className)} data-size={size} />;
}

const SwitchThumb = styled(SwitchThumbRoot, "vc-switch__thumb");

function SwitchState({ className, ...props }: Omit<ComponentProps<"span">, "children">): ReactElement {
  return <span aria-hidden="true" {...props} className={cx("vc-switch-state", className)} />;
}

function isRow(props: SwitchProps | SwitchRowProps): props is SwitchRowProps {
  return typeof props.children === "string" || "showState" in props || "description" in props;
}

function SwitchRow({
  children,
  description,
  size = "md",
  showState,
  className,
  ...props
}: SwitchRowProps): ReactElement {
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
}

export { Switch, SwitchState, SwitchThumb };
export type { SwitchProps };
