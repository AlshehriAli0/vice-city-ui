import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./leonida/tokens.css";
import "./leonida/parts.css";
import "./site.css";
import { App } from "./app";

const reloadOnceForStaleChunk = (): void => {
  try {
    const last = Number(sessionStorage.getItem("vc-chunk-reload"));
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem("vc-chunk-reload", String(Date.now()));
  } catch {
    return;
  }
  location.reload();
};

window.addEventListener("vite:preloadError", reloadOnceForStaleChunk);

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
