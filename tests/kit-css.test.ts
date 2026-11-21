import { describe, expect, test } from "vitest";

const stylesheetSources = import.meta.glob<string>("../src/ui/*.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

const rules = Object.entries(stylesheetSources).flatMap(([path, source]) => {
  const file = path.split("/").pop() ?? path;
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    file,
    selectors: selector
      .trim()
      .split(/,(?![^(]*\))/)
      .map(part => part.trim()),
    body,
  }));
});

const withoutNot = (selector: string) => selector.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, "");
const declared = (body: string, property: string) => new RegExp(`(^|;|\\s)${property}\\s*:\\s*([^;]+)`).exec(body)?.[2];

describe("kit stylesheets", () => {
  test("disabled parts dim by the one --vc-disabled token", () => {
    expect(Object.keys(stylesheetSources).length).toBeGreaterThan(30);
    const literal = rules.flatMap(({ file, selectors, body }) => {
      const opacity = declared(body, "opacity");
      const disabled = selectors.some(part => /disabled|unavailable/.test(withoutNot(part)));
      return disabled && opacity && !["var(--vc-disabled)", "1"].includes(opacity.trim())
        ? [`${file}: ${selectors.join(", ")} -> ${opacity}`]
        : [];
    });
    expect(literal).toEqual([]);
  });

  test("hover never paints the selection bar on a disabled row", () => {
    const leaks = rules.flatMap(({ file, selectors, body }) =>
      /background:\s*var\(--vc-row\)/.test(body)
        ? selectors
            .filter(part => part.includes(":hover") && !part.includes("disabled"))
            .map(part => `${file}: ${part}`)
        : []
    );
    expect(leaks).toEqual([]);
  });

  test("hovering the chosen chip keeps it solid white", () => {
    const chosen: Record<string, string> = {
      "segmented-control.css": "data-checked",
      "toggle-group.css": "data-pressed",
      "tabs.css": "data-selected",
    };
    const leaks = rules.flatMap(({ file, selectors, body }) =>
      chosen[file] && /background/.test(body)
        ? selectors
            .filter(part => part.includes(":hover") && !part.includes(chosen[file]))
            .map(part => `${file}: ${part}`)
        : []
    );
    expect(leaks).toEqual([]);
  });

  test("motion uses the shared duration tokens; only looping animations set their own", () => {
    const raw = rules.flatMap(({ file, body }) =>
      ["transition", "transition-duration", "animation", "animation-duration"].flatMap(property => {
        const value = declared(body, property);
        const timed = value && value.trim() !== "none" && !declared(body, "animation-timeline");
        return timed && !/var\(--vc-(fast|base)\)|infinite/.test(value) ? [`${file}: ${property}: ${value}`] : [];
      })
    );
    expect(raw).toEqual([]);
  });
});
