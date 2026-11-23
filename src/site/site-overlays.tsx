import { OverlayHost } from "@ui-sdk/react/overlays";

import { LeonidaToasts } from "../leonida/notifications/mission-toast";

const SiteOverlays = () => (
  <>
    <OverlayHost />
    <LeonidaToasts />
  </>
);

export { SiteOverlays };
