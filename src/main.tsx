import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./leonida/tokens.css";
import "./leonida/parts.css";
import "./site.css";
import { App } from "./app";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
