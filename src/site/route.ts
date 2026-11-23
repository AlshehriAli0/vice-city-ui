import { useSyncExternalStore } from "react";

type Route = { page: "home" } | { page: "component"; id: string };

const HOME: Route = { page: "home" };

let current: { hash: string; route: Route } = { hash: "", route: HOME };

const parse = (hash: string): Route => {
  const [section, id] = hash.replace(/^#\/?/, "").split("/");
  if (section !== "c" || !id) return HOME;
  try {
    return { page: "component", id: decodeURIComponent(id) };
  } catch {
    return HOME;
  }
};

const snapshot = (): Route => {
  const hash = window.location.hash;
  if (hash !== current.hash) current = { hash, route: parse(hash) };
  return current.route;
};

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

const useRoute = (): Route => useSyncExternalStore(subscribe, snapshot, () => HOME);

const hrefOf = (id?: string): string => (id ? `#/c/${encodeURIComponent(id)}` : "#/");

export { hrefOf, useRoute };
export type { Route };
