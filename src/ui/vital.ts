import { useEffect, useState } from "react";

import type { CssVariables } from "./css-variables";

const IDLE_DELAY = 3000;

const useVitalActive = (value: number | null, enabled: boolean): boolean => {
  const [activity, setActivity] = useState({ value, enabled, expired: false });

  if (!Object.is(activity.value, value) || activity.enabled !== enabled) {
    setActivity({ value, enabled, expired: false });
  }

  useEffect(() => {
    if (!activity.enabled || activity.expired) return undefined;

    const timer = setTimeout(() => {
      setActivity(current => (current === activity ? { ...activity, expired: true } : current));
    }, IDLE_DELAY);

    return () => clearTimeout(timer);
  }, [activity]);

  return enabled && !activity.expired;
};

const segmentStyle = (segments: number | number[] | undefined): CssVariables | undefined => {
  if (!segments) return undefined;
  if (typeof segments === "number") return { "--segments": segments };

  const stops = segments.map(
    at =>
      `#000 calc(${at * 100}% - 1px), transparent calc(${at * 100}% - 1px) calc(${at * 100}% + 1px), #000 calc(${at * 100}% + 1px)`
  );
  return { "--vital-mask": `linear-gradient(90deg, #000 0, ${stops.join(", ")}, #000 100%)` };
};

export { segmentStyle, useVitalActive };
