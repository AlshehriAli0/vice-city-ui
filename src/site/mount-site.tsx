import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import "../leonida/shared/tokens.css";
import "./site.css";

const mountSite = (page: ReactNode): void => {
  const root = document.getElementById("root");
  if (!root) throw new Error("Missing #root");

  createRoot(root).render(<StrictMode>{page}</StrictMode>);
};

export { mountSite };
