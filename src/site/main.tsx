import { App } from "./app";
import { mountSite } from "./mount-site";

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

mountSite(<App />);
