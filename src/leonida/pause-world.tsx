import type { ReactElement } from "react";

function PauseWorld(): ReactElement {
  return (
    <div className="ld-pause__world" aria-hidden="true">
      <div className="ld-pause__sky" />
      <div className="ld-pause__lights">
        <i data-l="1" />
        <i data-l="2" />
        <i data-l="3" />
        <i data-l="4" />
        <i data-l="5" />
      </div>
    </div>
  );
}

export { PauseWorld };
