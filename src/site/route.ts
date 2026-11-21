import { useSyncExternalStore } from "react"

type Route = { page: "home" } | { page: "component"; id: string }

const HOME: Route = { page: "home" }

let current: { hash: string; route: Route } = { hash: "", route: HOME }

function parse(hash: string): Route {
  const [section, id] = hash.replace(/^#\/?/, "").split("/")
  return section === "c" && id ? { page: "component", id: decodeURIComponent(id) } : HOME
}

function snapshot(): Route {
  const hash = window.location.hash
  if (hash !== current.hash) current = { hash, route: parse(hash) }
  return current.route
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

function useRoute(): Route {
  return useSyncExternalStore(subscribe, snapshot, () => HOME)
}

function hrefOf(id?: string): string {
  return id ? `#/c/${encodeURIComponent(id)}` : "#/"
}

export { hrefOf, useRoute }
export type { Route }
