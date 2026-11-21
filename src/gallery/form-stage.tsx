import type { ReactElement } from "react";

function FormStage({ center, children }: { center?: boolean; children: ReactElement | ReactElement[] }): ReactElement {
  return <div className={center ? "cf-panel cf-stage cf-stage--center" : "cf-panel cf-stage"}>{children}</div>;
}

export { FormStage };
