import { announce } from "@ui-sdk/core";
import { useEffect, useRef } from "react";

const useAnnouncement = (text: string | null | undefined): void => {
  const last = useRef(text);

  useEffect(() => {
    // oxlint-disable-next-line @ashstack/effects/no-event-handler -- Keep the shared accessibility live region in sync after a committed change.
    if (!text || text === last.current) return;
    last.current = text;
    announce(text);
  }, [text]);
};

export { useAnnouncement };
