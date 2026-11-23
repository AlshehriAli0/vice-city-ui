import type { ReactNode } from "react";

const FormStage = ({ center, children }: { center?: boolean; children: ReactNode }) => (
  <div className={center ? "cf-panel cf-stage cf-stage--center" : "cf-panel cf-stage"}>{children}</div>
);

export { FormStage };
