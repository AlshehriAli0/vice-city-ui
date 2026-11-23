import type { ReactNode } from "react";

const Stage = ({ scene, className, children }: { scene: boolean; className: string; children: ReactNode }) => (
  <div className={className} data-scene={scene ? "" : undefined}>
    {children}
  </div>
);

export { Stage };
