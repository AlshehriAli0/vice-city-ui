import type { ReactElement, ReactNode } from "react";

function Stage({
  scene,
  className,
  children,
}: {
  scene: boolean;
  className: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div className={className} data-scene={scene ? "" : undefined}>
      {children}
    </div>
  );
}

export { Stage };
