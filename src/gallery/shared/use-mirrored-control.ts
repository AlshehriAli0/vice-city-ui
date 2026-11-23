import { useState } from "react";

import type { Value } from "../demo";

const useMirroredControl = <T extends Value>(value: T, onChange: (next: T) => void): [T, (next: T) => void] => {
  const [override, setOverride] = useState<{ from: T; to: T }>();
  if (override && override.from !== value) setOverride(undefined);

  return [
    override?.to ?? value,
    next => {
      setOverride({ from: value, to: next });
      onChange(next);
    },
  ];
};

export { useMirroredControl };
