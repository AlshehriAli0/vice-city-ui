import { useEffect, useEffectEvent } from "react";

import type { Playground } from "../demo";

const useAction = (subscribe: Playground["subscribeAction"], name: string, run: () => void): void => {
  const onAction = useEffectEvent(run);

  useEffect(() => {
    const unsubscribe = subscribe(name, () => onAction());
    return () => unsubscribe();
  }, [subscribe, name]);
};

export { useAction };
