import { useEffect, useState } from "react";

type MenuPhase = "closed" | "open" | "closing";

const CLOSE_MS = 500;

const useMenuPhase = (open: boolean): MenuPhase => {
  const [phase, setPhase] = useState<MenuPhase>(open ? "open" : "closed");
  if (open && phase !== "open") setPhase("open");
  if (!open && phase === "open") setPhase("closing");

  useEffect(() => {
    if (phase !== "closing") return undefined;
    const timer = setTimeout(() => setPhase("closed"), CLOSE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return phase;
};

export { useMenuPhase };
export type { MenuPhase };
